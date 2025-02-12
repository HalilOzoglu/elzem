"use client";

import React, { useState, lazy } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

const ProductCard = lazy(() => import(".//SingleProductCard"));
const FamilyCard = lazy(() => import(".//ProductFamilyClient"));

// Ürün Kartı Komponenti
const ProductCardComponent = React.memo(({ product }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(product.productPrice);

  return (
    <Link
      href={`/products/${product.productSku}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-blue-100 w-28 h-52 m-1 flex flex-col justify-between"
    >
      <div className="min-h-28 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Görsel</span>
      </div>
      <div className="p-2 text-center">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          {product.productName}
        </h2>
        <div className="flex justify-center items-center">
          <span className="text-sm font-bold text-blue-600">
            {formattedPrice}
          </span>
        </div>
      </div>
    </Link>
  );
});
ProductCard.displayName = "ProductCard";

// Ürün Ailesi Kartı Komponenti
const FamilyCardComponent = React.memo(({ family }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(family.productPrice);

  return (
    <Link
      href={`/products/${family.familyCode}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 w-28 h-52 m-1 flex flex-col justify-between"
    >
      <div className="min-h-40 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Görsel</span>
      </div>
      <div className="p-2 text-center">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">
          {family.productName}
        </h2>
        <div className="flex justify-center items-center">
          <span className="text-sm font-bold text-blue-600">
            {formattedPrice}
          </span>
        </div>
      </div>
    </Link>
  );
});
FamilyCard.displayName = "FamilyCard";

// Kategori Bölümü Komponenti
const CategorySection = ({ category, products: initialProducts }) => {
  const [expanded, setExpanded] = useState(false);
  const [products] = useState(initialProducts);

  const displayProducts = expanded ? products : products.slice(0, 12);
  const hasMore = products.length > 12;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 capitalize">
              {category}
            </h1>
            <div className="h-1 w-20 bg-blue-500 mt-2 rounded-full" />
          </div>
          <span className="text-sm text-gray-500"></span>
        </div>
      </div>

      <div className="flex flex-wrap justify-start">
        {displayProducts.map((item) =>
          item.type === "product" ? (
            <ProductCardComponent key={item.productSku} product={item} />
          ) : (
            <FamilyCardComponent key={item.familyCode} family={item} />
          )
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-6 w-full py-3 bg-gray-50 text-gray-600 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          {expanded ? (
            <>
              Daha az göster <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Tümünü göster ({products.length}){" "}
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </section>
  );
};

const ProductList = ({ data }) => {
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
        </div>
      </div>
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Henüz hiç ürün bulunmuyor.
        </div>
      </div>
    );
  }

  return (
    <main className="container px-4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedCategories.map(([category, products]) => (
          <div key={category} className="w-full">
            <CategorySection category={category} products={products} />
          </div>
        ))}
      </div>
    </main>
  );
};

// Örnek bir bileşen için props sıralama ve boş satır ekleme
const ExampleComponent = ({ aProp, bProp, cProp }) => {
  // ... existing code ...
};

// Boş satır eklenmesi gereken yer

export default ProductList;
