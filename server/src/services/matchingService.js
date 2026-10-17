// src/services/matchingService.js
// Smart provider matching: Haversine distance + rating + availability + skills

const { PrismaClient } = require("@prisma/client");
const { haversineDistance } = require("../utils/helpers");

const prisma = new PrismaClient();

const MAX_RADIUS_KM = 20; // Default search radius

/**
 * Score a provider based on distance, rating, total jobs, and cooperative membership
 * Lower score = better match (distance is a penalty)
 */
const computeScore = (provider, customerLat, customerLon) => {
  let score = 0;

  if (provider.latitude != null && provider.longitude != null) {
    const dist = haversineDistance(
      customerLat,
      customerLon,
      provider.latitude,
      provider.longitude
    );
    provider._distance = parseFloat(dist.toFixed(2));
    score += dist * 2; // Distance penalty (weighted)
  } else {
    provider._distance = null;
    score += MAX_RADIUS_KM * 2; // Penalise unknown location
  }

  // Rating bonus: max 5 stars -> subtract up to 10 from score
  score -= (provider.rating || 0) * 2;

  // Jobs experience bonus
  const jobBonus = Math.min(provider.totalJobs / 20, 5);
  score -= jobBonus;

  // Cooperative member bonus
  if (provider.cooperativeMember) score -= 3;

  return score;
};

/**
 * Find best matching providers for a booking
 * @param {string} serviceCategory - category of service requested
 * @param {string[]} requiredSkills - skills array from service
 * @param {number} customerLat
 * @param {number} customerLon
 * @param {number} radiusKm - search radius in km
 * @param {number} limit - max providers to return
 */
const findMatchingProviders = async ({
  serviceCategory,
  requiredSkills = [],
  customerLat,
  customerLon,
  radiusKm = MAX_RADIUS_KM,
  limit = 5,
}) => {
  // Fetch all approved, available providers
  const providers = await prisma.provider.findMany({
    where: {
      isApproved: true,
      isAvailable: true,
      kycStatus: "APPROVED",
    },
    include: {
      user: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  let candidates = providers;

  // Filter by skills overlap if required
  if (requiredSkills.length > 0) {
    candidates = providers.filter((p) => {
      const providerSkills = (p.skills || []).map((s) => s.toLowerCase());
      return requiredSkills.some((rs) =>
        providerSkills.includes(rs.toLowerCase())
      );
    });
    // If no skills match, fall back to all providers (graceful degradation)
    if (candidates.length === 0) {
      candidates = providers;
    }
  }

  // Filter by category if skills contain category keyword
  const categoryCandidates = candidates.filter((p) => {
    const skills = (p.skills || []).map((s) => s.toLowerCase());
    return skills.some((s) => s.includes(serviceCategory.toLowerCase()));
  });
  if (categoryCandidates.length > 0) candidates = categoryCandidates;

  // Filter by geographic radius (only when lat/lon is available)
  if (customerLat != null && customerLon != null) {
    const withinRadius = candidates.filter((p) => {
      if (p.latitude == null || p.longitude == null) return true; // Include if location unknown
      const dist = haversineDistance(customerLat, customerLon, p.latitude, p.longitude);
      return dist <= radiusKm;
    });
    if (withinRadius.length > 0) candidates = withinRadius;
  }

  // Score and sort
  const scored = candidates.map((p) => {
    const score = computeScore(p, customerLat, customerLon);
    return { ...p, _score: parseFloat(score.toFixed(3)) };
  });

  scored.sort((a, b) => a._score - b._score);

  return scored.slice(0, limit).map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.user.name,
    phone: p.user.phone,
    skills: p.skills,
    rating: p.rating,
    totalJobs: p.totalJobs,
    cooperativeMember: p.cooperativeMember,
    distance: p._distance,
    score: p._score,
  }));
};

/**
 * Auto-assign best provider to a booking
 */
const autoAssignProvider = async (bookingId, serviceCategory, customerLat, customerLon) => {
  const matches = await findMatchingProviders({
    serviceCategory,
    customerLat,
    customerLon,
    limit: 1,
  });

  if (matches.length === 0) return null;

  const best = matches[0];

  await prisma.booking.update({
    where: { id: bookingId },
    data: { providerId: best.id },
  });

  return best;
};

module.exports = {
  findMatchingProviders,
  autoAssignProvider,
  haversineDistance,
};
