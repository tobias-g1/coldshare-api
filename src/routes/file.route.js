import express from "express";
import { verifyToken } from "../middleware/verify-signature.middleware.js";
import FileController from "../controllers/file.controller.js";

const router = express.Router();

// File Routes
router.post("/upload", FileController.uploadFile);
router.delete("/files/:id", verifyToken, FileController.deleteFile);

export default router;
