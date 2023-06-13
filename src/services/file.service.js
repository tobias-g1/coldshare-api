import { File } from "../models/file.model.js";
import { SharedFiles } from "../models/shared.model.js";
import { PinCode } from "../models/pin-code.model.js";
import { ShareLink } from "../models/share-link.model.js";
import Address from "../models/address.model.js";

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
      return savedPinCode;
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

  async getPinCode(fileId) {
    try {
      const pinCode = await PinCode.findOne({ file: fileId });
      return pinCode;
    } catch (error) {
      console.error("Error deleting pin code:", error);
      return { success: false, error: "Failed to delete pin code" };
    }
  }

  async getShareLink(fileId) {
    try {
      const shareLink = await ShareLink.findOne({ file: fileId });
      return shareLink;
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
      return savedShareLink;
    } catch (error) {
      console.error("Error creating share link:", error);
      return { success: false, error: "Failed to create share link" };
    }
  }

  async getFileByPinCode(pinCode) {
    try {
      const pin = await PinCode.findOne({
        pinCode: pinCode.toLowerCase(),
      }).populate("file");
      if (!pin) {
        return { success: false, error: "Invalid pin code" };
      }
      if (!pin.file) {
        return { success: false, error: "File not found" };
      }
      return { success: true, file: pin.file };
    } catch (error) {
      console.error("Error getting file by pin code:", error);
      return { success: false, error: "Failed to get file by pin code" };
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
      const files = await File.find({ owner: userId }).sort({createdAt: -1}).populate("owner");

      // Perform a lookup for the address
      const address = await Address.findOne({ user: userId });

      // Add the address to each file in the response
      const filesWithAddress = files.map((file) => ({
        ...file._doc,
        owner: {
          ...file.owner._doc,
          address: address ? address.address : null,
        },
      }));

      return { success: true, files: filesWithAddress };
    } catch (error) {
      console.error("Error getting files for owner:", error);
      return { success: false, error: "Failed to get files for owner" };
    }
  }

  async getFilesSharedWithUser(userId) {
    try {
      const sharedFiles = await SharedFiles.find({ user: userId }).sort({createdAt: -1}).populate(
        "file"
      );
      const files = sharedFiles.map((sharedFile) => sharedFile.file);
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
