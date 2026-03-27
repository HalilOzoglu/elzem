"use client";

import Link from "next/link";
import Image from "next/image";
import { Divider } from "@heroui/react";
import { useState } from "react";

const FamilyCard = ({ family }) => {
  const [imgSrc, setImgSrc] = useState(family.productImgMini || family.productImg1 || "/placeholder-product.jpg");
  
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(family.productPrice);

  return (
    <Link
      href={`/products/${family.familyCode}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 w-28 h-52 m-1 flex flex-col"
    >
      <div className="min-h-28 bg-gray-200 flex items-center justify-center relative">
        <Image
          src={imgSrc}
          alt={family.familyName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgSrc("/placeholder-product.jpg")}
        />
      </div>
      <Divider />
      <div className="p-2 flex flex-col h-[88px] text-center">
        <h2 className="text-xs font-semibold text-gray-800 max-h-[40px] overflow-hidden px-1">
          {family.familyName}
        </h2>
        <div className="mt-auto">
          <span className="text-sm font-bold text-blue-600 block">
            {formattedPrice}
          </span>
          <span className="text-[8px] text-gray-500 block">KDV DAHİL</span>
        </div>
      </div>
    </Link>
  );
};

export default FamilyCard; 