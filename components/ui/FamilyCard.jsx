import Link from "next/link";
import Image from "next/image";
import { Divider } from "@heroui/react";

const FamilyCard = ({ family }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(family.productPrice);

  return (
    <Link
      href={`/products/${family.familyCode}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-100 w-28 h-52 m-1 flex flex-col justify-between"
    >
      <div className="min-h-28 bg-gray-200 flex items-center justify-center relative">
        <Image
          src={`/${family.familyCode}.webp`}
          alt={family.familyName}
          fill
          className="object-cover"
        />
      </div>
      <Divider></Divider>
      <div className="p-4 text-center mt-auto">
        <h2 className="text-xs font-semibold text-gray-800 mb-1">
          {family.productName}
        </h2>
        <div className="flex justify-center items-center mt-auto">
          <span className="text-sm font-bold text-blue-600">
            {formattedPrice}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FamilyCard; 