const mongoose = require('mongoose');
const { put } = require('@vercel/blob');
const fs = require('fs').promises;
const path = require('path');

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

async function migratePhotos() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb+srv://fevzilendin:23992687@cluster0.5aau9ym.mongodb.net/elzem?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB bağlantısı başarılı');

    // Şemaları kaydet
    mongoose.model('Product', productSchema);
    mongoose.model('Family', familySchema);

    // Public klasöründeki fotoğrafları al
    const publicDir = path.join(process.cwd(), 'public');
    const files = await fs.readdir(publicDir);
    const imageFiles = files.filter(file => file.endsWith('.webp'));

    console.log(`${imageFiles.length} fotoğraf bulundu`);

    // Ürünleri kontrol et
    const products = await mongoose.model('Product').find({});
    console.log(`\nVeritabanında ${products.length} ürün bulundu`);

    for (const product of products) {
      if (product.productImg1 && product.productImg1.startsWith('/')) {
        const fileName = product.productImg1.substring(1); // Başındaki / işaretini kaldır
        if (imageFiles.includes(fileName)) {
          console.log(`\nÜrün fotoğrafı yükleniyor: ${product.productName} (${fileName})`);
          const filePath = path.join(publicDir, fileName);
          const fileBuffer = await fs.readFile(filePath);
          
          const blob = await put(`products/${product.productSku}.webp`, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
            token: 'vercel_blob_rw_JntFCcLBjHQyj7x8_2OsxmMDtOAkCsqTiySysCyeNocZtyI'
          });

          await mongoose.model('Product').findOneAndUpdate(
            { productSku: product.productSku },
            { 
              $set: { 
                productImg1: blob.url,
                productImgMini: blob.url
              } 
            }
          );

          console.log(`Fotoğraf yüklendi: ${blob.url}`);
        }
      }
    }

    // Aileleri kontrol et
    const families = await mongoose.model('Family').find({});
    console.log(`\nVeritabanında ${families.length} aile bulundu`);

    for (const family of families) {
      if (family.productImg1 && family.productImg1.startsWith('/')) {
        const fileName = family.productImg1.substring(1); // Başındaki / işaretini kaldır
        if (imageFiles.includes(fileName)) {
          console.log(`\nAile fotoğrafı yükleniyor: ${family.familyName} (${fileName})`);
          const filePath = path.join(publicDir, fileName);
          const fileBuffer = await fs.readFile(filePath);
          
          const blob = await put(`families/${family.familyCode}.webp`, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
            token: 'vercel_blob_rw_JntFCcLBjHQyj7x8_2OsxmMDtOAkCsqTiySysCyeNocZtyI'
          });

          await mongoose.model('Family').findOneAndUpdate(
            { familyCode: family.familyCode },
            { 
              $set: { 
                productImg1: blob.url,
                productImgMini: blob.url
              } 
            }
          );

          console.log(`Fotoğraf yüklendi: ${blob.url}`);
        }
      }
    }

    console.log('\nFotoğraf migrasyonu tamamlandı!');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

migratePhotos(); 