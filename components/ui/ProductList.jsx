"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

// Ürün Kartı Komponenti
const ProductCard = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(product.productPrice);

  return (
    <Link
      href={`/products/${product.productSku}`}
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
            {formattedPrice}
          </span>
          <span className="text-sm text-gray-500">
            Stok: {product.productCount}
          </span>
        </div>
      </div>
    </Link>
  );
};

// Ürün Ailesi Kartı Komponenti
const FamilyCard = ({ family }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(family.productPrice);

  return (
    <Link
      href={`/products/${family.familyCode}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-blue-100"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {family.productName}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Varyantlı Ürün
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {family.productDetail}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-blue-600">
              {formattedPrice}
            </span>
            <span className="text-xs text-gray-500 block">
              Başlangıç fiyatı
            </span>
          </div>
          <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            Seçenekler Mevcut
          </span>
        </div>
      </div>
    </Link>
  );
};

// Kategori Bölümü Komponenti
const CategorySection = ({ category, products: initialProducts }) => {
  const [expanded, setExpanded] = useState(false);
  const [products] = useState(initialProducts);

  const displayProducts = expanded ? products : products.slice(0, 8);
  const hasMore = products.length > 8;

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
          <span className="text-sm text-gray-500">{products.length} ürün</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayProducts.map((item) =>
          item.type === "product" ? (
            <ProductCard key={item.productSku} product={item} />
          ) : (
            <FamilyCard key={item.familyCode} family={item} />
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
    <main className="container mx-auto px-4 py-8">
      {Object.entries(data).map(([category, products]) => (
        <CategorySection
          key={category}
          category={category}
          products={products}
        />
      ))}
    </main>
  );
};

export default ProductList;
