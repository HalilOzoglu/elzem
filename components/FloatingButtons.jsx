"use client"

import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";

const FloatingButtons = () => {
  const [isWhatsappExpanded, setIsWhatsappExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* WhatsApp Butonu */}
      <div
        className={`flex items-center transition-all duration-300 ease-in-out cursor-pointer ${
          isWhatsappExpanded && !isMobile ? "bg-[#25D366] pl-4 pr-2 rounded-full" : ""
        }`}
        onMouseEnter={() => !isMobile && setIsWhatsappExpanded(true)}
        onMouseLeave={() => !isMobile && setIsWhatsappExpanded(false)}
        onClick={() => window.open("https://wa.me/+905307059661", "_blank")}
      >
        {isWhatsappExpanded && !isMobile && (
          <span className="text-white mr-2 whitespace-nowrap text-sm font-medium">
            Sohbet Başlat
          </span>
        )}
        <div className="w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg">
          <FaWhatsapp className="text-white text-2xl md:text-3xl" />
        </div>
      </div>
    </div>
  );
};

export default FloatingButtons; 