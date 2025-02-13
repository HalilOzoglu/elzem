"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const SingleProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState("1");
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

  return (
    <div className="mb-6 md:flex md:gap-6">
      <div className="relative w-full aspect-square md:w-1/2">
        <Image
          src="/placeholder-product.jpg" // Varsayılan ürün görseli
          alt={product.productName || product.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {formattedPrice}
          </span>
          <span className="text-sm text-gray-500">
            SKU: {product.productSku || product.sku}
          </span>
        </div>

        {(product.productCount || product.count) && (
          <div className="mt-2 text-sm text-gray-600">
            Stok Durumu:{" "}
            <span className="font-medium">
              {product.productCount || product.count} adet
            </span>
          </div>
        )}

        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="quantity"
              className="block text-sm text-gray-600 mb-1"
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
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            className="flex-1 bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition-colors"
            onClick={() => {
              addToCart(product, quantity);
              setQuantity("");
            }}
          >
            Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProductCard;
