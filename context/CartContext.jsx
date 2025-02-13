"use client";
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity) => {
    const numericQuantity = parseInt(quantity) || 1;
    setCart((prevCart) => {
      // Eğer sepette aynı ürün varsa adeti güncelle, yoksa ekle.
      const itemIndex = prevCart.findIndex(
        (cartItem) =>
          cartItem.id === item._id ||
          cartItem.sku === item.productSku ||
          cartItem.sku === item.sku
      );
      if (itemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[itemIndex].quantity += numericQuantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...item, quantity: numericQuantity }];
      }
    });
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, cartItemsCount }}>
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
