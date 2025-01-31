import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Küresel önbelleği kontrol et (TypeScript projelerinde globalThis kullanılır)
let cached = globalThis.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {})
      .then((mongoose) => {
        console.log("MongoDB'ye başarıyla bağlanıldı.");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB bağlantı hatası:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  globalThis.mongoose = cached; // Ön belleğe al
  return cached.conn;
}

export default dbConnect;
