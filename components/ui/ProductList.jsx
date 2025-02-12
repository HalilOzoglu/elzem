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
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-blue-100 w-32 h-60 m-1"
    >
      <div className="min-h-40 bg-gray-200 flex items-center justify-center">
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
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 w-32 h-60 m-1"
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
};

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
    <main className="container mx-auto px-4 py-8 flex flex-wrap gap-4">
      {Object.entries(data).map(([category, products]) => (
        <div key={category} className="w-full md:w-1/2 lg:w-1/3">
          <CategorySection category={category} products={products} />
        </div>
      ))}
    </main>
  );
};

export default ProductList;
