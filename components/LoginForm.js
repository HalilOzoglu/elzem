"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@heroui/react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const telefon = formData.get("telefon");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        telefon,
        password,
        redirect: false,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/profil");
        router.refresh();
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
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
          label="Şifre"
          name="password"
          type="password"
          required
          placeholder="********"
        />
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        isLoading={loading}
      >
        Giriş Yap
      </Button>
    </form>
  );
} 