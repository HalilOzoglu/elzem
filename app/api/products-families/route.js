import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const products = await Product.find({});
    const families = await Family.find({});

    const formattedData = [];

    // Ürünleri ekle
    products.forEach((product) => {
      formattedData.push({
        category: product.productCategory,
        sku: product.productSku,
        name: product.productName,
        price: product.productPrice,
      });
    });

    // Aileleri ekle
    families.forEach((family) => {
      formattedData.push({
        category: family.familyCategory,
        sku: family.familyCode,
        name: family.familyName,
        price: family.familyBasePrice,
      });

      family.variants.forEach((variant) => {
        formattedData.push({
          category: family.familyCategory,
          sku: variant.sku,
          name: `${family.familyName} - ${variant.v1 || ""} ${variant.v2 || ""} ${variant.v3 || ""}`.trim(),
          price: variant.price,
        });
      });
    });

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error("Error fetching products and families:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
