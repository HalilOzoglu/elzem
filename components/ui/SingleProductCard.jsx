import React from "react";

const SingleProductCard = ({ product }) => {
  const formattedPrice = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(product.productPrice || product.price);

  return (
    <div className="mb-6">
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
    </div>
  );
};

export default SingleProductCard;
