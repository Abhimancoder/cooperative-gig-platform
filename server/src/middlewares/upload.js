// src/middlewares/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES } = require("../utils/constants");
const { sendError } = require("../utils/helpers");

// Ensure upload dirs exist
const uploadDir = process.env.UPLOAD_DIR || "uploads";
const dirs = ["kyc", "profile", "misc"].map((d) => path.join(uploadDir, d));
dirs.forEach((d) => fs.mkdirSync(d, { recursive: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = path.join(uploadDir, "misc");
    if (file.fieldname === "kyc") dest = path.join(uploadDir, "kyc");
    if (file.fieldname === "profile") dest = path.join(uploadDir, "profile");
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

const docFilter = (req, file, cb) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and PDF documents are allowed"), false);
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024;

// Single image uploader (e.g. profile photo)
const uploadImage = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: imageFilter,
}).single("profile");

// KYC document uploader
const uploadKyc = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: docFilter,
}).single("kyc");

// Generic multi-file uploader
const uploadMultiple = multer({
  storage,
  limits: { fileSize: maxSize },
  fileFilter: imageFilter,
}).array("files", 5);

// Multer error handler wrapper
const handleUploadError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return sendError(res, `Upload error: ${err.message}`, 400);
    }
    if (err) {
      return sendError(res, err.message, 400);
    }
    next();
  });
};

module.exports = {
  uploadImage: handleUploadError(uploadImage),
  uploadKyc: handleUploadError(uploadKyc),
  uploadMultiple: handleUploadError(uploadMultiple),
};
