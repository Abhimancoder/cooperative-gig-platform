/**
 * Socket.io real-time service for booking tracking and notifications
 */

const connectedUsers = new Map(); // userId -> socketId
const connectedProviders = new Map(); // providerId -> socketId

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join', ({ userId, role }) => {
      socket.join(`user_${userId}`);
      connectedUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} (${role}) joined room`);

      if (role === 'PROVIDER') {
        socket.join(`provider_${userId}`);
        connectedProviders.set(userId, socket.id);
      }

      socket.emit('connected', { message: 'Connected to CoopServe real-time service' });
    });

    // Provider sends location update
    socket.on('provider_location', ({ bookingId, latitude, longitude, providerId }) => {
      // Broadcast to customer tracking that booking
      io.to(`booking_track_${bookingId}`).emit('location_update', { latitude, longitude, providerId });
    });

    // Customer subscribes to track a booking
    socket.on('track_booking', ({ bookingId }) => {
      socket.join(`booking_track_${bookingId}`);
      console.log(`📍 Tracking booking ${bookingId}`);
    });

    // Provider accepts a job
    socket.on('job_accepted', ({ bookingId, customerId, providerName }) => {
      io.to(`user_${customerId}`).emit('booking_accepted', {
        bookingId,
        message: `${providerName} has accepted your booking!`,
      });
    });

    // Provider starts job
    socket.on('job_started', ({ bookingId, customerId }) => {
      io.to(`user_${customerId}`).emit('booking_started', {
        bookingId,
        message: 'Your service provider is on the way!',
      });
    });

    // Chat message between customer and provider
    socket.on('send_message', ({ bookingId, senderId, message, senderName }) => {
      io.to(`booking_track_${bookingId}`).emit('receive_message', {
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      // Clean up maps
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) connectedUsers.delete(userId);
      }
      for (const [providerId, socketId] of connectedProviders.entries()) {
        if (socketId === socket.id) connectedProviders.delete(providerId);
      }
    });
  });
};

const isUserOnline = (userId) => connectedUsers.has(userId);

module.exports = { initializeSocket, isUserOnline };
