export function notFound(req, res) {
  res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  console.error("Request error:", {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    method: req.method,
    path: req.originalUrl,
  });

  if (error.code === "P2002") {
    return res.status(409).json({ message: "A record with that value already exists" });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ message: "Resource not found" });
  }

  if (error.code === "P1001") {
    return res.status(503).json({ message: "Database is temporarily unavailable" });
  }

  res.status(error.statusCode || 500).json({
    message:
      error.statusCode && error.message
        ? error.message
        : "Unexpected server error",
  });
}
