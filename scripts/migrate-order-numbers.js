const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// MongoDB bağlantı URL'si
const MONGODB_URI = process.env.MONGODB_URI;

// Order modelini manuel olarak oluştur
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userInfo: {
      ad: String,
      soyad: String,
      telefon: String,
      adres: {
        il: String,
        ilce: String,
        mahalle: String,
        sokak: String,
        detay: String
      },
      tabela: String
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    products: [{
      sku: String,
      name: String,
      price: Number,
      count: Number
    }],
    status: {
      type: String,
      default: "Hazırlanıyor"
    },
    total: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function migrateOrderNumbers() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    // Tüm siparişleri oluşturulma tarihine göre sırala
    const orders = await Order.find().sort({ createdAt: 1 });
    console.log(`Toplam ${orders.length} adet sipariş bulundu`);

    // Her siparişe sırayla yeni numara ata
    let orderNumber = 0;
    for (const order of orders) {
      orderNumber++;
      order.orderNumber = orderNumber;
      await order.save();
      console.log(`Sipariş ${order._id} için ${orderNumber} numarası atandı`);
    }

    // Sayaç koleksiyonunu güncelle
    await mongoose.connection.collection('counters').updateOne(
      { _id: 'orderNumber' },
      { $set: { seq: orderNumber } },
      { upsert: true }
    );

    console.log('Migration tamamlandı');
    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
}

migrateOrderNumbers(); 