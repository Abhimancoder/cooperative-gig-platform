const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalProviders, totalBookings, totalRevenue,
      bookingsToday, pendingKyc, activeVotes, newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.provider.count({ where: { isApproved: true } }),
      prisma.booking.count(),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { platformFee: true } }),
      prisma.booking.count({ where: { createdAt: { gte: today } } }),
      prisma.provider.count({ where: { kycStatus: 'PENDING' } }),
      prisma.cooperativeVote.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    // Bookings by status
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Revenue last 7 days
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const rev = await prisma.payment.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: date, lt: nextDate } },
        _sum: { amount: true },
      });

      revenueData.push({
        date: date.toISOString().split('T')[0],
        revenue: rev._sum.amount || 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers, totalProviders, totalBookings,
        totalRevenue: totalRevenue._sum.platformFee || 0,
        bookingsToday, pendingKyc, activeVotes, newUsersThisWeek,
        bookingsByStatus, revenueData,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status === 'pending') where.kycStatus = 'PENDING';
    if (status === 'approved') where.isApproved = true;
    if (status === 'rejected') where.kycStatus = 'REJECTED';

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { user: { select: { name: true, phone: true, email: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.provider.count({ where }),
    ]);

    res.json({ success: true, data: providers, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get providers' });
  }
};

const approveProvider = async (req, res) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: { isApproved: true, kycStatus: 'APPROVED', cooperativeMember: true },
      include: { user: true },
    });
    res.json({ success: true, message: `Provider ${provider.user.name} approved and added to cooperative`, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve provider' });
  }
};

const rejectProvider = async (req, res) => {
  try {
    const provider = await prisma.provider.update({
      where: { id: req.params.id },
      data: { kycStatus: 'REJECTED' },
    });
    res.json({ success: true, message: 'Provider KYC rejected', data: provider });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reject provider' });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { service: true, customer: { select: { name: true, phone: true } }, provider: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ success: true, data: bookings, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get bookings' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        select: { id: true, name: true, phone: true, email: true, role: true, isActive: true, isVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get users' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'User deactivated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to deactivate user' });
  }
};

module.exports = { getDashboardStats, getAllProviders, approveProvider, rejectProvider, getAllBookings, getAllUsers, deactivateUser };
