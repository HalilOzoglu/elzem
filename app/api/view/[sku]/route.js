import { NextResponse } from "next/server";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";

export const dynamic = "force-dynamic"; // Önbellek kontrolü

export async function GET(_, { params }) {
  try {
    await dbConnect();
    const { sku } = params;

    // Product arama
    const product = await Product.findOne({ productSku: sku })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (product) {
      return NextResponse.json({ type: "product", data: product });
    }

    // Family arama
    const family = await Family.findOne({ "variants.sku": sku })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (!family) {
      return NextResponse.json(
        { error: "Ürün veya varyant bulunamadı" },
        { status: 404 }
      );
    }

    const variant = family.variants.find((v) => v.sku === sku);
    const mergedData = {
      ...variant,
      productName: family.familyName,
      productBrand: family.familyBrand,
      productCategory: family.familyCategory,
      productDetail: family.familyDetail,
    };

    return NextResponse.json({ type: "variant", data: mergedData });
  } catch (error) {
    console.error("API Hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
