"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Button,
  Textarea,
} from "@heroui/react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1); // Sayfa durumu
  const rowsPerPage = 10; // Her sayfada gösterilecek ürün sayısı
  const [formData, setFormData] = useState({
    productName: "",
    productDetail: "",
    productSku: "",
    productCount: "",
    productPrice: "",
    productBox: "",
    productBrand: "",
    productCategory: "",
  });
  const handleDelete = async () => {
    if (!selectedProduct) {
      alert("Lütfen önce bir ürün seçin!");
      return;
    }

    const confirmDelete = window.confirm(
      `${selectedProduct.productName} ürününü silmek istediğine emin misin?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSku: selectedProduct.productSku }),
      });

      if (res.ok) {
        alert("Ürün başarıyla silindi!");
        setSelectedProduct(null); // Seçimi temizle
        fetchProducts(); // Ürün listesini güncelle
      } else {
        const errorData = await res.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Lütfen önce bir ürün seçin!");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Ürün başarıyla güncellendi!");
        console.log(data.product);
        fetchProducts(); // Güncellenmiş veriyi çek
      } else {
        const errorData = await res.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Ürün başarıyla eklendi!");
        console.log(data.product);

        // Form verilerini sıfırlayın
        setFormData({
          productName: "",
          productDetail: "",
          productSku: "",
          productCount: "",
          productPrice: "",
          productBox: "",
          productBrand: "",
          productCategory: "",
        });

        // Ürünleri tekrar çek
        fetchProducts(); // Tabloyu yenilemek için yeniden ürünleri çek
      } else {
        const errorData = await res.json();
        alert(
          `Ürün eklenirken hata: ${errorData.message || "Bilinmeyen hata"}`
        );
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  useEffect(() => {
    // Sayfa ilk yüklendiğinde ürünleri almak için useEffect
    fetchProducts();
  }, []); // Sayfa ilk açıldığında

  // API'den ürünleri çekme fonksiyonu
  async function fetchProducts() {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data); // Verileri state'e kaydet
    } catch (error) {
      console.error("Veriler alınırken hata oluştu:", error);
    }
  }

  const handleSelectionChange = (keys) => {
    const selectedSku = Array.from(keys)[0]; // selectionMode="single" olduğundan tek bir key
    const product = products.find((p) => p.productSku === selectedSku); // Ürün bilgisini bul
    setSelectedProduct(product); // Seçili ürünü state'e kaydet

    // Seçilen ürünü formData'ya aktar
    if (product) {
      setFormData({
        productName: product.productName,
        productDetail: product.productDetail,
        productSku: product.productSku,
        productCount: product.productCount,
        productPrice: product.productPrice,
        productBox: product.productBox,
        productBrand: product.productBrand,
        productCategory: product.productCategory,
      });
    }
  };

  // Sayfalama için ürünleri filtrele
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return products.slice(start, end);
  }, [page, products]);

  return (
    <>
      <div className="flex">
        <div className="w-1/2">
          {/* Card sol tarafta */}
          <Card className="bg-transparent">
            <CardHeader className="flex mx-auto flex-col">
              <p className="text-lg">Tekli Ürün Paneli</p>
            </CardHeader>
            <Divider />
            <CardBody>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="mx-1 mb-1">Ürün Başlığı</p>
                    <Input
                      placeholder="Ürün başlığını girin"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                    />
                    <p className="mx-1 mb-1 mt-4">Ürün Açıklaması</p>
                    <Textarea
                      placeholder="Ürün açıklamasını girin"
                      name="productDetail"
                      value={formData.productDetail}
                      onChange={handleChange}
                    />
                    <p className="mx-1 mb-1 mt-4">Kategori</p>
                    <Input
                      placeholder="Kategori girin"
                      name="productCategory"
                      value={formData.productCategory}
                      onChange={handleChange}
                    />
                    <p className="mx-1 mb-1 mt-4">Marka</p>
                    <Input
                      placeholder="Marka girin"
                      name="productBrand"
                      value={formData.productBrand}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <p className="mx-1 mb-1">Stok Kodu</p>
                    <Input
                      placeholder="Stok kodunu girin"
                      name="productSku"
                      value={formData.productSku}
                      onChange={handleChange}
                    />
                    <p className="mx-1 mb-1 mt-2">Stok Sayısı</p>
                    <Input
                      placeholder="Stok sayısını girin"
                      name="productCount"
                      value={formData.productCount}
                      onChange={handleChange}
                    />
                    <p className="mx-1 mb-1 mt-2">Satış Fiyatı</p>
                    <Input
                      placeholder="Satış fiyatını girin"
                      name="productPrice"
                      value={formData.productPrice}
                      onChange={handleChange}
                    />
                    <p className="mx-1 mb-1 mt-2">Koli İçi Sayısı</p>
                    <Input
                      placeholder="Koli içinde kaç adet var?"
                      name="productBox"
                      value={formData.productBox}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="mt-6 space-x-3">
                  <Button color="success" type="submit">
                    Ekle
                  </Button>
                  <Button onClick={handleEdit} color="warning" type="submit">
                    Düzenle
                  </Button>
                  <Button color="danger" onClick={handleDelete}>
                    Sil
                  </Button>
                  <Button
                    color="secondary"
                    type="reset"
                    onPress={() =>
                      setFormData({
                        productName: "",
                        productDetail: "",
                        productSku: "",
                        productCount: "",
                        productPrice: "",
                        productBox: "",
                        productBrand: "",
                        productCategory: "",
                      })
                    }
                  >
                    Temizle
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
        <div className="w-1/2 px-4">
          <div className="flex flex-col gap-3">
            <Table
              aria-label="Ürün tablosu"
              color="warning"
              selectionMode="single" // Tekli seçim
              onSelectionChange={handleSelectionChange} // Seçim değiştiğinde tetiklenir
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={parseInt(page, 10)}
                    total={Math.ceil(products.length / rowsPerPage)} // Toplam sayfa sayısı
                    onChange={(newPage) => setPage(newPage)} // Sayfa değişimi
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>ÜRÜN ADI</TableColumn>
                <TableColumn>MARKA</TableColumn>
                <TableColumn>KATEGORİ</TableColumn>
                <TableColumn>FİYAT</TableColumn>
                <TableColumn>STOK</TableColumn>
                <TableColumn>SKU</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.productSku}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.productBrand}</TableCell>
                    <TableCell>{product.productCategory}</TableCell>
                    <TableCell>{product.productPrice} ₺</TableCell>
                    <TableCell>{product.productCount}</TableCell>
                    <TableCell>{product.productSku}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
