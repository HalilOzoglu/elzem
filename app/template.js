"use client";

import { useState, useEffect } from "react";

export default function Template({ children }) {
  // İlk state'i window nesnesinin varlığını kontrol ederek belirleyelim
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("hasVisited");
    }
    return true;
  });

  useEffect(() => {
    if (loading) {
      localStorage.setItem("hasVisited", "true");

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 bg-amber-500 flex items-center justify-center z-50">
          <div className="text-center text-black">
            <h1 className="text-4xl font-bold mb-4">Elzem Hırdavat</h1>
            <p className="text-2xl mb-8">Hoş Geldiniz</p>
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-white/30 border-t-black rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}
