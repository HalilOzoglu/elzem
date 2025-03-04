"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Tooltip
} from "@heroui/react";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    "Hazırlanıyor": {
      color: "warning",
      variant: "flat",
    },
    "Teslim edilecek": {
      color: "primary",
      variant: "flat",
    },
    "Teslim Edildi": {
      color: "success",
      variant: "flat",
    },
    "İptal Edildi": {
      color: "danger",
      variant: "flat",
    },
  };

  const config = statusConfig[status] || statusConfig["Hazırlanıyor"];

  return (
    <Chip
      color={config.color}
      variant={config.variant}
      size="sm"
    >
      {status}
    </Chip>
  );
};

const StatusUpdateModal = ({ isOpen, onClose, order, onUpdate }) => {
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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Sipariş Durumunu Güncelle</ModalHeader>
        <ModalBody>
          <div className="grid gap-2">
            {statuses.map((status) => (
              <Button
                key={status}
                color={status === order?.status ? "primary" : "default"}
                variant={status === order?.status ? "flat" : "light"}
                className="w-full justify-start"
                onPress={() => handleStatusUpdate(status)}
              >
                <OrderStatusBadge status={status} />
              </Button>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Kapat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Sipariş Detayları
          <div className="mt-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Sipariş No</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sipariş Tarihi</p>
              <p className="font-medium">{order.date}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Müşteri Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ad Soyad</p>
                <p className="font-medium">{`${order.userInfo?.ad || ''} ${order.userInfo?.soyad || ''}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{order.userInfo?.telefon || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tabela</p>
                <p className="font-medium">{order.userInfo?.tabela || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Adres</p>
                <p className="font-medium">
                  {order.userInfo?.adres ? 
                    `${order.userInfo.adres.mahalle || ''} ${order.userInfo.adres.sokak || ''} ${order.userInfo.adres.detay || ''} - ${order.userInfo.adres.ilce || ''} / ${order.userInfo.adres.il || ''}`.trim() || 'Belirtilmemiş'
                    : 'Belirtilmemiş'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ürünler</h3>
            <Table aria-label="Sipariş ürünleri">
              <TableHeader>
                <TableColumn>ÜRÜN</TableColumn>
                <TableColumn>ADET</TableColumn>
                <TableColumn>BİRİM FİYAT</TableColumn>
                <TableColumn>TOPLAM</TableColumn>
              </TableHeader>
              <TableBody>
                {order.products.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.count}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(product.price)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(product.price * product.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <span className="font-bold text-lg">Toplam:</span>
            <span className="font-bold text-lg">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(order.total)}
            </span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Kapat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, order, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Siparişi Sil</ModalHeader>
        <ModalBody>
          <p>Bu siparişi silmek istediğinizden emin misiniz?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            İptal
          </Button>
          <Button color="danger" onPress={() => onConfirm(order._id)}>
            Sil
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose
  } = useDisclosure();

  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();

  const [selectedOrder, setSelectedOrder] = React.useState(null);

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

      setOrders(orders.filter(order => order._id !== orderId));
      onDeleteClose();
    } catch (error) {
      console.error("Sipariş silinirken bir hata oluştu", error);
    }
  };

  const handleOrderSelect = (order, action) => {
    setSelectedOrder(order);
    switch (action) {
      case 'details':
        onDetailsOpen();
        break;
      case 'status':
        onStatusOpen();
        break;
      case 'delete':
        onDeleteOpen();
        break;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Siparişler</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Henüz sipariş bulunmamaktadır.
        </div>
      ) : (
        <Table aria-label="Siparişler listesi">
          <TableHeader>
            <TableColumn>SİPARİŞ NO</TableColumn>
            <TableColumn>TARİH</TableColumn>
            <TableColumn>DURUM</TableColumn>
            <TableColumn>TOPLAM</TableColumn>
            <TableColumn>İŞLEMLER</TableColumn>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(order.total)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content="Detaylar">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleOrderSelect(order, 'details')}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={() => handleOrderSelect(order, 'status')}
                    >
                      Durum Güncelle
                    </Button>
                    <Tooltip content="Sil" color="danger">
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleOrderSelect(order, 'delete')}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <OrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        order={selectedOrder}
      />

      <StatusUpdateModal
        isOpen={isStatusOpen}
        onClose={onStatusClose}
        order={selectedOrder}
        onUpdate={handleStatusUpdate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        order={selectedOrder}
        onConfirm={handleDeleteOrder}
      />
    </div>
  );
};

export default OrdersPage; 