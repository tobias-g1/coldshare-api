import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { config } from "dotenv";
import https from "https";
import AWS from "aws-sdk";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

config();

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      const uploadDir = "uploads/";
      fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
      callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
      const uniqueId = uuidv4();
      const filename = file.originalname;
      const extension = filename.split(".").pop();
      const newFilename = `${uniqueId}.${extension}`;
      callback(null, newFilename);
    },
  }),
});
const bucket = process.env.COLDSTACK_BUCKET;
const accessKeyId = process.env.COLDSTACK_ACCESS;
const secretKey = process.env.COLDSTACK_SECRET;
const agent = new https.Agent({ rejectUnauthorized: false });

const s3Client = new S3Client({
  region: "eu-central-1",
  endpoint: `https://s3.coldstack.io`,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretKey,
  },
  httpClient: {
    requestHandler: new NodeHttpHandler({
      httpsAgent: agent,
    }),
  },
});

const awsSdkClient = new AWS.S3({
  region: "eu-central-1",
  accessKeyId: accessKeyId,
  secretAccessKey: secretKey,
  endpoint: `https://s3.coldstack.io`,
});

class ColdStackUploadService {
  async uploadFile(req) {
    try {
      const files = await new Promise((resolve, reject) => {
        upload.array("file")(req, {}, (error) => {
          if (error) {
            console.error("Error uploading file:", error);
            reject(new Error("Failed to upload file"));
          } else {
            resolve(req.files);
          }
        });
      });

const uploadPromises = files.map((file) => this.uploadFileToColdStack(file));

      const responses = await Promise.all(uploadPromises);
      
      console.log(responses)

// Add response.key to each response
      responses.forEach((response, index) => {
        console.log(response)
        files[index].key = response.key; // Assuming files[index].key contains the desired key
});

// Delete files from disk
files.forEach((file) => {
  fs.unlinkSync(file.path);
});

return files;

    } catch (error) {
      console.error("Error uploading files to ColdStack:", error);
      throw new Error("Failed to upload files");
    }
  }

  async deleteFile(key) {
    try {
      const response = await this.deleteFileFromColdStack(key);
      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false, error: "Failed to delete file" };
    }
  }

  async uploadFileToColdStack(file) {
    try {
      const fileContent = fs.readFileSync(file.path);
      const params = {
        Bucket: bucket,
        Key: `${uuidv4()}-${file.originalname}`,
        Body: fileContent,
      };
      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);

      response.key = params.Key;

      // Set the uploaded file to public read
      const aclParams = {
        Bucket: bucket,
        Key: params.Key,
        ACL: "public-read",
      };
      
      await awsSdkClient.putObjectAcl(aclParams).promise();

      return response;
    } catch (error) {
      console.error("Error uploading file to ColdStack:", error);
      throw error;
    }
  }

  async deleteFileFromColdStack(key) {
    try {
      const params = {
        Bucket: bucket,
        Key: key,
      };
      const command = new DeleteObjectCommand(params);
      const response = await s3Client.send(command);
      return response;
    } catch (error) {
      console.error("Error deleting file from ColdStack:", error);
      throw error;
    }
  }
}

export default new ColdStackUploadService();