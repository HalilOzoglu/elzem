"use client";
import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const ProductFamilyClient = ({ variants, product }) => {
  const [selectedOptions, setSelectedOptions] = useState({
    v1: "",
    v2: "",
    v3: "",
  });

  const [quantity, setQuantity] = useState("1");
  const [isAdding, setIsAdding] = useState(false);
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
    
    // Özel format için sıralama fonksiyonu
    const compareValues = (a, b) => {
      // Özel varyant sıralaması için sıra değerleri
      const specialOrder = {
        'düz': 1,
        'deve': 2,
        'süper deve': 3
      };

      // Özel varyant kontrolü
      const aLower = a.toString().toLowerCase();
      const bLower = b.toString().toLowerCase();
      if (specialOrder[aLower] && specialOrder[bLower]) {
        return specialOrder[aLower] - specialOrder[bLower];
      }

      // Parantez içindeki bilgileri çıkararak ana değerleri alalım
      const cleanValue = (str) => str.toString().split('(')[0].trim();
      const aClean = cleanValue(a);
      const bClean = cleanValue(b);

      // Ondalıklı sayıları da kapsayan format kontrolü (örn: 3.5x20)
      const formatRegex = /^(\d*\.?\d+)x(\d*\.?\d+)$/;
      const matchA = aClean.match(formatRegex);
      const matchB = bClean.match(formatRegex);
      
      // Her iki değer de "3.5x20" formatındaysa
      if (matchA && matchB) {
        const [, num1A, num2A] = matchA;
        const [, num1B, num2B] = matchB;
        // Önce ilk sayıları karşılaştır
        const firstNumA = parseFloat(num1A);
        const firstNumB = parseFloat(num1B);
        if (firstNumA !== firstNumB) {
          return firstNumA - firstNumB;
        }
        // İlk sayılar eşitse ikinci sayıları karşılaştır
        const secondNumA = parseFloat(num2A);
        const secondNumB = parseFloat(num2B);
        return secondNumA - secondNumB;
      }
      
      // Normal sayısal kontrol
      const numA = parseFloat(aClean);
      const numB = parseFloat(bClean);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Diğer durumlar için alfabetik sıralama
      return aClean.localeCompare(bClean, 'tr');
    };

    activeKeys.forEach((key, index) => {
      const prevKeys = activeKeys.slice(0, index);
      const filtered = variants.filter((variant) =>
        prevKeys.every(
          (k) => !selectedOptions[k] || variant[k] === selectedOptions[k]
        )
      );
      const uniqueValues = [...new Set(filtered.map((v) => v[key]))];
      options[key] = uniqueValues.sort(compareValues);
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
    if (isAdding || !selectedVariant) return;
    
    setIsAdding(true);
    const cartItem = {
      ...product,
      variant: selectedVariant,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      count: selectedVariant.count,
      box: selectedVariant.box,
    };
    addToCart(cartItem, quantity);
    setQuantity("1");
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  }, [isAdding, selectedVariant, quantity, product, addToCart]);

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

        {selectedVariant ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Seçilen Varyant Bilgileri
              </h3>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fiyat</span>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-semibold text-blue-600">
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        }).format(selectedVariant.price)}
                      </span>
                      <span className="text-sm text-gray-500">KDV Dahil</span>
                    </div>
                  </div>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Kutu İçi Sayısı</span>
                  <span className="text-gray-800 font-medium">{selectedVariant.box} Adet</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Stok Durumu</span>
                  <span className="text-sm  py-1 bg-green-50 text-green-700 rounded-full font-medium">
                    Stokta Var
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="w-full sm:w-1/3">
                <label
                  htmlFor="variant-quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.count < 1 || isAdding}
                className={`w-full sm:w-2/3 bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed ${
                  isAdding ? "opacity-50" : ""
                }`}
              >
                <span>
                  {isAdding
                    ? "Ekleniyor..."
                    : selectedVariant?.count < 1
                    ? "Stokta Yok"
                    : "Sepete Ekle"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="mb-3">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Varyant Seçimi Yapınız
                  </h3>
                  <p className="text-sm text-gray-500">
                    Fiyat ve stok bilgilerini görüntülemek için lütfen yukarıdaki varyant seçeneklerinden seçim yapınız.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <div className="w-full sm:w-1/3">
                <div className="h-[70px] bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="w-full sm:w-2/3">
                <div className="h-[42px] bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductFamilyClient);
