const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dbConnect = require('../utils/dbConnect');
const Product = require('../models/product');
const Family = require('../models/family');

// .env.local dosyasını yükle
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Hata ayıklama için çalışma dizinini kontrol et
console.log('Çalışma dizini:', process.cwd());
console.log('Script dizini:', __dirname);

async function updatePhotos() {
  try {
    await dbConnect();
    console.log('Veritabanına bağlanıldı');

    // Public klasöründeki tüm webp dosyalarını bul
    const publicDir = path.join(__dirname, '..', 'public');
    const files = fs.readdirSync(publicDir)
      .filter(file => file.endsWith('.webp'))
      .map(file => file.replace('.webp', ''));

    console.log(`${files.length} adet fotoğraf bulundu`);

    // Her dosya için veritabanını güncelle
    for (const file of files) {
      // Önce ürünlerde ara
      const product = await Product.findOne({ productSku: file });
      if (product) {
        await Product.findOneAndUpdate(
          { productSku: file },
          { 
            $set: { 
              productImg1: `/${file}.webp`,
              productImgMini: `/${file}.webp`,
              productImg2: `/${file}.webp`,
              productImg3: `/${file}.webp`
            } 
          }
        );
        console.log(`Ürün güncellendi: ${file}`);
        continue;
      }

      // Sonra ailelerde ara
      const family = await Family.findOne({ familyCode: file });
      if (family) {
        await Family.findOneAndUpdate(
          { familyCode: file },
          { 
            $set: { 
              productImg1: `/${file}.webp`,
              productImgMini: `/${file}.webp`,
              productImg2: `/${file}.webp`,
              productImg3: `/${file}.webp`
            } 
          }
        );
        console.log(`Aile güncellendi: ${file}`);
        continue;
      }

      console.log(`Eşleşme bulunamadı: ${file}`);
    }

    console.log('Güncelleme tamamlandı');
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    process.exit();
  }
}

updatePhotos(); 