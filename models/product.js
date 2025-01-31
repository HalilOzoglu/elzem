import mongoose from "mongoose";

// Şema tanımı
const productSchema = new mongoose.Schema(
  {
    isVariant: {
      type: Boolean,
      required: true,
      default: false,
    },
    productName: {
      type: String,
      required: true,
    },
    productDetail: {
      type: String,
      required: true,
    },
    productSku: {
      type: String,
      required: true,
      unique: true, // Benzersizlik özelliği
    },
    productCount: {
      type: Number,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productBox: {
      type: Number,
      required: true,
    },
    productBrand: {
      type: String,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    productImg1: {
      type: String,
      required: false,
    },
    productImg2: {
      type: String,
      required: false,
    },
    productImg3: {
      type: String,
      required: false,
    },
    productImgMini: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Oluşturulma ve güncellenme tarihlerini otomatik kaydeder.
  }
);

// Unique indeks tanımlaması
productSchema.index({ productSku: 1 }, { unique: true });

// Model oluşturma
export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
