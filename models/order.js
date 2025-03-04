import mongoose from "mongoose";

// Sayaç şeması
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

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

// Kullanıcı bilgileri alt şeması
const userInfoSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: true,
  },
  soyad: {
    type: String,
    required: true,
  },
  telefon: {
    type: String,
    required: true,
  },
  adres: {
    il: String,
    ilce: String,
    mahalle: String,
    sokak: String,
    detay: String
  },
  tabela: {
    type: String,
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
    orderNumber: {
      type: Number,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userInfo: userInfoSchema,
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

// Yeni sipariş oluşturulduğunda otomatik olarak sipariş numarası atama
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderNumber' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderNumber = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema); 