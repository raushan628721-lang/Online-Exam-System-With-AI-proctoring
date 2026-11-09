"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proctoringController_js_1 = require("../controllers/proctoringController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.post("/violation", auth_js_1.authenticateToken, proctoringController_js_1.logViolation);
exports.default = router;
