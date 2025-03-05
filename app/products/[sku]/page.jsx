import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from 'next/types';
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

// Metadata tanımı
export async function generateMetadata({ params }) {
  const { sku } = params;
  const result = await getProductData(sku);
  
  if (!result?.data) {
    return {
      title: 'Ürün Bulunamadı',
      description: 'Aradığınız ürün bulunamadı.',
    };
  }

  const product = result.data;
  
  return {
    title: `${product.productName || product.familyName} - Elzem`,
    description: product.productDetail || product.familyDetail,
    openGraph: {
      title: product.productName || product.familyName,
      description: product.productDetail || product.familyDetail,
      images: [
        {
          url: `/${product.productSku || product.familyCode}.webp`,
          width: 800,
          height: 800,
          alt: product.productName || product.familyName,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
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
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 lg:p-8">
              <nav className="mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Ana Sayfa
                </Link>
              </nav>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
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

              <div className="mt-12 border-t border-gray-100 pt-8">
                <ProductDetails product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
