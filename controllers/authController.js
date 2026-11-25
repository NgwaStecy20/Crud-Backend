import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { createHttpError, isValidEmail } from "../middleware/validate.js";

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function createToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, "Server authentication is not configured");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!fullName || !email || !password) {
      throw createHttpError(400, "Full Name, email and password are required");
    }

    if (!isValidEmail(email)) {
      throw createHttpError(400, "Please enter a valid email address");
    }

    if (password.length < 8) {
      throw createHttpError(400, "Password must be at least 8 characters");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw createHttpError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { fullName, email, password: passwordHash },
    });

    res.status(201).json({
      message: "Registration successful",
      token: createToken(user.id),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createHttpError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw createHttpError(401, "Invalid email or password");
    }

    res.json({
      message: "Login successful",
      token: createToken(user.id),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}
