import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";

export async function POST(request) {
  let uploadedFilePath = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");
    const id = formData.get("id");

    if (!file || !type || !id) {
      return NextResponse.json(
        { success: false, message: "Eksik bilgi" },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Dosya adını oluştur
    const fileName = `${id}.webp`;
    const uploadDir = path.join(process.cwd(), "public");
    const filePath = path.join(uploadDir, fileName);

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Görüntüyü webp formatına dönüştür ve kaydet
    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(filePath);

    uploadedFilePath = filePath;

    // Veritabanını güncelle
    if (type === "products") {
      await Product.findOneAndUpdate(
        { productSku: id },
        { 
          $set: { 
            productImg1: `/${fileName}`,
            productImgMini: `/${fileName}`
          } 
        }
      );
    } else {
      await Family.findOneAndUpdate(
        { familyCode: id },
        { 
          $set: { 
            productImg1: `/${fileName}`,
            productImgMini: `/${fileName}`
          } 
        }
      );
    }

    return NextResponse.json(
      { success: true, message: "Fotoğraf başarıyla yüklendi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Yükleme hatası:", error);
    
    // Hata durumunda yüklenen dosyayı sil
    if (uploadedFilePath) {
      try {
        await unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error("Dosya silme hatası:", unlinkError);
      }
    }

    return NextResponse.json(
      { success: false, message: "Fotoğraf yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 