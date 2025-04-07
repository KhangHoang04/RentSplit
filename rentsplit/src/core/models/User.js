import { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
  },
  google_id : {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = models?.User || model("User", UserSchema);