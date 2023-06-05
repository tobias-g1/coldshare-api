
import { File } from "../models/file.model.js";
import { PinCode } from "../models/pin-code.model.js";
import { ShareLink } from "../models/share-link.model.js";

class FileService {
  async saveFile(newFile) {
    try {
      const file = new File(newFile);
      await file.save();
      return file;
    } catch (error) {
      console.error("Error uploading file:", error);
      return { success: false, error: "Failed to upload file" };
    }
  }

  async deleteFile(fileId) {
    try {
      await File.findByIdAndDelete(fileId);
      // You may also need to delete the associated pins and share links here
      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: "Failed to delete file" };
    }
  }

  async createPinCode(fileId, expirationDate) {
    try {
      const pinCode = new PinCode({
        file: fileId,
        expirationDate: expirationDate,
      });

      const savedPinCode = await pinCode.save();
      return { success: true, pinCodeId: savedPinCode._id };
    } catch (error) {
      console.error("Error creating pin code:", error);
      return { success: false, error: "Failed to create pin code" };
    }
  }

  async deletePinCode(pinCodeId) {
    try {
      await PinCode.findByIdAndDelete(pinCodeId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting pin code:", error);
      return { success: false, error: "Failed to delete pin code" };
    }
  }

  async createShareLink(fileId, expirationDate) {
    try {
      const shareLink = new ShareLink({
        file: fileId,
        expirationDate: expirationDate,
      });

      const savedShareLink = await shareLink.save();
      return { success: true, shareLinkId: savedShareLink._id };
    } catch (error) {
      console.error("Error creating share link:", error);
      return { success: false, error: "Failed to create share link" };
    }
  }

  async deleteShareLink(shareLinkId) {
    try {
      await ShareLink.findByIdAndDelete(shareLinkId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting share link:", error);
      return { success: false, error: "Failed to delete share link" };
    }
  }

  async getFilesForOwner(userId) {
    try {
      const files = await File.find({ owner: userId });
      return { success: true, files };
    } catch (error) {
      console.error("Error getting files for owner:", error);
      return { success: false, error: "Failed to get files for owner" };
    }
  }

  async getFilesSharedWithUser(userId) {
    try {
      const files = await File.find({ "sharedWith.user": userId });
      return { success: true, files };
    } catch (error) {
      console.error("Error getting files shared with user:", error);
      return { success: false, error: "Failed to get files shared with user" };
    }
  }

  // Helper function to extract file format from the filename
  getFileFormat(filename) {
    const fileExtension = filename.split(".").pop();
    return fileExtension.toLowerCase();
  }
}

export default new FileService();
