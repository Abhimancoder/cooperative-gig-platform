const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, phone, email, role = 'CUSTOMER' } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this phone already exists. Please login instead.' });
    }

    // Create user
    const user = await prisma.user.create({
      data: { name, phone, email: email || null, role },
    });

    // If PROVIDER, create provider profile
    if (role === 'PROVIDER') {
      await prisma.provider.create({ data: { userId: user.id } });
    }

    // DEMO MODE: Always use 123456 as OTP
    const otp = process.env.NODE_ENV === 'development' ? '123456' : generateOTP();
    otpStore.set(phone, { otp, expires: Date.now() + 10 * 60 * 1000 });

    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Registered successfully! Use OTP: 123456',
      data: { userId: user.id, phone, role },
      otp, // Always show in response for demo
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: `Registration failed: ${error.message}` });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    // DEMO MODE: Always use 123456 as OTP
    const otp = process.env.NODE_ENV === 'development' ? '123456' : generateOTP();
    otpStore.set(phone, { otp, expires: Date.now() + 10 * 60 * 1000 });

    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent! Use OTP: 123456 for demo',
      otp, // Always show for demo
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: `Login failed: ${error.message}` });
  }
};

/**
 * POST /api/auth/verify-otp
 */
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const stored = otpStore.get(phone);
    if (!stored) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > stored.expires) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpStore.delete(phone);

    // Mark user as verified
    const user = await prisma.user.update({
      where: { phone },
      data: { isVerified: true },
      include: { provider: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    res.json({
      success: true,
      message: 'Login successful!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          provider: user.provider,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

/**
 * POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { provider: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};

/**
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, avatar },
    });
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
};

module.exports = { register, login, verifyOtp, refreshToken, getMe, updateProfile };
