"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Pagination,
  Image,
  Input,
} from "@heroui/react";

export default function PhotoManager() {
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("products");
  const rowsPerPage = 10;
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchFamilies();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Ürünler alınırken hata:", error);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await fetch("/api/family");
      const data = await response.json();
      setFamilies(data);
    } catch (error) {
      console.error("Aileler alınırken hata:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedItem) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", activeTab);
    formData.append("id", activeTab === "products" ? selectedItem.productSku : selectedItem.familyCode);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Fotoğraf başarıyla yüklendi!");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (activeTab === "products") {
          fetchProducts();
        } else {
          fetchFamilies();
        }
      } else {
        alert("Fotoğraf yüklenirken bir hata oluştu!");
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
      alert("Fotoğraf yüklenirken bir hata oluştu!");
    }
  };

  const handleSelectionChange = (keys) => {
    const selectedId = Array.from(keys)[0];
    const items = activeTab === "products" ? products : families;
    const selected = items.find((item) => 
      activeTab === "products" ? item.productSku === selectedId : item.familyCode === selectedId
    );
    setSelectedItem(selected);
  };

  const paginatedItems = useMemo(() => {
    const items = activeTab === "products" ? products : families;
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return items.slice(start, end);
  }, [page, activeTab, products, families]);

  return (
    <div className="flex gap-4">
      {/* Sol Panel - Fotoğraf Yükleme */}
      <Card className="w-1/3">
        <CardHeader>
          <h2 className="text-lg font-semibold">Fotoğraf Yükleme Paneli</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                color={activeTab === "products" ? "primary" : "default"}
                onClick={() => setActiveTab("products")}
              >
                Ürünler
              </Button>
              <Button
                color={activeTab === "families" ? "primary" : "default"}
                onClick={() => setActiveTab("families")}
              >
                Ürün Aileleri
              </Button>
            </div>

            {selectedItem && (
              <div className="space-y-2">
                <p className="text-sm">
                  Seçili {activeTab === "products" ? "Ürün" : "Aile"}:{" "}
                  {activeTab === "products" ? selectedItem.productName : selectedItem.familyName}
                </p>
                <p className="text-sm">
                  {activeTab === "products" ? "SKU" : "Aile Kodu"}:{" "}
                  {activeTab === "products" ? selectedItem.productSku : selectedItem.familyCode}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
              {previewUrl && (
                <div className="mt-2">
                  <Image
                    src={previewUrl}
                    alt="Önizleme"
                    className="max-w-full h-auto"
                  />
                </div>
              )}
            </div>

            <Button
              color="primary"
              onClick={handleUpload}
              disabled={!selectedFile || !selectedItem}
              className="w-full"
            >
              Fotoğraf Yükle
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Sağ Panel - Liste */}
      <Card className="w-2/3">
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {activeTab === "products" ? "Ürün Listesi" : "Ürün Ailesi Listesi"}
          </h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table
            aria-label={`${activeTab === "products" ? "Ürün" : "Aile"} listesi`}
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={Math.ceil(
                    (activeTab === "products" ? products.length : families.length) / rowsPerPage
                  )}
                  onChange={(newPage) => setPage(newPage)}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>Fotoğraf</TableColumn>
              <TableColumn>
                {activeTab === "products" ? "Ürün Adı" : "Aile Adı"}
              </TableColumn>
              <TableColumn>
                {activeTab === "products" ? "SKU" : "Aile Kodu"}
              </TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={activeTab === "products" ? item.productSku : item.familyCode}>
                  <TableCell>
                    {activeTab === "products" ? (
                      item.productImg1 ? (
                        <Image
                          src={item.productImg1}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="object-cover"
                          onError={(e) => {
                            console.error("Fotoğraf yüklenemedi:", item.productImg1);
                            e.target.src = "/placeholder-product.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Fotoğraf Yok</span>
                        </div>
                      )
                    ) : (
                      item.productImg1 ? (
                        <Image
                          src={item.productImg1}
                          alt={item.familyName}
                          width={64}
                          height={64}
                          className="object-cover"
                          onError={(e) => {
                            console.error("Fotoğraf yüklenemedi:", item.productImg1);
                            e.target.src = "/placeholder-product.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Fotoğraf Yok</span>
                        </div>
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {activeTab === "products" ? item.productName : item.familyName}
                  </TableCell>
                  <TableCell>
                    {activeTab === "products" ? item.productSku : item.familyCode}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
} 