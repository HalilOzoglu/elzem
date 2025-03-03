import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Divider } from "@heroui/react";

export const ProductCard = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(product.productPrice);

  return (
    <Link
      href={`/products/${product.productSku}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 flex flex-col justify-between"
    >
      <div className="aspect-square relative">
        <Image
          src={`/${product.productSku}.webp`}
          alt={product.productName}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>
      <Divider />
      <div className="p-4 text-center">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          {product.productName}
        </h2>
        <span className="text-lg font-bold text-blue-600">
          {formattedPrice}
        </span>
      </div>
    </Link>
  );
};

export const FamilyCard = ({ family }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(family.productPrice);

  return (
    <Link
      href={`/products/${family.familyCode}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 flex flex-col justify-between"
    >
      <div className="aspect-square relative">
        <Image
          src={`/${family.familyCode}.webp`}
          alt={family.familyName}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>
      <Divider />
      <div className="p-4 text-center">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          {family.productName}
        </h2>
        <span className="text-lg font-bold text-blue-600">
          {formattedPrice}
        </span>
      </div>
    </Link>
  );
}; 