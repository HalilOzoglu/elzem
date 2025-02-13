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
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";

export const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    <div className="relative w-64">
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
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="flex basis-1/5 sm:basis-full" justify="center">
        {searchInput}
      </NavbarContent>
    </HeroUINavbar>
  );
};
