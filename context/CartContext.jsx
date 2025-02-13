"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Uygulama açılır açılmaz localStorage'dan sepet verilerini oku
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Sepet verileri okunurken hata oluştu:", error);
      }
    }
  }, []);

  // Sepet her güncellendiğinde localStorage'e kaydet
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity) => {
    const numericQuantity = parseInt(quantity) || 1;

    const mergedItem = item.variant
      ? {
          ...item,
          sku: item.variant.sku,
          price: item.variant.price,
          count: item.variant.count,
          box: item.variant.box,
          variantInfo: {
            v1: item.variant.v1,
            v2: item.variant.v2,
            v3: item.variant.v3,
          },
        }
      : {
          ...item,
          price: item.productPrice,
        };

    setCart((prevCart) => {
      const itemIndex = prevCart.findIndex((cartItem) => {
        if (mergedItem.sku) {
          return cartItem.sku === mergedItem.sku;
        }
        return cartItem._id === mergedItem._id;
      });

      if (itemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[itemIndex].quantity += numericQuantity;
        return updatedCart;
      }
      return [...prevCart, { ...mergedItem, quantity: numericQuantity }];
    });
  };

  const removeFromCart = (itemSku) => {
    setCart((prevCart) => prevCart.filter((item) => item.sku !== itemSku));
  };

  // Sepet simgesinde gösterilecek sayı, ürün adedine göre değil benzersiz ürün sayısına göre hesaplanır.
  const cartItemsCount = cart.length;

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, cartItemsCount }}
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
