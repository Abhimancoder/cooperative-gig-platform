// src/utils/helpers.js

const { PAGINATION } = require("./constants");

/**
 * Standard API response formatter
 */
const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Parse pagination params from query string
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build pagination meta for response
 */
const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

/**
 * Haversine formula - distance between two lat/lon points in kilometers
 */
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Generate a 6-digit numeric OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Calculate platform fee and provider earning
 */
const calculateFees = (totalAmount) => {
  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || 10);
  const welfarePct = parseFloat(process.env.WELFARE_CONTRIBUTION_PERCENT || 2);
  const platformFee = parseFloat(((totalAmount * platformFeePercent) / 100).toFixed(2));
  const welfareContribution = parseFloat(((totalAmount * welfarePct) / 100).toFixed(2));
  const providerEarning = parseFloat((totalAmount - platformFee).toFixed(2));
  return { platformFee, providerEarning, welfareContribution };
};

/**
 * Mask a phone number for display: e.g. +91 98765 ***** -> +91 98765 43210
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, "*") + phone.slice(-4);
};

/**
 * Async wrapper to avoid try/catch in every controller
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Sleep utility for testing / rate limiting
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  sendSuccess,
  sendError,
  getPagination,
  paginationMeta,
  haversineDistance,
  generateOtp,
  calculateFees,
  maskPhone,
  asyncHandler,
  sleep,
};
