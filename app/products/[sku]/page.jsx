import Link from "next/link";
import { notFound } from "next/navigation";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";

async function getProductData(sku) {
  try {
    await dbConnect();

    // 1. Product kontrolü
    const product = await Product.findOne({ productSku: sku })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (product) return { data: product, type: "product" };

    // 2. Family kontrolü
    const family = await Family.findOne({ familyCode: sku })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (!family) return null;

    return {
      type: "family",
      data: {
        ...family,
        productName: family.familyName,
        productBrand: family.familyBrand,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        variants: family.variants,
      },
    };
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    return null;
  }
}

export default async function ProductDetail({ params }) {
  const { sku } = await params;
  const result = await getProductData(sku);

  if (!result?.data) {
    notFound();
  }

  const product = result.data;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.productName}
          </h1>

          {result.type === "family" ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Varyantlar
              </h2>
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div
                    key={variant.sku}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {variant.variantName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {variant.variantDetail}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        ${variant.price}
                      </span>
                      <Link
                        href={`/products/${variant.sku}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Seç
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <span className="text-2xl font-bold text-blue-600">
                ${product.productPrice || product.price}
              </span>
              <span className="ml-4 text-sm text-gray-500">
                SKU: {product.productSku || product.sku}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Detaylar
              </h2>
              <p className="text-gray-600">{product.productDetail}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Özellikler
              </h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Marka</span>
                  <span className="text-gray-800">{product.productBrand}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Kategori</span>
                  <span className="text-gray-800">
                    {product.productCategory}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Stok Adedi</span>
                  <span className="text-gray-800">
                    {product.productCount || product.count}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            &larr; Geri Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
