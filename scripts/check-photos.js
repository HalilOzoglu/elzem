const mongoose = require('mongoose');
const { list } = require('@vercel/blob');
require('dotenv').config();

// Product şeması
const productSchema = new mongoose.Schema({
  isVariant: { type: Boolean, required: true, default: false },
  productName: { type: String, required: true },
  productDetail: { type: String, required: true },
  productSku: { type: String, required: true, unique: true },
  productCount: { type: Number, required: true },
  productPrice: { type: Number, required: true },
  productBox: { type: Number, required: true },
  productBrand: { type: String, required: true },
  productCategory: { type: String, required: true },
  productImg1: { type: String },
  productImg2: { type: String },
  productImg3: { type: String },
  productImgMini: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Family şeması
const familySchema = new mongoose.Schema({
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
  variants: [{
    v1: { type: String },
    v2: { type: String },
    v3: { type: String },
    sku: { type: String, required: true, unique: true },
    box: { type: Number, required: true },
    price: { type: Number, required: true },
    count: { type: Number, required: true }
  }],
  order: { type: Number, default: 0 },
  productImg1: { type: String },
  productImg2: { type: String },
  productImg3: { type: String },
  productImgMini: { type: String }
}, { timestamps: true });

async function checkPhotos() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb+srv://fevzilendin:23992687@cluster0.5aau9ym.mongodb.net/elzem?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB bağlantısı başarılı');

    // Şemaları kaydet
    mongoose.model('Product', productSchema);
    mongoose.model('Family', familySchema);

    // Vercel Blob Storage'daki tüm dosyaları al
    const { blobs } = await list({
      token: 'vercel_blob_rw_JntFCcLBjHQyj7x8_2OsxmMDtOAkCsqTiySysCyeNocZtyI'
    });
    const blobUrls = blobs.map(blob => blob.url);
    console.log(`Blob Storage'da ${blobUrls.length} dosya bulundu`);
    console.log('Blob URL\'leri:', blobUrls);

    // Ürünleri kontrol et
    const products = await mongoose.model('Product').find({});
    console.log(`\nVeritabanında ${products.length} ürün bulundu`);
    console.log('Ürün fotoğrafları:');
    products.forEach(product => {
      console.log(`\nÜrün: ${product.productName} (SKU: ${product.productSku})`);
      console.log(`Fotoğraf URL: ${product.productImg1}`);
      console.log(`Blob'da var mı: ${blobUrls.includes(product.productImg1)}`);
    });

    // Aileleri kontrol et
    const families = await mongoose.model('Family').find({});
    console.log(`\nVeritabanında ${families.length} aile bulundu`);
    console.log('Aile fotoğrafları:');
    families.forEach(family => {
      console.log(`\nAile: ${family.familyName} (Kod: ${family.familyCode})`);
      console.log(`Fotoğraf URL: ${family.productImg1}`);
      console.log(`Blob'da var mı: ${blobUrls.includes(family.productImg1)}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

checkPhotos(); 