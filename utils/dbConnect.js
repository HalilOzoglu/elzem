const mongoose = require("mongoose");
const dotenv = require('dotenv');
const path = require('path');

// .env.local dosyasını yükle
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Hata ayıklama için ortam değişkenlerini kontrol et
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Tanımlı' : 'Tanımlı değil');
console.log('ENV dosyası yolu:', path.join(__dirname, '..', '.env.local'));

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI ortam değişkeni tanımlanmamış.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = dbConnect;
