// Definitions

import express from "express";

const router = express.Router();

// Controller

import { verifyToken } from "../middleware/verify-signature.middleware.js";
import {
  getUser,
  login,
  updateUser,
  verify,
} from "../controllers/user.controller.js";
import { requireToken } from "../middleware/require-token.middleware.js";

// Routes

router.post("/login/:address", login);
router.post("/verify", requireToken, verifyToken, verify);
router.put("/update", requireToken, verifyToken, updateUser);
router.get("/profile", getUser);

// Export

export default router;
