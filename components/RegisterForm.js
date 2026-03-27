"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const userData = {
      telefon: formData.get("telefon"),
      tabela: formData.get("tabela"),
      ad: formData.get("ad"),
      soyad: formData.get("soyad"),
      password: formData.get("password"),
      adres: {
        il: formData.get("il"),
        ilce: formData.get("ilce"),
        mahalle: formData.get("mahalle"),
        sokak: formData.get("sokak"),
        detay: formData.get("detay"),
      },
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Bir hata oluştu");
      }

      // Kayıt başarılı, otomatik giriş yap
      const signInResult = await signIn("credentials", {
        telefon: userData.telefon,
        password: userData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Ana sayfaya yönlendir
      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <Input
          label="Telefon"
          name="telefon"
          type="text"
          required
          placeholder="5XX XXX XX XX"
        />

        <Input
          label="Tabela / Ünvan"
          name="tabela"
          type="text"
          required
          placeholder="İşletme veya Mağaza Adı"
        />

        <Input
          label="Ad"
          name="ad"
          type="text"
          required
        />

        <Input
          label="Soyad"
          name="soyad"
          type="text"
          required
        />

        <Input
          label="Şifre"
          name="password"
          type="password"
          required
          placeholder="********"
        />

        <div className="border p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Adres Bilgileri</h3>
          
          <Input
            label="İl"
            name="il"
            type="text"
            required
          />

          <Input
            label="İlçe"
            name="ilce"
            type="text"
            required
          />

          <Input
            label="Mahalle"
            name="mahalle"
            type="text"
            required
          />

          <Input
            label="Sokak"
            name="sokak"
            type="text"
            required
          />

          <Input
            label="Detaylı Adres"
            name="detay"
            type="text"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        isLoading={loading}
      >
        Üye Ol
      </Button>
    </form>
  );
} 