// /api/products/route.js
import Product from "@/models/product";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

// Tüm ürünleri getir
export async function GET(req) {
  try {
    await dbConnect();

    // Varyant olmayan ürünleri getir ve sıralamaya göre sırala
    const products = await Product.find({ isVariant: false })
      .sort('order')
      .select('productName productBrand productCategory productSku productPrice productCount productImgMini productImg1 productImg2 productImg3 order');

    return NextResponse.json(products);
  } catch (error) {
    console.error('Ürünler getirilirken hata:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// Yeni ürün ekle
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const product = new Product(body);
    await product.save();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Ürün güncelle (isteğe bağlı)
export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { productSku, ...updateFields } = body; // SKU'yu ayır, diğer alanları al

    if (!productSku) {
      return NextResponse.json(
        { success: false, message: "SKU belirtilmeli" },
        { status: 400 }
      );
    }

    const product = await Product.findOneAndUpdate(
      { productSku: productSku }, // SKU'ya göre güncelle
      updateFields,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
// Ürün sil (isteğe bağlı)
export async function DELETE(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { productSku } = body; // SKU'yu JSON üzerinden al

    if (!productSku) {
      return NextResponse.json(
        { success: false, message: "SKU belirtilmeli" },
        { status: 400 }
      );
    }

    const product = await Product.findOneAndDelete({ productSku });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Ürün silindi" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
