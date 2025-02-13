import Link from "next/link";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";
import ProductList from "@/components/ui/ProductList";
import mongoose from "mongoose";

async function getCategoriesWithProducts() {
  try {
    await dbConnect();
    if (!mongoose.connection.readyState) return null;

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

    if (products.length === 0 && families.length === 0) return {};

    let categoryMap = {};

    products.forEach((product) => {
      let category = product.productCategory;
      if (!categoryMap[category]) categoryMap[category] = [];
      categoryMap[category].push({
        ...product,
        _id: product._id.toString(),
        type: "product",
      });
    });

    families.forEach((family) => {
      let category = family.familyCategory;
      if (!categoryMap[category]) categoryMap[category] = [];
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
    return null;
  }
}

export async function getServerSideProps() {
  let categoryData = await getCategoriesWithProducts();
  return { props: { data: categoryData } };
}

export default function Home({ data }) {
  return <ProductList data={data} />;
}
