"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

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
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
        <Image
          src={item.productImg1 || "/placeholder-product.jpg"}
          alt={item.productName || item.name}
          fill
          className="object-cover"
          onError={(e) => {
            console.error("Fotoğraf yüklenemedi:", item.productImg1);
            e.target.src = "/placeholder-product.jpg";
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-medium text-gray-900 truncate">
          {item.productName || item.name}
        </h2>
        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
        {item.variantInfo && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.variantInfo.v1 && (
              <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                {item.variantInfo.v1}
              </span>
            )}
            {item.variantInfo.v2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                {item.variantInfo.v2}
              </span>
            )}
            {item.variantInfo.v3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                {item.variantInfo.v3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-row md:flex-col items-center gap-4 w-full md:w-auto">
        <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={handleDecrease}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <input
            type="number"
            min="1"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 text-center border-0 bg-transparent focus:ring-0"
          />
          <button
            onClick={() => updateCartQuantity(item.sku, item.quantity + 1)}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="text-right md:min-w-[120px]">
          <p className="text-lg font-semibold text-gray-900">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(item.quantity * price)}
          </p>
          <p className="text-sm text-gray-500">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(price)} / adet
          </p>
        </div>

        <button
          onClick={() => removeFromCart(item.sku)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateCartQuantity } = useCart();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const totalPrice = cart.reduce((total, item) => {
    const price = item.price || item.productPrice || 0;
    return total + price * item.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (!session) {
      router.push("/giris");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          total: totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sipariş oluşturulurken bir hata oluştu");
      }

      // Başarılı sipariş sonrası işlemler
      cart.forEach(item => removeFromCart(item.sku));
      router.push("/hesabim/siparislerim");
      
    } catch (err) {
      setError(err.message);
      console.error("Sipariş hatası:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-7 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Alışveriş Sepeti {cart.length > 0 && `(${cart.length} Ürün)`}
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 mb-4">Sepetinizde ürün bulunmuyor.</p>
            <Button
              onPress={() => router.push("/")}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Alışverişe Başla
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.sku || item.productSku}
                  item={item}
                  updateCartQuantity={updateCartQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Toplam</span>
                    <span>
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(totalPrice)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                {!session ? (
                  <Button
                    onPress={() => router.push("/giris")}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Giriş Yap
                  </Button>
                ) : (
                  <Button
                    onPress={handleCheckout}
                    disabled={isLoading}
                    className={`w-full bg-blue-600 text-white hover:bg-blue-700 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "İşleniyor..." : "Siparişi Onayla"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
