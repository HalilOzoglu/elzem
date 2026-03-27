import Family from "@/models/family"; // Modeli import et
import dbConnect from "@/utils/dbConnect"; // DB bağlantısını import et
import { NextResponse } from "next/server";

// GET: Tüm aileleri listele
export async function GET() {
  try {
    await dbConnect(); // DB bağlantısını kur
    const families = await Family.find({}).sort({ createdAt: -1 }); // Tüm aileleri getir
    return NextResponse.json(families); // JSON olarak döndür
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST: Yeni aile ekle
export async function POST(req) {
  try {
    await dbConnect(); // DB bağlantısını kur
    const body = await req.json(); // Request body'yi al

    // familyCode otomatik oluşturulacak, kabul etmiyoruz
    const { familyCode, ...rest } = body;

    const family = new Family(rest); // Yeni aile oluştur
    await family.save(); // Aileyi kaydet
    return NextResponse.json({ success: true, family }, { status: 201 }); // Başarılı yanıt döndür
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT: Aile güncelle
export async function PUT(req) {
  try {
    await dbConnect(); // DB bağlantısını kur
    const body = await req.json(); // Request body'yi al
    const { _id, familyCode, ...updateFields } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Aile kimliği belirtilmeli" },
        { status: 400 }
      );
    }

    // Aileyi güncelle
    const family = await Family.findByIdAndUpdate(_id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!family) {
      return NextResponse.json(
        { success: false, message: "Aile bulunamadı" },
        { status: 404 }
      );
    }

    // Varyantlar varsa, en düşük fiyatı bul ve familyBasePrice'ı güncelle
    if (family.variants && family.variants.length > 0) {
      const minPrice = Math.min(...family.variants.map((v) => v.price));
      family.familyBasePrice = minPrice;
      await family.save(); // Güncellenmiş aileyi kaydet
    }

    return NextResponse.json({ success: true, family }); // Başarılı yanıt döndür
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Aile sil
export async function DELETE(req) {
  try {
    await dbConnect(); // DB bağlantısını kur
    const { _id } = await req.json(); // Request body'den _id'yi al

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Aile kimliği belirtilmeli" },
        { status: 400 }
      );
    }

    // Aileyi sil
    const family = await Family.findByIdAndDelete(_id);
    if (!family) {
      return NextResponse.json(
        { success: false, message: "Aile bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Aile silindi" }); // Başarılı yanıt döndür
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
