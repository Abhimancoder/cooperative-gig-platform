// src/middlewares/validate.js

const { validationResult } = require("express-validator");
const { sendError } = require("../utils/helpers");

/**
 * Middleware to handle express-validator validation results.
 * Place this AFTER your validation chain in the route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return sendError(res, "Validation failed", 422, formattedErrors);
  }
  next();
};

module.exports = { validate };
