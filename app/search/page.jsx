import { ProductCard, FamilyCard } from "@/components/ui/CategoryProducts";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";

async function getSearchResults(query) {
  await dbConnect();

  // Ürünleri arama
  const products = await Product.find({
    $or: [
      { productName: { $regex: query, $options: "i" } },
      { productBrand: { $regex: query, $options: "i" } },
      { productCategory: { $regex: query, $options: "i" } },
      { productDetail: { $regex: query, $options: "i" } },
    ],
  })
    .select("productName productSku productBrand productCategory productPrice productDetail")
    .lean();

  // Aileleri arama
  const families = await Family.find({
    $or: [
      { familyName: { $regex: query, $options: "i" } },
      { familyBrand: { $regex: query, $options: "i" } },
      { familyCategory: { $regex: query, $options: "i" } },
      { familyDetail: { $regex: query, $options: "i" } },
    ],
  })
    .select("familyName familyCode familyBrand familyCategory familyBasePrice familyDetail")
    .lean();

  // Sonuçları birleştir ve dönüştür
  const results = [
    ...products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      type: "product",
    })),
    ...families.map((family) => ({
      ...family,
      _id: family._id.toString(),
      productName: family.familyName,
      productCategory: family.familyCategory,
      productDetail: family.familyDetail,
      productPrice: family.familyBasePrice,
      productSku: family.familyCode,
      type: "family",
    })),
  ];

  return results;
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams.query || "";
  const results = await getSearchResults(query);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          &ldquo;{query}&rdquo; için arama sonuçları
        </h1>
        <div className="h-1 w-20 bg-blue-500 mt-2 rounded-full" />
        <p className="text-gray-600 mt-4">
          {results.length} sonuç bulundu
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {results.map((item) =>
          item.type === "product" ? (
            <ProductCard key={item.productSku} product={item} />
          ) : (
            <FamilyCard key={item.familyCode} family={item} />
          )
        )}
      </div>

      {results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Aramanızla eşleşen sonuç bulunamadı.
          </p>
          <p className="text-gray-500 mt-2">
            Lütfen farklı anahtar kelimeler kullanarak tekrar deneyin.
          </p>
        </div>
      )}
    </div>
  );
} 