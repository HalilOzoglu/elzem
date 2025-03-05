"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const SingleProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState("1");
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(product.productPrice || product.price);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity("");
      return;
    }
    const numericValue = parseInt(value);
    if (
      numericValue > 0 &&
      numericValue <= (product.productCount || product.count)
    ) {
      setQuantity(numericValue.toString());
    }
  };

  const handleAddToCart = useCallback(() => {
    if (isAdding) return;
    
    setIsAdding(true);
    const cartItem = {
      ...product,
      productName: product.productName || product.name,
      sku: product.productSku || product.sku,
      price: product.productPrice || product.price,
      count: product.productCount || product.count,
      box: product.productBox || product.box,
    };
    addToCart(cartItem, quantity);
    setQuantity("1");
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  }, [isAdding, product, quantity, addToCart]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-8">
      <div className="w-full lg:w-1/2">
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={
              product.productSku
                ? `/${product.productSku}.webp`
                : "/placeholder-product.jpg"
            }
            alt={product.productName || product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="w-full lg:w-1/2 space-y-6">
        <div className="flex flex-col space-y-1">
          <span className="text-3xl font-bold text-blue-600">
            {formattedPrice}
          </span>
          <span className="text-sm text-gray-500">
            KDV Dahil
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Stok Durumu:</span>
            <span className="text-sm px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
              Stokta Var
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Kutu İçi Sayısı:</span>
            <span className="text-sm text-gray-800 font-medium">
              {product.productBox || product.box} Adet
            </span>
          </div>
        </div>

        {product.productDetail && (
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold text-gray-800">Ürün Detayları</h3>
            <p className="text-gray-600 leading-relaxed">{product.productDetail}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="w-full sm:w-1/3">
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adet
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              max={product.productCount || product.count}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            className={`w-full sm:w-2/3 bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 ${
              isAdding ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <span>{isAdding ? "Ekleniyor..." : "Sepete Ekle"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductCard;
