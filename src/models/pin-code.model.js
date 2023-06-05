import mongoose from "mongoose";

const pinCodeSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
      unique: true,
      default: generateUniquePinCode,
    },
    expirationDate: {
      type: Date,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

function generateUniquePinCode() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const pinCodeLength = 6;
  let pinCode = "";

  for (let i = 0; i < pinCodeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    pinCode += characters.charAt(randomIndex);
  }

  return pinCode;
}

const PinCode = mongoose.model("PinCode", pinCodeSchema);

export { PinCode };
