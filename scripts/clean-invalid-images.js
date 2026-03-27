/**
 * DB'deki http ile başlamayan (kirli) görsel alanlarını temizler.
 * Çalıştır: node scripts/clean-invalid-images.js
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

async function clean() {
  await mongoose.connect(MONGODB_URI);
  console.log("DB bağlandı");

  const imgFields = ["productImg1", "productImg2", "productImg3", "productImgMini"];

  for (const collection of ["products", "families"]) {
    const col = mongoose.connection.collection(collection);

    // http ile başlamayan ama boş olmayan değerleri bul ve temizle
    for (const field of imgFields) {
      const filter = {
        [field]: { $exists: true, $ne: null, $not: /^https?:\/\// }
      };
      const result = await col.updateMany(filter, { $unset: { [field]: "" } });
      if (result.modifiedCount > 0) {
        console.log(`[${collection}] ${field}: ${result.modifiedCount} kayıt temizlendi`);
      }
    }
  }

  await mongoose.disconnect();
  console.log("Temizlik tamamlandı.");
}

clean().catch(console.error);
