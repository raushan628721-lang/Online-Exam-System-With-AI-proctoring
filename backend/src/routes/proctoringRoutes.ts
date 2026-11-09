import { Router } from "express";
import { logViolation } from "../controllers/proctoringController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/violation", authenticateToken, logViolation);

export default router;
