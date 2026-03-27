// app/api/categoryAll/route.js

import { NextResponse } from "next/server";
import Product from "@/models/product";
import Family from "@/models/family";
import mongoose from "mongoose";

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Ürünleri al
    const products = await Product.aggregate([
      { $limit: 10 },
      { 
        $project: { 
          _id: 0, 
          __v: 0, 
          createdAt: 0, 
          updatedAt: 0,
          productImg1: 1,
          productImgMini: 1
        } 
      },
    ]);

    // Aile varyantlarını al
    const families = await Family.aggregate([
      { $unwind: "$variants" },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          "variants.sku": 1,
          "variants.price": 1,
          "variants.box": 1,
          "variants.count": 1,
          familyName: 1,
          familyCategory: 1,
          familyBrand: 1,
          familyDetail: 1,
          productImg1: 1,
          productImgMini: 1
        },
      },
    ]);

    // Verileri birleştir
    const allProducts = [
      ...products.map((p) => ({ ...p, type: "product" })),
      ...families.map((f) => ({
        ...f.variants,
        productName: f.familyName,
        productCategory: f.familyCategory,
        productBrand: f.familyBrand,
        productDetail: f.familyDetail,
        productImg1: f.productImg1,
        productImgMini: f.productImgMini,
        type: "variant",
      })),
    ];

    // Kategorilere göre grupla
    const categorized = allProducts.reduce((acc, product) => {
      const category = product.productCategory;
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});

    return NextResponse.json(categorized, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
