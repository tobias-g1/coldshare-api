import crypto from "crypto";

async function generateJwtSecret() {
  return crypto.randomBytes(64).toString("hex");
}

const secret = await generateJwtSecret();

console.log("New Secret Generated: " + secret);
