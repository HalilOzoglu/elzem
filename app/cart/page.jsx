"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

const CartItem = ({ item, updateCartQuantity, removeFromCart }) => {
  const [inputValue, setInputValue] = React.useState(item.quantity.toString());

  // Cart'taki quantity değiştiğinde inputu güncellemek için
  React.useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const handleInputChange = (e) => {
    // Kullanıcının geçici olarak inputu boş bırakabilmesi için değeri direkt state'e aktarıyoruz
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Inputtan çıkıldığında sayısal değeri kontrol ediyoruz
    let newQuantity = parseInt(inputValue);
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }
    updateCartQuantity(item.sku, newQuantity);
    setInputValue(newQuantity.toString());
  };

  const handleDecrease = () => {
    if (item.quantity === 1) {
      removeFromCart(item.sku);
    } else {
      updateCartQuantity(item.sku, item.quantity - 1);
    }
  };

  const price = item.price || item.productPrice || 0;

  return (
    <div className="flex items-center gap-4 p-4 border rounded-md">
      <div className="relative w-24 h-24">
        <Image
          src="/placeholder-product.jpg"
          alt={item.productName || item.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold">
          {item.productName || item.name}
        </h2>
        <p className="text-gray-600">SKU: {item.sku}</p>
        {item.variantInfo && (
          <div className="text-sm text-gray-500">
            {item.variantInfo.v1 && <span>{item.variantInfo.v1} </span>}
            {item.variantInfo.v2 && <span>{item.variantInfo.v2} </span>}
            {item.variantInfo.v3 && <span>{item.variantInfo.v3}</span>}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center border rounded">
          <button
            onClick={handleDecrease}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 text-center border-0 focus:ring-0"
          />
          <button
            onClick={() => updateCartQuantity(item.sku, item.quantity + 1)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300"
          >
            +
          </button>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(item.quantity * price)}
          </p>
          <p className="text-sm text-gray-500">
            {item.quantity} x{" "}
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(price)}
          </p>
        </div>
      </div>
      <button
        onClick={() => removeFromCart(item.sku)}
        className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors"
      >
        Sil
      </button>
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateCartQuantity } = useCart();

  const totalPrice = cart.reduce((total, item) => {
    const price = item.price || item.productPrice || 0;
    return total + price * item.quantity;
  }, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sepetiniz</h1>
      {cart.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <div className="space-y-6">
          {cart.map((item) => (
            <CartItem
              key={item.sku || item.productSku}
              item={item}
              updateCartQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
            />
          ))}
          <div className="text-right">
            <h2 className="text-2xl font-bold">
              Toplam:{" "}
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(totalPrice)}
            </h2>
          </div>
          <div className="text-right">
            <button className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors">
              Siparişi Onayla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
