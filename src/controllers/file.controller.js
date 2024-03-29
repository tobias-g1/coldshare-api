import { config } from "dotenv";
import { File } from "../models/file.model.js";
import { SharedFiles } from "../models/shared.model.js";
import fileService from "../services/file.service.js";
import uploadService from "../services/upload.service.js";
import { ShareLink } from "../models/share-link.model.js";

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

          console.log(file)

          const uploadedFile = await fileService.saveFile({
            name: originalname,
            key: file.key,
            bucket: process.env.COLDSTACK_BUCKET,
            owner: res.locals.user?._id,
            format: mimetype,
            size: size,
            mimeType: mimetype,
          });

          // Create a pin code for the file
          const pinCode = await fileService.createPinCode(uploadedFile._id);

          // Create a share link for the file
          const shareLink = await fileService.createShareLink(uploadedFile._id);

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

  async getFileByPinCode(req, res) {
    try {
      const { code } = req.params;
      const result = await fileService.getFileByPinCode(code);

      if (result.success) {
        if (
          res.locals.user?._id &&
          result.file.userId !== res.locals.user._id
        ) {
          // Check if a shared file already exists for the user and file
          const existingSharedFile = await SharedFiles.findOne({
            user: res.locals.user._id,
            file: result.file._id,
          });

          if (existingSharedFile) {
            return res.status(200).json(result.file);
          }

          // Create a new SharedFiles record with user and file
          const newSharedFile = new SharedFiles({
            user: res.locals.user._id, // Set the user field using res.locals.user._id
            file: result.file._id, // Assuming the file record is available in result.file
          });

          // Save the new SharedFiles record
          await newSharedFile.save();
        }

        return res.status(200).json(result.file);
      } else {
        return res.status(404).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error getting file by pin code:", error);
      return res.status(500).json({ error: "Failed to get file by pin code" });
    }
  }

  async deleteFile(req, res) {
    try {
      const fileId = req.params.id;

      // Delete the file record using the file service
      await fileService.deleteFile(fileId);

      // Delete associated pin codes and share links
      await fileService.deletePinCodesByFileId(fileId);
      await fileService.deleteShareLinksByFileId(fileId);

      return res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      return res.status(500).json({ error: "Failed to delete file" });
    }
  }

  async getFilesByOwner(req, res) {
    try {
      const userId = res.locals.user?._id;
      const result = await fileService.getFilesForOwner(userId);

      if (result.success) {
        return res.status(200).json(result.files);
      } else {
        return res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error getting files by owner:", error);
      return res.status(500).json({ error: "Failed to get files by owner" });
    }
  }

  async getSharedFiles(req, res) {
    try {
      const userId = res.locals.user?._id;
      const result = await fileService.getFilesSharedWithUser(userId);

      if (result.success) {
        return res.status(200).json(result.files);
      } else {
        return res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error("Error getting shared files:", error);
      return res.status(500).json({ error: "Failed to get shared files" });
    }
  }

  async getShareLink(req, res) {
    try {
      const { fileId } = req.params;

      // Look up the file by its ID
      const file = await File.findById(fileId);

      // Check if the file exists
      if (!file) {
        return res.status(404).send("File not found");
      }

      // Check if the file owner matches the user id
      if (
        file.owner &&
        file.owner.toString() !== res.locals.user._id.toString()
      ) {
        return res.status(403).send("Access Denied");
      }

      const shareLink = await fileService.getShareLink(fileId);
      res.send(shareLink);
    } catch (error) {
      // Handle error appropriately
      res.status(500).send("Internal Server Error");
    }
  }

  async getShareCode(req, res) {
    try {
      const { fileId } = req.params;

      // Look up the file by its ID
      const file = await File.findById(fileId);

      // Check if the file exists
      if (!file) {
        return res.status(404).send("File not found");
      }

      // Check if the file owner matches the user id
      if (
        file.owner &&
        file.owner.toString() !== res.locals.user._id.toString()
      ) {
        return res.status(403).send("Access Denied");
      }

      const shareCode = await fileService.getPinCode(fileId);
      res.send(shareCode);
    } catch (error) {
      // Handle error appropriately
      res.status(500).send("Internal Server Error");
    }
  }

  async getFileByShareLink(req, res) {
    try {
      const { link } = req.params;
  
      // Find the ShareLink record based on the provided link
      const shareLink = await ShareLink.findOne({ link }).populate("file");
  
      // Check if the share link exists and is not deleted
      if (!shareLink || shareLink.deleted) {
        return res.status(404).json({ error: "Share link not found" });
      }
  
      // Check if the share link has expired
      if (shareLink.expirationDate && shareLink.expirationDate < Date.now()) {
        return res.status(403).json({ error: "Share link has expired" });
      }
  
      const file = shareLink.file;
  
      if (file) {
        if (
          res.locals.user?._id &&
          file.owner &&
          file.owner.toString() !== res.locals.user._id
        ) {
          // Check if a shared file already exists for the user and file
          const existingSharedFile = await SharedFiles.findOne({
            user: res.locals.user._id,
            file: file._id,
          });
  
          if (existingSharedFile) {
            return res.status(200).json(file);
          }
  
          // Create a new SharedFiles record with user and file
          const newSharedFile = new SharedFiles({
            user: res.locals.user._id,
            file: file._id,
          });
  
          // Save the new SharedFiles record
          await newSharedFile.save();
        }
  
        return res.status(200).json(file);
      } else {
        return res.status(404).json({ error: "File not found" });
      }
    } catch (error) {
      console.error("Error getting file by share link:", error);
      return res
        .status(500)
        .json({ error: "Failed to get file by share link" });
    }
  }

  
}

export default new FileController();
