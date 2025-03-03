"use client";
import React from "react";

const OrderStatusBadge = ({ status, onClick, isButton = false }) => {
  const statusColors = {
    "Hazırlanıyor": "bg-yellow-100 text-yellow-800",
    "Teslim edilecek": "bg-blue-100 text-blue-800",
    "Teslim Edildi": "bg-green-100 text-green-800",
    "İptal Edildi": "bg-red-100 text-red-800",
  };

  const baseClasses = `px-3 py-1 rounded-full text-sm ${statusColors[status]}`;
  const buttonClasses = isButton ? "cursor-pointer hover:opacity-75" : "";

  return (
    <span
      className={`${baseClasses} ${buttonClasses}`}
      onClick={isButton ? onClick : undefined}
      role={isButton ? "button" : undefined}
    >
      {status}
    </span>
  );
};

const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
  const statuses = [
    "Hazırlanıyor",
    "Teslim edilecek",
    "Teslim Edildi",
    "İptal Edildi"
  ];

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Durum güncellenemedi");
      }

      onUpdate(order._id, newStatus);
      onClose();
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
      alert("Durum güncellenirken bir hata oluştu");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Sipariş Durumunu Güncelle</h2>
        <div className="space-y-2">
          {statuses.map((status) => (
            <div
              key={status}
              onClick={() => handleStatusUpdate(status)}
              className={`p-3 rounded cursor-pointer hover:bg-gray-100 ${
                order.status === status ? "bg-gray-100" : ""
              }`}
            >
              <OrderStatusBadge status={status} />
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

const OrderDetailsModal = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Sipariş Detayları</h2>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Sipariş No</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-gray-500">Sipariş Tarihi</p>
              <p className="font-medium">{order.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Kullanıcı ID</p>
              <p className="font-medium">{order.userId}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Ürünler</h3>
            <div className="space-y-4">
              {order.products.map((product, index) => (
                <div
                  key={index}
                  className="border rounded p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    <p className="text-sm text-gray-500">Adet: {product.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(product.price * product.count)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Birim: {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">Toplam:</span>
              <span className="font-bold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                }).format(order.total)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [statusUpdateOrder, setStatusUpdateOrder] = React.useState(null);
  const [deleteConfirmOrder, setDeleteConfirmOrder] = React.useState(null);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Siparişler getirilemedi");
      }

      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
      console.error("Sipariş getirme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order._id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Sipariş silinemedi");
      }

      // Siparişi listeden kaldır
      setOrders(orders.filter(order => order._id !== orderId));
      setDeleteConfirmOrder(null);
    } catch (error) {
      console.error("Sipariş silme hatası:", error);
      alert("Sipariş silinirken bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  // Silme onay modalı
  const DeleteConfirmModal = ({ order, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Siparişi Sil</h2>
          <p className="mb-4">Bu siparişi silmek istediğinizden emin misiniz?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              İptal
            </button>
            <button
              onClick={() => onConfirm(order._id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Siparişler</h1>
      {orders.length === 0 ? (
        <p>Henüz sipariş bulunmamaktadır.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-lg shadow-sm p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    Sipariş Tarihi: {order.date}
                  </p>
                  <p className="text-sm text-gray-500">
                    Sipariş No: {order._id}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Detaylar
                  </button>
                  <OrderStatusBadge
                    status={order.status}
                    onClick={() => setStatusUpdateOrder(order)}
                    isButton={true}
                  />
                  <button
                    onClick={() => setDeleteConfirmOrder(order)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sil
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Toplam:</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    }).format(order.total)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {statusUpdateOrder && (
        <StatusUpdateModal
          order={statusUpdateOrder}
          onClose={() => setStatusUpdateOrder(null)}
          onUpdate={handleStatusUpdate}
        />
      )}

      {deleteConfirmOrder && (
        <DeleteConfirmModal
          order={deleteConfirmOrder}
          onClose={() => setDeleteConfirmOrder(null)}
          onConfirm={handleDeleteOrder}
        />
      )}
    </div>
  );
};

export default OrdersPage; 