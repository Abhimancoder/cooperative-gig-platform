// src/services/notificationService.js

const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const prisma = new PrismaClient();

// ── Email Transporter ────────────────────────────────────────────────────────
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Save a notification to the database and emit via Socket.io if available
 */
const createNotification = async (userId, title, message, type = "SYSTEM", metadata = null, io = null) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, metadata },
    });

    // Real-time emit if socket.io instance is available
    if (io) {
      io.to(`user:${userId}`).emit("notification:new", notification);
    }

    return notification;
  } catch (err) {
    console.error("[NotificationService] createNotification error:", err.message);
    return null;
  }
};

/**
 * Send push notification via FCM REST API
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken || !process.env.FCM_SERVER_KEY) return;

  try {
    const payload = {
      to: fcmToken,
      notification: { title, body },
      data,
    };

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${process.env.FCM_SERVER_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[NotificationService] FCM error:", errText);
    }
  } catch (err) {
    console.error("[NotificationService] sendPushNotification error:", err.message);
  }
};

/**
 * Send transactional OTP email
 */
const sendOtpEmail = async (to, otp) => {
  if (!process.env.SMTP_USER) {
    console.warn("[NotificationService] SMTP not configured; skipping email");
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Your OTP - Cooperative Gig Platform",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
          <h2 style="color:#2563eb">Cooperative Gig Platform</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="letter-spacing:8px;color:#1e40af">${otp}</h1>
          <p style="color:#6b7280;font-size:13px">This OTP expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. Do not share it with anyone.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[NotificationService] sendOtpEmail error:", err.message);
  }
};

/**
 * Notify provider about new booking
 */
const notifyProviderNewBooking = async (providerId, booking, io = null) => {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: { user: { select: { id: true, fcmToken: true } } },
  });
  if (!provider) return;

  await createNotification(
    provider.user.id,
    "New Booking Request",
    `You have a new booking for ${booking.service?.name || "a service"} scheduled on ${new Date(booking.scheduledAt).toLocaleDateString("en-IN")}`,
    "BOOKING",
    { bookingId: booking.id },
    io
  );

  await sendPushNotification(
    provider.user.fcmToken,
    "New Booking Request",
    `Booking scheduled on ${new Date(booking.scheduledAt).toLocaleDateString("en-IN")}`,
    { bookingId: booking.id, type: "BOOKING" }
  );
};

/**
 * Notify customer about booking status change
 */
const notifyCustomerBookingStatus = async (customerId, status, booking, io = null) => {
  const statusMessages = {
    ACCEPTED: "Your booking has been accepted by the provider!",
    IN_PROGRESS: "Your service is now in progress.",
    COMPLETED: "Your booking has been completed. Please leave a review!",
    CANCELLED: "Your booking has been cancelled.",
  };

  const message = statusMessages[status] || `Your booking status changed to ${status}`;

  await createNotification(customerId, "Booking Update", message, "BOOKING", { bookingId: booking.id }, io);

  const customer = await prisma.user.findUnique({
    where: { id: customerId },
    select: { fcmToken: true },
  });
  if (customer) {
    await sendPushNotification(customer.fcmToken, "Booking Update", message, {
      bookingId: booking.id,
      type: "BOOKING",
    });
  }
};

module.exports = {
  createNotification,
  sendPushNotification,
  sendOtpEmail,
  notifyProviderNewBooking,
  notifyCustomerBookingStatus,
};
