import mongoose from "mongoose";

const HouseholdSchema = new mongoose.Schema({
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  name: {
    type: String,
    default: "",
  },
  groupPhoto: {
    type: String,
    default: "",
  },
  createdBy : {
    type: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Household = mongoose.models.Household || mongoose.model("Household", HouseholdSchema);

export default Household;