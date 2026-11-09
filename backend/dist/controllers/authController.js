"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = __importDefault(require("../db.js"));
const JWT_SECRET = process.env.JWT_SECRET || "super-secure-online-exam-jwt-secret-2026";
const register = async (req, res) => {
    try {
        const { email, password, name, role = "STUDENT", classGroup } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password, and name are required" });
        }
        const existingUser = db_js_1.default.users.findUnique((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const validRole = ["STUDENT", "FACULTY", "ADMIN"].includes(role)
            ? role
            : "STUDENT";
        const user = db_js_1.default.users.create({
            email: email.toLowerCase(),
            passwordHash,
            name,
            role: validRole,
            classGroup: classGroup || "CS-2026-A",
        });
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            classGroup: user.classGroup,
        }, JWT_SECRET, { expiresIn: "1d" });
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
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Internal server error during registration" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = db_js_1.default.users.findUnique((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            classGroup: user.classGroup,
        }, JWT_SECRET, { expiresIn: "1d" });
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
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error during login" });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = db_js_1.default.users.findUnique((u) => u.id === req.user?.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { passwordHash, ...safeUser } = user;
        return res.json(safeUser);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching user profile" });
    }
};
exports.getMe = getMe;
