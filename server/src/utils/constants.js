// src/utils/constants.js

const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Cleaning",
  "Painting",
  "Appliance Repair",
  "Pest Control",
  "Gardening",
  "Security",
  "Tutoring",
];

const BOOKING_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const ROLES = {
  CUSTOMER: "CUSTOMER",
  PROVIDER: "PROVIDER",
  ADMIN: "ADMIN",
};

const KYC_STATUS = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const PAYMENT_STATUS = {
  PENDING: "PENDING",
  CAPTURED: "CAPTURED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

const NOTIFICATION_TYPES = {
  BOOKING: "BOOKING",
  PAYMENT: "PAYMENT",
  VOTE: "VOTE",
  WELFARE: "WELFARE",
  SYSTEM: "SYSTEM",
  REVIEW: "REVIEW",
};

const FUND_TYPE = {
  CONTRIBUTION: "CONTRIBUTION",
  WITHDRAWAL: "WITHDRAWAL",
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
};

const SOCKET_EVENTS = {
  // Booking
  BOOKING_CREATED: "booking:created",
  BOOKING_ACCEPTED: "booking:accepted",
  BOOKING_STATUS_UPDATED: "booking:status_updated",
  BOOKING_CANCELLED: "booking:cancelled",
  // Location
  PROVIDER_LOCATION_UPDATE: "provider:location_update",
  PROVIDER_LOCATION_BROADCAST: "provider:location_broadcast",
  // Notifications
  NEW_NOTIFICATION: "notification:new",
  // Room
  JOIN_BOOKING_ROOM: "join:booking_room",
  LEAVE_BOOKING_ROOM: "leave:booking_room",
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

module.exports = {
  SERVICE_CATEGORIES,
  BOOKING_STATUS,
  ROLES,
  KYC_STATUS,
  PAYMENT_STATUS,
  NOTIFICATION_TYPES,
  FUND_TYPE,
  HTTP_STATUS,
  SOCKET_EVENTS,
  PAGINATION,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOC_TYPES,
};
