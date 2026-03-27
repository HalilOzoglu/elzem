import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";
import { ProductCard, FamilyCard } from "@/components/ui/CategoryProducts";

export const dynamic = "force-dynamic";

async function getCategoryProducts(category) {
  await dbConnect();

  const products = await Product.find({ productCategory: category })
    .select("productCategory productName productPrice productDetail productCount productSku productImg1")
    .lean();

  const families = await Family.find({ familyCategory: category })
    .select("familyName familyCategory familyDetail familyCode familyBasePrice productImg1")
    .lean();

  const formattedProducts = [
    ...products.map(product => ({
      ...product,
      _id: product._id.toString(),
      type: "product"
    })),
    ...families.map(family => ({
      ...family,
      _id: family._id.toString(),
      productName: family.familyName,
      productCategory: family.familyCategory,
      productDetail: family.familyDetail,
      productPrice: family.familyBasePrice,
      productSku: family.familyCode,
      productImg1: family.productImg1,
      type: "family"
    }))
  ];

  return formattedProducts;
}

export default async function CategoryPage({ params }) {
  const category = decodeURIComponent(params.category);
  const products = await getCategoryProducts(category);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 capitalize">{category}</h1>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {products.map((item) => (
          item.type === "product" ? (
            <ProductCard className="font-light" key={item.productSku} product={item} />
          ) : (
            <FamilyCard className="font-light" key={item.familyCode} family={item} />
          )
        ))}
      </div>
    </div>
  );
} 