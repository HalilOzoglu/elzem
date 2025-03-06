"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { addToast } from "@heroui/toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const toastTimeoutRef = useRef({});

  const showToast = useCallback((message) => {
    const toastKey = JSON.stringify(message);
    if (toastTimeoutRef.current[toastKey]) return;

    addToast(message);
    toastTimeoutRef.current[toastKey] = true;

    setTimeout(() => {
      toastTimeoutRef.current[toastKey] = false;
    }, 1500);
  }, []);

  // Uygulama açılır açılmaz localStorage'dan sepet verilerini oku
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Sepet verileri okunurken hata oluştu:", error);
        showToast({
          title: "Hata",
          description: "Sepet verileri yüklenirken bir hata oluştu",
          variant: "solid",
          timeout: 1500,
          color: "danger"
        });
      }
    }
  }, [showToast]);

  // Sepet her güncellendiğinde localStorage'e kaydet
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Sepet verileri kaydedilirken hata oluştu:", error);
      showToast({
        title: "Hata",
        description: "Sepet verileri kaydedilirken bir hata oluştu",
        variant: "solid",
        timeout: 1500,
        color: "danger"
      });
    }
  }, [cart, showToast]);

  const addToCart = useCallback((item, quantity = 1) => {
    try {
      if (!item) {
        throw new Error("Ürün bilgisi eksik");
      }

      const numericQuantity = parseInt(quantity) || 1;
      
      // Ürün verilerini güvenli bir şekilde birleştir
      const mergedItem = {
        ...item,
        sku: item.variant ? item.variant.sku : (item.productSku || item.sku),
        price: item.variant ? item.variant.price : (item.productPrice || item.price),
        productName: item.productName || item.familyName || item.name,
        quantity: numericQuantity
      };

      // Varyant bilgisi varsa ekle
      if (item.variant) {
        mergedItem.variantInfo = {
          v1: item.variant.v1 || null,
          v2: item.variant.v2 || null,
          v3: item.variant.v3 || null,
        };
        // Varyantlı ürünlerde ailenin fotoğrafını kullan
        mergedItem.productImg1 = item.productImg1;
        mergedItem.productImgMini = item.productImgMini;
      }

      setCart((prevCart) => {
        // Önce mevcut sepeti kontrol et
        const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.sku === mergedItem.sku);

        // Eğer ürün zaten sepette varsa
        if (existingItemIndex > -1) {
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + numericQuantity
          };
          
          showToast({
            title: "Ürün Güncellendi",
            description: `${mergedItem.productName} (${updatedCart[existingItemIndex].quantity} adet)`,
            variant: "solid",
            timeout: 1500,
            color: "secondary"
          }); 
          
          return updatedCart;
        }

        // Eğer ürün sepette yoksa
        showToast({
          title: "Ürün Eklendi",
          description: mergedItem.productName,
          variant: "solid",
          timeout: 1500,
          color: "success"
        });
        
        return [...prevCart, mergedItem];
      });
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      showToast({
        title: "Hata",
        description: "Ürün sepete eklenirken bir hata oluştu",
        variant: "solid",
        timeout: 1500,
        color: "danger"
      });
    }
  }, [showToast]);

  const removeFromCart = useCallback((itemSku) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find(item => item.sku === itemSku);
      if (itemToRemove) {
        showToast({
          title: "Ürün Kaldırıldı",
          description: itemToRemove.productName,
          variant: "solid",
          timeout: 1500,
          color: "danger"
        });
      }
      return prevCart.filter((item) => item.sku !== itemSku);
    });
  }, [showToast]);

  const updateCartQuantity = useCallback((itemSku, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.sku === itemSku) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  // Sepetteki belirli ürünün adet bilgisini güncelleyen fonksiyon
  const cartItemsCount = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        cartItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
