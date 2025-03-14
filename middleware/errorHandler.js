import AppError from "../utils/appError.js";

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // If it's already an AppError, use its status and message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = Object.keys(err.fields)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Fallback for unexpected errors
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message || "An unexpected error occurred",
  });
};

export default errorHandler;
