const { PrismaClient } = require('@prisma/client');
const { findMatchingProviders } = require('../services/matchingService');
const { sendNotification } = require('../services/notificationService');

const prisma = new PrismaClient();

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '10');
const WELFARE_FUND_PERCENT = parseFloat(process.env.WELFARE_FUND_PERCENT || '2');

/**
 * POST /api/bookings — Create booking with smart provider matching
 */
const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledAt, address, latitude, longitude, notes } = req.body;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found or inactive' });
    }

    const platformFee = (service.basePrice * PLATFORM_FEE_PERCENT) / 100;
    const welfareFee = (service.basePrice * WELFARE_FUND_PERCENT) / 100;
    const providerEarning = service.basePrice - platformFee - welfareFee;

    // Find best matching provider
    const providers = await findMatchingProviders({ serviceCategory: service.category, customerLat: latitude, customerLon: longitude, limit: 1 });
    const selectedProvider = providers[0] || null;

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.id,
        providerId: selectedProvider?.id || null,
        serviceId,
        scheduledAt: new Date(scheduledAt),
        address,
        latitude,
        longitude,
        notes,
        totalAmount: service.basePrice,
        platformFee,
        providerEarning,
        status: selectedProvider ? 'PENDING' : 'PENDING',
      },
      include: { service: true, provider: { include: { user: true } } },
    });

    // Notify matched provider
    if (selectedProvider) {
      const io = req.app.get('io');
      io.to(`provider_${selectedProvider.id}`).emit('new_booking', {
        bookingId: booking.id,
        service: service.name,
        address,
        scheduledAt,
        amount: providerEarning,
      });
      await sendNotification(selectedProvider.userId, 'New Job Request!', `You have a new booking for ${service.name}`);
    }

    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

/**
 * GET /api/bookings — Get my bookings
 */
const getMyBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === 'CUSTOMER') where.customerId = req.user.id;
    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
      if (provider) where.providerId = provider.id;
    }
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { service: true, provider: { include: { user: true } }, review: true },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
};

/**
 * GET /api/bookings/:id
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { service: true, provider: { include: { user: true } }, customer: true, review: true, payment: true },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Check ownership
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (booking.customerId !== req.user.id && booking.providerId !== provider?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get booking' });
  }
};

/**
 * PUT /api/bookings/:id/status — Provider updates booking status
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: { service: true },
    });

    // Notify customer
    const io = req.app.get('io');
    io.to(`user_${booking.customerId}`).emit('booking_status_update', {
      bookingId: booking.id,
      status,
      serviceName: updatedBooking.service.name,
    });

    await sendNotification(booking.customerId, 'Booking Update', `Your booking status is now: ${status}`);

    // If completed, update provider stats
    if (status === 'COMPLETED') {
      await prisma.provider.update({
        where: { id: booking.providerId },
        data: {
          totalJobs: { increment: 1 },
          totalEarnings: { increment: booking.providerEarning },
        },
      });
    }

    res.json({ success: true, message: 'Status updated', data: updatedBooking });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/**
 * PUT /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel a booking in progress or completed' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelReason: reason },
    });

    res.json({ success: true, message: 'Booking cancelled', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
};

/**
 * POST /api/bookings/:id/review
 */
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.customerId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });
    if (booking.status !== 'COMPLETED') return res.status(400).json({ success: false, message: 'Can only review completed bookings' });

    const existing = await prisma.review.findUnique({ where: { bookingId: req.params.id } });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await prisma.review.create({
      data: { bookingId: booking.id, customerId: req.user.id, providerId: booking.providerId, rating, comment },
    });

    // Update provider rating
    const allReviews = await prisma.review.findMany({ where: { providerId: booking.providerId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.provider.update({ where: { id: booking.providerId }, data: { rating: avgRating } });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, updateBookingStatus, cancelBooking, addReview };
