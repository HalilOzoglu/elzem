import mongoose from "mongoose";

const generateFamilyCode = async () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const code = `FAM-${random}`;
  const exists = await mongoose.model("Family").findOne({ familyCode: code });
  return exists ? generateFamilyCode() : code;
};
// Variant alt şeması
const variantSchema = new mongoose.Schema({
  v1: { type: String },
  v2: { type: String },
  v3: { type: String },
  sku: { type: String, required: true, unique: true },
  box: { type: Number, required: true },
  price: { type: Number, required: true },
  count: { type: Number, required: true },
});

const familySchema = new mongoose.Schema(
  {
    familyName: { type: String, required: true },
    familyBrand: { type: String, required: true },
    familyCategory: { type: String, required: true },
    familyCode: { type: String, unique: true },
    familyVariantCount: { type: Number, required: true },
    familyV1Name: { type: String },
    familyV2Name: { type: String },
    familyV3Name: { type: String },
    familyDetail: { type: String },
    familyBasePrice: { type: Number },
    isVariant: { type: Boolean, default: true },
    // Variants array'i eklendi
    variants: [variantSchema],
  },
  { timestamps: true }
);

familySchema.pre("save", async function (next) {
  if (!this.familyCode) {
    this.familyCode = await generateFamilyCode();
  }
  next();
});

export default mongoose.models.Family || mongoose.model("Family", familySchema);
