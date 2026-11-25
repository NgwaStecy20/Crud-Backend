import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server authentication is not configured" });
    }

    const token = authorization.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}
