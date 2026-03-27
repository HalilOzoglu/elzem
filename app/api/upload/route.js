import { NextResponse } from "next/server";
import { put, del } from '@vercel/blob';
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";
import Banner from "@/models/banner";
import sharp from "sharp";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type");       // "products" | "families" | "banner"
    const id = formData.get("id");           // sku / familyCode / bannerId (or "new")
    const imageSlot = formData.get("imageSlot") || "img1"; // "img1" | "img2" | "img3"

    if (!file || !type || !id) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Dosya boyutu 5MB'dan büyük olamaz" }, { status: 400 });
    }

    await dbConnect();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Banner için farklı boyut (1920x600 fit cover), ürünler için 800x800
    const isBanner = type === "banner";
    const webpBuffer = await sharp(buffer)
      .resize(
        isBanner ? 1920 : 800,
        isBanner ? 600 : 800,
        { fit: isBanner ? 'cover' : 'inside', withoutEnlargement: true }
      )
      .webp({ quality: 85 })
      .toBuffer();

    const blobPath = isBanner
      ? `banners/${id}-${Date.now()}.webp`
      : `${type}/${id}-${imageSlot}.webp`;

    let blob;
    try {
      blob = await put(blobPath, webpBuffer, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: 'image/webp'
      });
    } catch (blobError) {
      return NextResponse.json(
        { success: false, message: "Blob storage hatası", error: blobError.message },
        { status: 500 }
      );
    }

    if (!blob?.url) {
      return NextResponse.json({ success: false, message: "Blob URL oluşturulamadı" }, { status: 500 });
    }

    // DB güncelle
    if (type === "products") {
      const fieldMap = { img1: "productImg1", img2: "productImg2", img3: "productImg3" };
      const field = fieldMap[imageSlot] || "productImg1";
      const updateFields = { [field]: blob.url };
      if (imageSlot === "img1") updateFields.productImgMini = blob.url;
      await Product.findOneAndUpdate({ productSku: id }, { $set: updateFields });
    } else if (type === "families") {
      const fieldMap = { img1: "productImg1", img2: "productImg2", img3: "productImg3" };
      const field = fieldMap[imageSlot] || "productImg1";
      const updateFields = { [field]: blob.url };
      if (imageSlot === "img1") updateFields.productImgMini = blob.url;
      await Family.findOneAndUpdate({ familyCode: id }, { $set: updateFields });
    } else if (type === "banner") {
      // Banner için sadece URL döndür, kayıt çağıran tarafta yapılır
    }

    return NextResponse.json({ success: true, url: blob.url }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");   // "products" | "families"
    const id = searchParams.get("id");       // sku or familyCode
    const imageSlot = searchParams.get("imageSlot"); // "img1" | "img2" | "img3"

    if (!type || !id || !imageSlot) {
      return NextResponse.json({ success: false, message: "Eksik bilgi" }, { status: 400 });
    }

    await dbConnect();

    const fieldMap = { img1: "productImg1", img2: "productImg2", img3: "productImg3" };
    const field = fieldMap[imageSlot];
    if (!field) return NextResponse.json({ success: false, message: "Geçersiz slot" }, { status: 400 });

    // Mevcut URL'yi bul
    let currentUrl = null;
    if (type === "products") {
      const product = await Product.findOne({ productSku: id }).select(field).lean();
      currentUrl = product?.[field];
    } else if (type === "families") {
      const family = await Family.findOne({ familyCode: id }).select(field).lean();
      currentUrl = family?.[field];
    }

    // Blob'dan sil
    if (currentUrl) {
      try {
        await del(currentUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
      } catch (e) {
        console.warn("Blob silme uyarısı:", e.message);
      }
    }

    // DB'den temizle
    const updateFields = { [field]: null };
    if (imageSlot === "img1") updateFields.productImgMini = null;

    if (type === "products") {
      await Product.findOneAndUpdate({ productSku: id }, { $unset: updateFields });
    } else {
      await Family.findOneAndUpdate({ familyCode: id }, { $unset: updateFields });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
