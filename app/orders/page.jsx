"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure
} from "@heroui/react";

const OrderStatusBadge = ({ status, onClick, isButton = false }) => {
  const statusColors = {
    "Hazırlanıyor": "bg-yellow-100 text-yellow-800",
    "Teslim edilecek": "bg-blue-100 text-blue-800",
    "Teslim Edildi": "bg-green-100 text-green-800",
    "İptal Edildi": "bg-red-100 text-red-800",
  };

  const baseClasses = `px-3 py-1 rounded-full text-sm ${statusColors[status]}`;
  const buttonClasses = isButton ? "cursor-pointer hover:opacity-75" : "";

  if (isButton) {
    return (
      <button
        className={`${baseClasses} ${buttonClasses}`}
        tabIndex={0}
        aria-label={`Sipariş durumunu güncelle: ${status}`}
        onClick={onClick}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick();
          }
        }}
      >
        {status}
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      {status}
    </span>
  );
};

const StatusUpdateModal = ({ order, onClose, onUpdate }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
      console.error("Durum güncellenirken bir hata oluştu", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-xl font-bold mb-4">Sipariş Durumunu Güncelle</ModalHeader>
            <ModalBody>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <button
                    className={`w-full p-3 rounded text-left hover:bg-gray-100 ${
                      order.status === status ? "bg-gray-100" : ""
                    }`}
                    key={status}
                    aria-label={`Durumu ${status} olarak güncelle`}
                    onClick={() => handleStatusUpdate(status)}
                  >
                    <OrderStatusBadge status={status} />
                  </button>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Kapat
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const OrderDetailsModal = ({ order, onClose }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-xl font-bold">Sipariş Detayları</ModalHeader>
            <ModalBody>
              <div className="flex justify-between items-start mb-4">
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
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Kapat
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

const DeleteConfirmModal = ({ order, onClose, onConfirm }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-xl font-bold mb-4">Siparişi Sil</ModalHeader>
            <ModalBody>
              <p className="mb-4">Bu siparişi silmek istediğinizden emin misiniz?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                İptal
              </Button>
              <Button color="primary" onPress={() => onConfirm(order._id)}>
                Sil
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
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
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Sipariş detaylarını görüntüle"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Detaylar
                  </button>
                  <OrderStatusBadge
                    status={order.status}
                    isButton={true}
                    onClick={() => setStatusUpdateOrder(order)}
                  />
                  <button
                    className="text-red-600 hover:text-red-800"
                    aria-label="Siparişi sil"
                    onClick={() => setDeleteConfirmOrder(order)}
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