import express from "express";
import { verifyToken } from "../middleware/verify-signature.middleware.js";
import FileController from "../controllers/file.controller.js";
import { requireToken } from "../middleware/require-token.middleware.js";

const router = express.Router();

// File Routes
router.post("/upload", verifyToken, FileController.uploadFile);
router.delete("/files/:id", requireToken, verifyToken, FileController.deleteFile);
router.get("/pin/:code", verifyToken, FileController.getFileByPinCode);
router.get("/link/:link", verifyToken, FileController.getFileByShareLink);
router.get("/shared",requireToken, verifyToken, FileController.getSharedFiles);
router.get("/owned", requireToken, verifyToken, FileController.getFilesByOwner);
router.get("/share-pin/:fileId", requireToken, verifyToken, FileController.getShareCode);
router.get("/share-link/:fileId", verifyToken, FileController.getShareLink);

export default router;
