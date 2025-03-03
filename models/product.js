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
    },
    productImg2: {
      type: String,
    },
    productImg3: {
      type: String,
    },
    productImgMini: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Oluşturulma ve güncellenme tarihlerini otomatik kaydeder.
  }
);

// Model oluşturma
export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
