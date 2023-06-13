import mongoose from "mongoose";

const sharedFilesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
});

const SharedFiles = mongoose.model("SharedFiles", sharedFilesSchema);

export { SharedFiles };
