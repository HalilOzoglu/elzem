"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function BannerSlider({ banners }) {
  const [current, setCurrent] = useState(0);
  const router = useRouter();

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners || banners.length === 0) {
    return <img src="/banner.webp" alt="banner" className="w-full h-auto mb-5 rounded-sm" />;
  }

  const handleClick = (banner) => {
    if (banner.linkType === "search" && banner.linkValue) {
      router.push(`/search?query=${encodeURIComponent(banner.linkValue)}`);
    } else if (banner.linkType === "product" && banner.linkValue) {
      router.push(`/products/${banner.linkValue}`);
    }
  };

  const banner = banners[current];
  const isClickable = banner.linkType !== "none" && banner.linkValue;

  return (
    <div className="relative w-full mb-5 overflow-hidden rounded-sm select-none">
      <div
        className={isClickable ? "cursor-pointer" : ""}
        onClick={() => isClickable && handleClick(banner)}
      >
        <img
          src={banner.imageUrl}
          alt={banner.title || "banner"}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Dot navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Prev/Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Önceki"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Sonraki"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
