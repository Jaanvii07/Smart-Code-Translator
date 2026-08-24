import logger from "../config/logger.js";

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  logger.error({ err: err.message, path: req.originalUrl, method: req.method }, "Request error");

  // Respect a status code the error was thrown with (e.g. error.statusCode = 409
  // for "already exists", 400 for validation, etc.) instead of always returning 500.
  const statusCode = err.statusCode || 500;

  // Mongoose duplicate-key errors (e.g. a unique email constraint) don't set
  // statusCode and have an unreadable raw message like:
  // "E11000 duplicate key error collection: ... index: email_1 dup key: ..."
  // Detect that shape specifically and turn it into a clean 409 + message.
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `An account with this ${field} already exists.`,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
  });
};