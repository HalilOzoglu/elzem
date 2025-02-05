import Link from "next/link";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";
import ProductList from "@/components/ui/ProductList";
import mongoose from "mongoose";

async function getCategoriesWithProducts() {
  try {
    await dbConnect();

    // Veritabanı bağlantısını kontrol et
    if (!mongoose.connection.readyState) {
      console.error("Veritabanı bağlantısı yok");
      return null;
    }

    const products = await Product.find({})
      .select(
        "productCategory productName productPrice productDetail productCount productSku"
      )
      .lean();

    const families = await Family.find({})
      .select(
        "familyName familyCategory familyDetail familyCode familyBasePrice"
      )
      .lean();

    // Eğer hiç ürün yoksa boş obje dön
    if (products.length === 0 && families.length === 0) {
      return {};
    }

    const categoryMap = {};

    // Product'ları işle ve _id'yi string'e çevir
    products.forEach((product) => {
      const category = product.productCategory;
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push({
        ...product,
        _id: product._id.toString(), // ObjectId'yi string'e çevir
        type: "product",
      });
    });

    // Family'leri işle ve _id'yi string'e çevir
    families.forEach((family) => {
      const category = family.familyCategory;
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push({
        ...family,
        _id: family._id.toString(), // ObjectId'yi string'e çevir
        productName: family.familyName,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        productPrice: family.familyBasePrice,
        productSku: family.familyCode,
        type: "family",
      });
    });

    // Tüm datastructure'ı JSON'a çevir ve geri parse et
    // Bu, tüm MongoDB özel tiplerini plain JavaScript objelerine çevirir
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
    console.log("CategoryData:", categoryData); // Debug için
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    categoryData = null;
  }

  return <ProductList data={categoryData} />;
}
