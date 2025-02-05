import Link from "next/link";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";

async function getCategoriesWithProducts() {
  try {
    await dbConnect();

    // Tüm kategorileri ve ürünleri çek
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

    // Kategorilere göre gruplama
    const categoryMap = {};

    // Product'ları işle
    products.forEach((product) => {
      const category = product.productCategory;
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push({
        ...product,
        type: "product",
      });
    });

    // Family'leri işle
    families.forEach((family) => {
      const category = family.familyCategory;
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push({
        ...family,
        productName: family.familyName,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        productPrice: family.basePrice, // Fiyatı "den başlayan" şeklinde göster
        productSku: family.familyCode, // SKU yerine familyCode kullan
        type: "family",
      });
    });

    return categoryMap;
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    return {};
  }
}

export default async function Home() {
  let data = await getCategoriesWithProducts();
  // Eğer veri yoksa fallback UI
  if (Object.keys(data).length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {Object.entries(data).map(([category, products]) => (
        <section key={category} className="mb-12">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 capitalize">
              {category}
            </h1>
            <div className="h-1 w-20 bg-blue-500 mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 10).map((product) => (
              <Link
                key={product.productSku || product.familyCode}
                href={
                  product.type === "product"
                    ? `/products/${product.productSku}`
                    : `/products/${product.familyCode}`
                }
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {product.productName}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.productDetail}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {product.productPrice}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.type === "product"
                        ? `Stok: ${product.productCount}`
                        : "Varyantlar mevcut"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
