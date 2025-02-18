"use client";
import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import SuccessModal from "./SuccessModal";

const ProductFamilyClient = ({ variants, product }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    v1: "",
    v2: "",
    v3: "",
  });

  const [quantity, setQuantity] = useState("1");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { addToCart } = useCart();

  const variantNames = useMemo(
    () => ({
      v1: product.familyV1Name,
      v2: product.familyV2Name,
      v3: product.familyV3Name,
    }),
    [product]
  );

  const activeKeys = useMemo(
    () =>
      Object.entries(variantNames)
        .filter(([_, name]) => name)
        .map(([key]) => key),
    [variantNames]
  );

  const filteredOptions = useMemo(() => {
    const options = {};
    activeKeys.forEach((key, index) => {
      const prevKeys = activeKeys.slice(0, index);
      const filtered = variants.filter((variant) =>
        prevKeys.every(
          (k) => !selectedOptions[k] || variant[k] === selectedOptions[k]
        )
      );
      options[key] = [...new Set(filtered.map((v) => v[key]))];
    });
    return options;
  }, [activeKeys, variants, selectedOptions]);

  const filteredVariants = useMemo(
    () =>
      variants.filter((variant) =>
        activeKeys.every(
          (key) =>
            !selectedOptions[key] || variant[key] === selectedOptions[key]
        )
      ),
    [variants, selectedOptions, activeKeys]
  );

  const selectedVariant = useMemo(
    () => (filteredVariants.length === 1 ? filteredVariants[0] : null),
    [filteredVariants]
  );

  const handleOptionChange = useCallback(
    (key, value) => {
      setSelectedOptions((prev) => {
        const newOptions = { ...prev, [key]: value };

        // Reset dependent options
        const keyIndex = activeKeys.indexOf(key);
        if (keyIndex > -1) {
          activeKeys.slice(keyIndex + 1).forEach((k) => {
            newOptions[k] = "";
          });
        }

        return newOptions;
      });
    },
    [activeKeys]
  );

  const handleQuantityChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value === "") {
        setQuantity("");
        return;
      }
      const numericValue = parseInt(value);
      if (
        selectedVariant &&
        numericValue > 0 &&
        numericValue <= selectedVariant.count
      ) {
        setQuantity(numericValue.toString());
      }
    },
    [selectedVariant]
  );

  const handleAddToCart = useCallback(() => {
    if (selectedVariant) {
      const cartItem = {
        ...product,
        variant: selectedVariant,
        // Varyant bilgilerini ana seviyeye taşıyoruz
        sku: selectedVariant.sku,
        price: selectedVariant.price,
        count: selectedVariant.count,
        box: selectedVariant.box,
      };
      addToCart(cartItem, quantity);
      setQuantity("1"); // Varsayılan değer olarak 1'e çekiyoruz
      setShowSuccessModal(true);
    }
  }, [selectedVariant, quantity, product, addToCart]);

  return (
    <div className="md:flex md:gap-6">
      <div className="relative w-full aspect-square md:w-1/2">
        <Image
          src={
            product.familyCode
              ? `/${product.familyCode}.webp`
              : "/placeholder-product.jpg"
          }
          alt={product.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Varyantlar
          </h2>

          {activeKeys.map((key) => (
            <div key={key} className="mb-4">
              <label className="block text-gray-600 mb-1">
                {variantNames[key]}
              </label>
              <select
                value={selectedOptions[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
              >
                <option value="">Seçin</option>
                {filteredOptions[key]?.map((optionValue) => (
                  <option key={optionValue} value={optionValue}>
                    {optionValue}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {selectedVariant && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Seçilen Varyant Bilgileri
              </h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">SKU</span>
                  <span className="text-gray-800">{selectedVariant.sku}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Fiyat</span>
                  <span className="text-gray-800 font-semibold">
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(selectedVariant.price)}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Kutu</span>
                  <span className="text-gray-800">{selectedVariant.box}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Stok</span>
                  <span className="text-gray-800">{selectedVariant.count}</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="variant-quantity"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Adet
                </label>
                <input
                  type="number"
                  id="variant-quantity"
                  min="1"
                  max={selectedVariant.count}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.count < 1}
                className="flex-1 bg-blue-600 text-white rounded py-2 px-4 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {selectedVariant.count < 1 ? "Stokta Yok" : "Sepete Ekle"}
              </button>
            </div>
          </div>
        )}
      </div>
      {showSuccessModal && (
        <SuccessModal
          message={`Ürün sepete başarıyla eklendi!`}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default React.memo(ProductFamilyClient);
