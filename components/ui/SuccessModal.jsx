import React, { useEffect } from "react";

const SuccessModal = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000); // 2 saniye sonra modal otomatik kapanıyor
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-slate-100 w-1/2 h-1/4 p-4 rounded shadow-xl flex justify-center items-center">
        <p className="text-green-600  font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default SuccessModal;
