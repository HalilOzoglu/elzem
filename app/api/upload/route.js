import { NextResponse } from "next/server";
import { put } from '@vercel/blob';
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";

export async function POST(request) {
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

    // Dosyayı Vercel Blob Storage'a yükle
    const blob = await put(`${type}/${id}.webp`, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Veritabanını güncelle
    if (type === "products") {
      await Product.findOneAndUpdate(
        { productSku: id },
        { 
          $set: { 
            productImg1: blob.url,
            productImgMini: blob.url
          } 
        }
      );
    } else {
      await Family.findOneAndUpdate(
        { familyCode: id },
        { 
          $set: { 
            productImg1: blob.url,
            productImgMini: blob.url
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
    return NextResponse.json(
      { success: false, message: "Fotoğraf yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 