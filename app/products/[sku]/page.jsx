import Link from "next/link";
import { notFound } from "next/navigation";
import Product from "@/models/product";
import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";
import SingleProductCard from "@/components/ui/SingleProductCard";
import ProductFamilyClient from "@/components/ui/ProductFamilyClient";

async function getProductData(sku) {
  try {
    await dbConnect();

    // 1. Product kontrolü
    let product = await Product.findOne({ productSku: sku })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (product) {
      // Product verilerini düz JavaScript objesine dönüştür
      const serializedProduct = JSON.parse(
        JSON.stringify({
          ...product,
          _id: product._id.toString(),
        })
      );
      return { data: serializedProduct, type: "product" };
    }

    // 2. Family kontrolü
    const family = await Family.findOne({ familyCode: sku })
      .select("-__v -createdAt -updatedAt")
      .lean();

    if (!family) return null;

    // Family verilerini düz JavaScript objesine dönüştür
    const serializedFamily = JSON.parse(
      JSON.stringify({
        ...family,
        _id: family._id.toString(),
        productName: family.familyName,
        productBrand: family.familyBrand,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        variants: family.variants.map((variant) => ({
          ...variant,
          _id: variant._id.toString(),
        })),
      })
    );

    return {
      type: "family",
      data: serializedFamily,
    };
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    return null;
  }
}

// Ürün detayları komponenti
function ProductDetails({ product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Detaylar</h2>
        <p className="text-gray-600">{product.productDetail}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Özellikler</h2>
        <ul className="space-y-2">
          {product.productBrand && (
            <li className="flex justify-between">
              <span className="text-gray-600">Marka</span>
              <span className="text-gray-800">{product.productBrand}</span>
            </li>
          )}
          <li className="flex justify-between">
            <span className="text-gray-600">Kategori</span>
            <span className="text-gray-800">{product.productCategory}</span>
          </li>
          {(product.productCount || product.count) && (
            <li className="flex justify-between">
              <span className="text-gray-600">Stok Adedi</span>
              <span className="text-gray-800">
                {product.productCount || product.count}
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default async function ProductDetail({ params }) {
  const { sku } = params;
  const result = await getProductData(sku);

  if (!result?.data) {
    notFound();
  }

  const product = result.data;

  // Varyant isimlerini ve değerlerini filtreleme
  const variantNames = {
    v1: product.familyV1Name,
    v2: product.familyV2Name,
    v3: product.familyV3Name,
  };

  // Sadece dolu olan varyantları filtrele
  const availableVariants = Object.entries(variantNames)
    .filter(([_, value]) => value)
    .map(([key, value]) => ({ key, value }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.productName}
          </h1>

          {result.type === "family" ? (
            <ProductFamilyClient
              variants={product.variants}
              availableVariants={availableVariants}
              product={product}
            />
          ) : (
            <SingleProductCard product={product} />
          )}

          <ProductDetails product={product} />

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
