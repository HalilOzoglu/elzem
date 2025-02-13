import Link from "next/link";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";
import ProductList from "@/components/ui/ProductList";
import mongoose from "mongoose";

// Dinamik davranışı zorla
export const dynamic = "force-dynamic"; // Bu satırı ekleyin

async function getCategoriesWithProducts() {
  try {
    await dbConnect();

    if (!mongoose.connection.readyState) {
      console.error("Veritabanı bağlantısı yok");
      return null;
    }

    let products = await Product.find({})
      .select(
        "productCategory productName productPrice productDetail productCount productSku"
      )
      .lean();

    let families = await Family.find({})
      .select(
        "familyName familyCategory familyDetail familyCode familyBasePrice"
      )
      .lean();

    if (products.length === 0 && families.length === 0) {
      return {};
    }

    let categoryMap = {};

    products.forEach((product) => {
      let category = product.productCategory;
      categoryMap[category] = categoryMap[category] || [];
      categoryMap[category].push({
        ...product,
        _id: product._id.toString(),
        type: "product",
      });
    });

    families.forEach((family) => {
      let category = family.familyCategory;
      categoryMap[category] = categoryMap[category] || [];
      categoryMap[category].push({
        ...family,
        _id: family._id.toString(),
        productName: family.familyName,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        productPrice: family.familyBasePrice,
        productSku: family.familyCode,
        type: "family",
      });
    });

    return JSON.parse(JSON.stringify(categoryMap));
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    throw error;
  }
}

export default async function Home() {
  let categoryData;

  try {
    categoryData = await getCategoriesWithProducts();
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    categoryData = null;
  }

  return (
    <div className="min-h-screen">
      <ProductList data={categoryData} />
    </div>
  );
}
