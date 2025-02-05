"use client";
import React, { useState } from "react";

const ProductFamilyClient = ({ variants, product }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    v1: "",
    v2: "",
    v3: "",
  });

  const handleOptionChange = (key, value) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }));
  };

  const getFilteredOptions = (key) => {
    const keys = Object.keys(selectedOptions);
    const currentIndex = keys.indexOf(key);

    return [
      ...new Set(
        variants
          .filter((variant) =>
            keys
              .slice(0, currentIndex)
              .every(
                (k) => !selectedOptions[k] || variant[k] === selectedOptions[k]
              )
          )
          .map((variant) => variant[key])
      ),
    ];
  };

  const filteredVariants = variants.filter((variant) =>
    Object.entries(selectedOptions).every(
      ([key, value]) => !value || variant[key] === value
    )
  );

  const selectedVariant =
    filteredVariants.length === 1 ? filteredVariants[0] : null;

  const variantNames = {
    v1: product.familyV1Name,
    v2: product.familyV2Name,
    v3: product.familyV3Name,
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Varyantlar</h2>

      {Object.entries(variantNames).map(
        ([key, name]) =>
          name && (
            <div key={key} className="mb-4">
              <label className="block text-gray-600 mb-1">{name}</label>
              <select
                value={selectedOptions[key]}
                onChange={(e) => handleOptionChange(key, e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
              >
                <option value="">Seçin</option>
                {getFilteredOptions(key).map((optionValue) => (
                  <option key={optionValue} value={optionValue}>
                    {optionValue}
                  </option>
                ))}
              </select>
            </div>
          )
      )}

      {selectedVariant && (
        <div className="mt-4">
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
              <span className="text-gray-800">{selectedVariant.price} TL</span>
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
      )}
    </div>
  );
};

export default ProductFamilyClient;
