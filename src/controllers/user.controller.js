import { config } from "dotenv";
import jwt from "jsonwebtoken";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";
import { ethers } from "ethers";

config();

async function login(req, res) {
  const { message, signature } = req.body;
  const address = req.params.address.toLowerCase();

  try {
    let existingAddress = await Address.findOne({ address });

    // If the address does not exist, create a new user and associate it with a new address
    if (!existingAddress) {
      const newUser = new User(); // Create a new user
      await newUser.save(); // Save the new user

      // Create a new address associated with the new user
      existingAddress = new Address({
        address,
        user: newUser._id,
      });
      await existingAddress.save();
    }

    const recoveredAddress = await recoverAddressFromSignature(
      message,
      signature,
      address
    );
    if (recoveredAddress.toLowerCase() !== address) {
      throw new Error("Invalid signature");
    }

    const token = jwt.sign({ address }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Unauthorized" });
  }
}

function validateMessageTimestamp(message) {
  const messageParts = message.split(":");
  const messageTimestamp = messageParts[1];
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();
  if (currentTimestamp - messageTimestamp > 300) {
    throw new Error("Timestamp in message is too old");
  }
}

async function recoverAddressFromSignature(message, signature, address) {
  validateMessageTimestamp(message);

  const messageHash = ethers.utils.hashMessage(message);
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Invalid public key");
  }

  return recoveredAddress;
}

async function verify(req, res) {
  res.send({
    auth: true,
    address: req.address,
  });
}

async function getUser(req, res) {
  const { username } = req.query;

  try {
    const user = await User.findById(username);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateUser(req, res) {
  const { username, profileImage, bio, url } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export { login, verify, getUser, updateUser };
