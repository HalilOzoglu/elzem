"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip
} from "@heroui/react";
import { EyeIcon } from "@heroicons/react/24/outline";

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

const OrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Modal scrollBehavior="inside" isOpen={isOpen} onClose={onClose} size="2xl">
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
              <p className="font-medium truncate">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sipariş Tarihi</p>
              <p className="font-medium">{order.date}</p>
            </div>
          </div>

          <div className="border p-4 rounded-lg mb-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Teslimat Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Ad Soyad</p>
                <p className="font-medium">{`${order.userInfo.ad} ${order.userInfo.soyad}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                <p className="font-medium">{order.userInfo.telefon}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Tabela</p>
                <p className="font-medium">{order.userInfo.tabela}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Adres</p>
                <p className="font-medium">
                  {order.userInfo.adres ? 
                    `${order.userInfo.adres.mahalle || ''} ${order.userInfo.adres.sokak || ''} ${order.userInfo.adres.detay || ''} - ${order.userInfo.adres.ilce || ''} / ${order.userInfo.adres.il || ''}`.trim() 
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

const UserOrdersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  
  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose
  } = useDisclosure();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
    } else if (status === "authenticated") {
      fetchUserOrders();
    }
  }, [status, router]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch("/api/user/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Siparişler getirilemedi");
      }

      if (!data.orders) {
        throw new Error("Sipariş verisi bulunamadı");
      }

      console.log("Gelen siparişler:", data.orders);
      setOrders(data.orders);
    } catch (err) {
      console.error("Sipariş getirme hatası:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    onDetailsOpen();
  };

  if (status === "loading" || loading) {
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
      <h1 className="text-3xl font-bold mb-6">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Henüz siparişiniz bulunmamaktadır.
        </div>
      ) : (
        <Table aria-label="Siparişlerim listesi">
          <TableHeader>
            <TableColumn>TARİH</TableColumn>
            <TableColumn>DURUM</TableColumn>
            <TableColumn>TOPLAM</TableColumn>
            <TableColumn>İŞLEMLER</TableColumn>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
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
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => handleOrderSelect(order)}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Button>
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
    </div>
  );
};

export default UserOrdersPage; 