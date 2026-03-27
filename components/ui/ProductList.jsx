"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProductCard from "./ProductCard";
import FamilyCard from "./FamilyCard";

// Kategori Bölümü Komponenti
const CategorySection = ({ category, products: initialProducts }) => {
  const [products] = useState(initialProducts);
  
  // Ekran genişliğine göre gösterilecek ürün sayısını belirle
  const displayCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 3;
  const displayProducts = products.slice(0, displayCount);
  const hasMore = products.length > displayCount;

  return (
    <section className="mb-12">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link href={`/category/${encodeURIComponent(category)}`}>
            <div className="hover:text-blue-600 flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 capitalize">
                  {category}
                </h1>
                <div className="h-1 w-20 bg-blue-500 mt-2 rounded-full" />
              </div>
              {hasMore && (
                <span className="text-xs text-gray-400 hover:text-gray-600">
                  Tümünü Göster {"+ " +products.length}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {displayProducts.map((item) =>
          item.type === "product" ? (
            <ProductCard key={item.productSku} product={item} />
          ) : (
            <FamilyCard key={item.familyCode} family={item} />
          )
        )}
      </div>
    </section>
  );
};

const ProductList = ({ data }) => {
  useEffect(() => {
    if (!data) {
      window.location.reload();
    }
  }, [data]);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Ürünler yüklenirken bir hata oluştu. Sayfa yenileniyor...
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

  // Kategorileri ürün sayısına göre sıralayın
  const sortedCategories = Object.entries(data).sort(
    ([, productsA], [, productsB]) => productsB.length - productsA.length
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sortedCategories.map(([category, products]) => (
        <div key={category} className="w-full">
          <CategorySection category={category} products={products} />
        </div>
      ))}
    </div>
  );
};

export default ProductList;
