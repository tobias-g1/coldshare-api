import { config } from "dotenv";
import fileService from "../services/file.service.js";
import uploadService from "../services/upload.service.js";

config();

class FileController {
  async uploadFile(req, res) {
    try {
      // Use the AWS upload service to handle file upload to AWS S3
      const uploadResult = await uploadService.uploadFile(req);

      // Files upload successful, save the file details to the database
      const files = req.files;

      try {
        const filePromises = files.map(async (file) => {
          // Create a new file record using the File model
          const { originalname, size, mimetype } = file;

          const uploadedFile = await fileService.saveFile({
            name: originalname,
            path: file.filename,
            bucket: process.env.COLDSTACK_BUCKET,
            owner: req.user ? req.user._id : null,
            format: mimetype,
            size: size,
            mimeType: mimetype,
          });

          // Create a pin code for the file
          const pinCode = await fileService.createPinCode(uploadedFile._id);

          // Create a share link for the file
          const shareLink = await fileService.createShareLink(
            uploadedFile._id
          );

          return {
            file: uploadedFile,
            pinCode,
            shareLink,
          };
        });

        const results = await Promise.all(filePromises);

        return res.status(200).json({
          message: "Files uploaded successfully",
          files: results.map((result) => result.file),
          pinCodes: results.map((result) => result.pinCode),
          shareLinks: results.map((result) => result.shareLink),
          ...uploadResult,
        });
      } catch (error) {
        console.error("Error saving file details:", error);
        return res.status(500).json({ error: "Failed to save file details" });
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      return res.status(500).json({ error: "Failed to upload files" });
    }
  }

  async deleteFile(req, res) {
    try {
      const fileId = req.params.id;

      // Delete the file record using the file service
      await FileService.deleteFile(fileId);

      // Delete associated pin codes and share links
      await PinCodeService.deletePinCodesByFileId(fileId);
      await ShareLinkService.deleteShareLinksByFileId(fileId);

      // Perform any necessary clean-up or file deletion in the AWS S3 bucket
      // ...

      return res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      return res.status(500).json({ error: "Failed to delete file" });
    }
  }

  async deletePinCode(req, res) {
    try {
      const pinCodeId = req.params.id;

      // Delete the pin code using the pin code service
      await PinCodeService.deletePinCode(pinCodeId);

      return res.status(200).json({ message: "Pin code deleted successfully" });
    } catch (error) {
      console.error("Error deleting pin code:", error);
      return res.status(500).json({ error: "Failed to delete pin code" });
    }
  }

  async createShareLink(req, res) {
    try {
      const fileId = req.params.id;

      // Create a share link for the file
      const shareLink = await ShareLinkService.createShareLink(fileId);

      return res
        .status(200)
        .json({ message: "Share link created successfully", shareLink });
    } catch (error) {
      console.error("Error creating share link:", error);
      return res.status(500).json({ error: "Failed to create share link" });
    }
  }

  async deleteShareLink(req, res) {
    try {
      const shareLinkId = req.params.id;

      // Delete the share link using the share link service
      await ShareLinkService.deleteShareLink(shareLinkId);

      return res
        .status(200)
        .json({ message: "Share link deleted successfully" });
    } catch (error) {
      console.error("Error deleting share link:", error);
      return res.status(500).json({ error: "Failed to delete share link" });
    }
  }
}

export default new FileController();
