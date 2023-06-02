const shareLinkSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    link: {
      type: String,
      required: true,
      unique: true,
      default: generateUniqueString,
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

function generateUniqueString(length = 8) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniqueString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueString += characters.charAt(randomIndex);
  }

  return uniqueString;
}

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

export { ShareLink };
