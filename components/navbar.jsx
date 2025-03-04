"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserIcon, ShoppingCartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";

const Navbar = () => {
  const { cartItemsCount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Arama hatası:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleResultClick = (result) => {
    router.push(`/products/${result.code}`);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleProfileAction = (key) => {
    router.push(key);
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/">
            <Image src="/elzemlogo.svg" alt="Logo" width={120} height={40} />
          </Link>
          <div className="flex md:hidden items-center gap-4">
            <button onClick={() => router.push('/cart')} className="relative">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                  {cartItemsCount}
                </span>
              )}
            </button>
            {session ? (
              <Dropdown>
                <DropdownTrigger>
                  <button className="flex items-center">
                    <UserIcon className="h-6 w-6" />
                  </button>
                </DropdownTrigger>
                <DropdownMenu 
                  onAction={handleProfileAction}
                  aria-label="Profil menüsü"
                >
                  <DropdownItem key="/profil">Bilgilerim</DropdownItem>
                  <DropdownItem key="/hesabim/siparislerim">Siparişlerim</DropdownItem>
                  {session?.user?.isAdmin && (
                    <>
                      <DropdownItem key="/admin/create">Ürün Paneli</DropdownItem>
                      <DropdownItem key="/admin/orders">Sipariş Paneli</DropdownItem>
                    </>
                  )}
                </DropdownMenu>
              </Dropdown>
            ) : (
              <button onClick={() => router.push('/giris')}>
                <UserIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-0 w-full md:w-1/2 relative" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {showDropdown && searchResults.length > 0 && (
            <Dropdown isOpen={showDropdown}>
              <DropdownMenu 
                aria-label="Arama sonuçları"
                items={searchResults}
                onAction={(key) => {
                  const result = searchResults.find(r => r._id === key);
                  if (result) handleResultClick(result);
                }}
              >
                {(result) => (
                  <DropdownItem key={result._id}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600">
                          {result.brand} - {result.category}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-indigo-600">
                        {result.price} ₺
                      </div>
                    </div>
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => router.push('/cart')} className="relative">
            <ShoppingCartIcon className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                {cartItemsCount}
              </span>
            )}
          </button>
          {session ? (
            <Dropdown>
              <DropdownTrigger>
                <button className="flex items-center">
                  <UserIcon className="h-6 w-6" />
                </button>
              </DropdownTrigger>
              <DropdownMenu 
                onAction={handleProfileAction}
                aria-label="Profil menüsü"
              >
                <DropdownItem key="/profil">Bilgilerim</DropdownItem>
                <DropdownItem key="/hesabim/siparislerim">Siparişlerim</DropdownItem>
                {session?.user?.isAdmin && (
                  <>
                    <DropdownItem key="/admin/create">Ürün Paneli</DropdownItem>
                    <DropdownItem key="/admin/orders">Sipariş Paneli</DropdownItem>
                  </>
                )}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <button onClick={() => router.push('/giris')}>
              <UserIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;