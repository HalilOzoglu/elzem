"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@heroui/react";

export default function ProfilPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/giris");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Kişisel Bilgiler */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Profil Bilgileri</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tabela / Ünvan</h3>
              <p className="mt-1 text-lg">{session.user.tabela}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Ad Soyad</h3>
              <p className="mt-1 text-lg">{session.user.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
              <p className="mt-1 text-lg">{session.user.telefon}</p>
            </div>

            {session.user.isAdmin && (
              <div className="mt-4 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Yönetici
              </div>
            )}
          </div>
        </div>

        {/* Adres Bilgileri */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-xl font-bold mb-6">Adres Bilgileri</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">İl</h3>
              <p className="mt-1">{session.user.adres?.il}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">İlçe</h3>
              <p className="mt-1">{session.user.adres?.ilce}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Mahalle</h3>
              <p className="mt-1">{session.user.adres?.mahalle}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Sokak</h3>
              <p className="mt-1">{session.user.adres?.sokak}</p>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Detaylı Adres</h3>
              <p className="mt-1">{session.user.adres?.detay}</p>
            </div>
          </div>
        </div>

        {/* Çıkış Yap Butonu */}
        <div className="flex justify-end">
          <Button
            color="danger"
            variant="flat"
            onClick={() => signOut()}
          >
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  );
} 