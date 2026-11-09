import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { Role } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-online-exam-jwt-secret-2026";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = "STUDENT", classGroup } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    const existingUser = db.users.findUnique((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const validRole: Role = ["STUDENT", "FACULTY", "ADMIN"].includes(role)
      ? (role as Role)
      : "STUDENT";

    const user = db.users.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: validRole,
      classGroup: classGroup || "CS-2026-A",
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        classGroup: user.classGroup,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        classGroup: user.classGroup,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = db.users.findUnique((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        classGroup: user.classGroup,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        classGroup: user.classGroup,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error during login" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = db.users.findUnique((u) => u.id === req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { passwordHash, ...safeUser } = user;
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};
