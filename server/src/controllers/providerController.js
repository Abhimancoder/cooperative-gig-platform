const { PrismaClient } = require('@prisma/client');
const { findMatchingProviders } = require('../services/matchingService');

const prisma = new PrismaClient();

const getProviderProfile = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.id },
      include: { user: true, reviews: { include: { customer: true }, take: 10, orderBy: { createdAt: 'desc' } } },
    });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider profile not found' });
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get provider profile' });
  }
};

const updateProviderProfile = async (req, res) => {
  try {
    const { bio, skills, experience, city, latitude, longitude } = req.body;
    const provider = await prisma.provider.update({
      where: { userId: req.user.id },
      data: { bio, skills, experience, city, latitude, longitude },
    });
    res.json({ success: true, message: 'Profile updated', data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

const submitKyc = async (req, res) => {
  try {
    const kycDocumentUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!kycDocumentUrl) return res.status(400).json({ success: false, message: 'KYC document required' });

    const provider = await prisma.provider.update({
      where: { userId: req.user.id },
      data: { kycStatus: 'PENDING', kycDocumentUrl },
    });
    res.json({ success: true, message: 'KYC submitted. Awaiting approval.', data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit KYC' });
  }
};

const getAvailableProviders = async (req, res) => {
  try {
    const { serviceId, latitude, longitude, category } = req.query;
    if (latitude && longitude) {
      const providers = await findMatchingProviders({ serviceCategory: category || '', customerLat: parseFloat(latitude), customerLon: parseFloat(longitude) });
      return res.json({ success: true, data: providers });
    }
    const providers = await prisma.provider.findMany({
      where: { isApproved: true, isAvailable: true },
      include: { user: { select: { name: true, avatar: true } } },
      take: 20,
    });
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get providers' });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    const updated = await prisma.provider.update({
      where: { userId: req.user.id },
      data: { isAvailable: !provider.isAvailable },
    });
    res.json({ success: true, message: `You are now ${updated.isAvailable ? 'available' : 'offline'}`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
};

const getProviderJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const where = { providerId: provider.id };
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { service: true, customer: { select: { name: true, phone: true, avatar: true } } },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ success: true, data: jobs, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get jobs' });
  }
};

const getProviderEarnings = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({ where: { userId: req.user.id } });
    if (!provider) return res.status(404).json({ success: false, message: 'Provider not found' });

    const completedJobs = await prisma.booking.findMany({
      where: { providerId: provider.id, status: 'COMPLETED' },
      select: { providerEarning: true, platformFee: true, totalAmount: true, completedAt: true, service: { select: { name: true } } },
      orderBy: { completedAt: 'desc' },
    });

    const summary = {
      totalEarnings: provider.totalEarnings,
      totalJobs: provider.totalJobs,
      welfareContribution: provider.welfareContribution,
      rating: provider.rating,
      recentJobs: completedJobs.slice(0, 10),
      platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'),
      welfareFundPercent: parseFloat(process.env.WELFARE_FUND_PERCENT || '2'),
    };

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get earnings' });
  }
};

module.exports = { getProviderProfile, updateProviderProfile, submitKyc, getAvailableProviders, updateAvailability, getProviderJobs, getProviderEarnings };
