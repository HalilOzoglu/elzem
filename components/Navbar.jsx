"use client"
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from 'next-auth/react';
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
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
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
    if (key === 'logout') {
      signOut();
    } else {
      router.push(key);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setShowDropdown(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-50">
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
                  <button className="flex items-center gap-2">
                    <UserIcon className="h-6 w-6" />
                    {session?.user?.name && (
                      <span className="text-sm font-medium">
                        {session.user.name.split(' ')[0]} {session.user.name.split(' ')[1]?.[0]}.
                      </span>
                    )}
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
                      <DropdownItem key="/admin/all">Fiyat Paneli</DropdownItem>
                      <DropdownItem key="/admin/orders">Sipariş Paneli</DropdownItem>
                    </>
                  )}
                  <DropdownItem 
                    key="logout" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Çıkış Yap
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <button onClick={() => router.push('/giris')} className="flex items-center gap-2">
                <UserIcon className="h-6 w-6" />
                <span className="text-sm font-medium">Giriş Yap</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 md:mt-0 w-full md:w-1/2 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün ara..."
              className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="absolute left-3 top-2.5"
              aria-label="Ara"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
          </form>

          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                  <div
                    key={result._id}
                    onClick={() => handleResultClick(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex-1 min-w-36">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600">
                          {result.brand} - {result.category}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-indigo-600 ml-4">
                        {result.price} ₺
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                <button className="flex items-center gap-2">
                  <UserIcon className="h-6 w-6" />
                  {session?.user?.name && (
                    <span className="text-sm font-medium">
                      {session.user.name.split(' ')[0]} {session.user.name.split(' ')[1]?.[0]}.
                    </span>
                  )}
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
                    <DropdownItem key="/admin/all">Fiyat Paneli</DropdownItem>
                    <DropdownItem key="/admin/orders">Sipariş Paneli</DropdownItem>
                  </>
                )}
                <DropdownItem 
                  key="logout" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Çıkış Yap
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <button onClick={() => router.push('/')} className="flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              <span className="text-sm font-medium">Giriş Yap</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar