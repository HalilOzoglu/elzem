const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String },
    imageUrl: { type: String, required: true },
    linkType: { type: String, enum: ["search", "product", "none"], default: "none" },
    linkValue: { type: String, default: "" }, // search query or product SKU/familyCode
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);

module.exports = Banner;
