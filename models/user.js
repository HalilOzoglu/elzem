import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    telefon: {
      type: String,
      required: true,
      unique: true, // Benzersiz olması için
    },
    tabela: {
      type: String,
    },
    ad: {
      type: String,
    },
    soyad: {
      type: String,
    },
    adres: {
      il: {
        type: String,
      },
      ilce: {
        type: String,
      },
      mahalle: {
        type: String,
      },
      sokak: {
        type: String,
      },
      detay: {
        type: String,
      },
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Oluşturulma ve güncellenme tarihlerini otomatik kaydeder
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema); 