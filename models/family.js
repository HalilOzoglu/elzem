import mongoose from "mongoose";

const familySchema = new mongoose.Schema(
  {
    name: { type: String },
    category: { type: String },
    brand: { type: String },
    description: { type: String },
    basePrice: { type: Number },
    isVariant: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Family || mongoose.model("Family", familySchema);
