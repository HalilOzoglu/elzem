import mongoose from "mongoose";

// Ürün alt şeması
const orderProductSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  }
});

// Sipariş durumu için enum
const OrderStatus = {
  PREPARING: "Hazırlanıyor",
  READY_FOR_DELIVERY: "Teslim edilecek",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi"
};

// Ana sipariş şeması
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: "anonim"
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      get: function(date) {
        return date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    },
    products: [orderProductSchema],
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PREPARING,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true }
  }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema); 