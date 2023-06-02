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

// Routes

router.post("/login/:address", login);
router.post("/verify", verifyToken, verify);
router.put("/update", verifyToken, updateUser);
router.get("/profile", getUser);

// Export

export default router;
