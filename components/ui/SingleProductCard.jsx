"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import SuccessModal from "./SuccessModal";

const SingleProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState("1");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity("1");
    setShowSuccessModal(true);
  };

  return (
    <div>
      <div className="mb-6 md:flex md:gap-6">
        <div className="relative w-full aspect-square md:w-1/2">
          <Image
            src={
              product.productSku
                ? `/${product.productSku}.webp`
                : "/placeholder-product.jpg"
            }
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

          {product.productDetail && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-1">
                Ürün Detayları
              </h3>
              <p className="text-sm text-gray-600">{product.productDetail}</p>
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
              onClick={handleAddToCart}
            >
              Sepete Ekle
            </button>
          </div>
        </div>
      </div>
      {showSuccessModal && (
        <SuccessModal
          message="Ürün sepete eklendi!"
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default SingleProductCard;
