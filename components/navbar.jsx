"use client";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import React, { useState, useEffect } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo, CartIcon } from "@/components/icons";
import { useCart } from "@/context/CartContext";

export const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { cartItemsCount } = useCart();

  useEffect(() => {
    if (searchTerm) {
      const fetchSearchResults = async () => {
        try {
          const response = await fetch(`/api/search?query=${searchTerm}`);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const text = await response.text();
          const results = text ? JSON.parse(text) : [];

          setSearchResults(results);
        } catch (error) {
          console.error("Arama hatası:", error);
          setSearchResults([]);
        }
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchInput = (
    <div className="relative w-full">
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm w-full",
        }}
        labelPlacement="outside"
        placeholder="Aradığınız ürünü kolayca bulun"
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsSearchFocused(false), 200);
        }}
      />

      {isSearchFocused && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden bg-content1 border border-default-200 rounded-lg shadow-lg">
          <div className="max-h-[300px] overflow-y-auto">
            {searchResults.map((result) => (
              <NextLink
                key={result._id}
                href={`/products/${result.code}`}
                onClick={() => setSearchTerm("")}
                className="block px-4 py-2 hover:bg-default-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{result.name}</span>
                  <span className="text-xs text-default-400">
                    {result.type === "product" ? "Ürün" : "Ürün Ailesi"}
                  </span>
                </div>
                <div className="text-xs text-default-400">{result.code}</div>
              </NextLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <HeroUINavbar 
      maxWidth="2xl" 
      className="bg-background/70 backdrop-blur-sm" 
      position="sticky"
    >
      {/* Mobil Görünüm */}
      <div className="lg:hidden w-full flex flex-col items-center">
        <div className="w-full flex justify-center py-1">
          <NextLink href="/">
            <img src="/elzemlogo.svg" alt="Elzem Logo" className="pt-10 w-40" />
          </NextLink>
        </div>
        <div className=" w-full flex gap-4 items-center px-4 mb-1 mt-2">
          <div className="flex-1">{searchInput}</div>
          <NextLink href="/cart" className="relative justify-end">
            <CartIcon className="w-8 h-8 text-gray-800" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                {cartItemsCount}
              </span>
            )}
          </NextLink>
        </div>
      </div>

      {/* Web Görünüm */}
      <div className="hidden lg:flex items-center justify-between w-full min-h-10 py-2">
        <div className="flex-1 flex justify-start">
          <NextLink href="/">
            <img src="/elzemlogo.svg" alt="Elzem Logo" className="w-40 h-32" />
          </NextLink>
        </div>
        <div className="flex-1 flex justify-center">{searchInput}</div>
        <div className="flex-1 flex justify-end">
          <NextLink href="/cart" className="relative mr-4">
            <CartIcon className="w-8 h-8 antialiased text-gray-800" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                {cartItemsCount}
              </span>
            )}
          </NextLink>
        </div>
      </div>
    </HeroUINavbar>
  );
};
