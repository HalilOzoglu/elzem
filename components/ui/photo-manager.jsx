"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Card, CardHeader, CardBody, Divider, Button, Pagination, Image, Input,
} from "@heroui/react";

const IMAGE_SLOTS = [
  { key: "img1", label: "Görsel 1 (Ana)", field: "productImg1" },
  { key: "img2", label: "Görsel 2", field: "productImg2" },
  { key: "img3", label: "Görsel 3", field: "productImg3" },
];

export default function PhotoManager() {
  const [products, setProducts] = useState([]);
  const [families, setFamilies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("products");
  const rowsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);

  // Per-slot file/preview state
  const [slots, setSlots] = useState({ img1: null, img2: null, img3: null });
  const [previews, setPreviews] = useState({ img1: null, img2: null, img3: null });

  useEffect(() => { fetchProducts(); fetchFamilies(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      setProducts(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchFamilies = async () => {
    try {
      const res = await fetch("/api/family");
      setFamilies(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleFileChange = (slot, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Lütfen bir resim dosyası seçin"); return; }
    setSlots(prev => ({ ...prev, [slot]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviews(prev => ({ ...prev, [slot]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleUploadSlot = async (slot) => {
    if (!slots[slot] || !selectedItem) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", slots[slot]);
      formData.append("type", activeTab);
      formData.append("id", activeTab === "products" ? selectedItem.productSku : selectedItem.familyCode);
      formData.append("imageSlot", slot);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        alert(`${IMAGE_SLOTS.find(s => s.key === slot).label} başarıyla yüklendi!`);
        setSlots(prev => ({ ...prev, [slot]: null }));
        setPreviews(prev => ({ ...prev, [slot]: null }));
        if (activeTab === "products") fetchProducts(); else fetchFamilies();
      } else {
        alert(`Hata: ${data.message || "Bilinmeyen hata"}`);
      }
    } catch (e) {
      alert("Yükleme hatası: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!selectedItem) return;
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    setIsLoading(true);
    try {
      const id = activeTab === "products" ? selectedItem.productSku : selectedItem.familyCode;
      const res = await fetch(`/api/upload?type=${activeTab}&id=${id}&imageSlot=${slot}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        // Seçili item'ı güncelle
        const field = IMAGE_SLOTS.find(s => s.key === slot).field;
        setSelectedItem(prev => ({ ...prev, [field]: null, ...(slot === "img1" ? { productImgMini: null } : {}) }));
        if (activeTab === "products") fetchProducts(); else fetchFamilies();
      } else {
        alert(`Silme hatası: ${data.message}`);
      }
    } catch (e) {
      alert("Silme hatası: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionChange = (keys) => {
    const selectedId = Array.from(keys)[0];
    const items = activeTab === "products" ? products : families;
    const selected = items.find(item =>
      activeTab === "products" ? item.productSku === selectedId : item.familyCode === selectedId
    );
    setSelectedItem(selected);
    setSlots({ img1: null, img2: null, img3: null });
    setPreviews({ img1: null, img2: null, img3: null });
  };

  const paginatedItems = useMemo(() => {
    const items = activeTab === "products" ? products : families;
    const start = (page - 1) * rowsPerPage;
    return items.slice(start, start + rowsPerPage);
  }, [page, activeTab, products, families]);

  return (
    <div className="flex gap-4">
      {/* Sol Panel */}
      <Card className="w-1/3">
        <CardHeader><h2 className="text-lg font-semibold">Fotoğraf Yükleme Paneli</h2></CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button color={activeTab === "products" ? "primary" : "default"} onClick={() => { setActiveTab("products"); setPage(1); setSelectedItem(null); }}>
                Ürünler
              </Button>
              <Button color={activeTab === "families" ? "primary" : "default"} onClick={() => { setActiveTab("families"); setPage(1); setSelectedItem(null); }}>
                Ürün Aileleri
              </Button>
            </div>

            {selectedItem ? (
              <div className="space-y-1 p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium">
                  {activeTab === "products" ? selectedItem.productName : selectedItem.familyName}
                </p>
                <p className="text-xs text-gray-500">
                  {activeTab === "products" ? selectedItem.productSku : selectedItem.familyCode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sağdan bir ürün seçin</p>
            )}

            {IMAGE_SLOTS.map(({ key, label, field }) => (
              <div key={key} className="border rounded p-3 space-y-2">
                <p className="text-sm font-medium">{label}</p>
                {selectedItem?.[field] && !previews[key] && (
                  <div className="flex items-center gap-2">
                    <Image src={selectedItem[field]} alt={label} width={80} height={80} className="object-cover rounded" />
                    <Button
                      color="danger"
                      size="sm"
                      variant="flat"
                      onClick={() => handleDeleteSlot(key)}
                      isDisabled={isLoading}
                    >
                      Sil
                    </Button>
                  </div>
                )}
                {previews[key] && (
                  <Image src={previews[key]} alt="Önizleme" width={80} height={80} className="object-cover rounded" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(key, e)} size="sm" />
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => handleUploadSlot(key)}
                  isDisabled={!slots[key] || !selectedItem || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Yükleniyor..." : "Yükle"}
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Sağ Panel */}
      <Card className="w-2/3">
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {activeTab === "products" ? "Ürün Listesi" : "Ürün Ailesi Listesi"}
          </h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table
            aria-label="Ürün listesi"
            selectionMode="single"
            onSelectionChange={handleSelectionChange}
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact showControls showShadow color="secondary"
                  page={page}
                  total={Math.ceil((activeTab === "products" ? products.length : families.length) / rowsPerPage)}
                  onChange={setPage}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>Görsel 1</TableColumn>
              <TableColumn>Görsel 2</TableColumn>
              <TableColumn>Görsel 3</TableColumn>
              <TableColumn>{activeTab === "products" ? "Ürün Adı" : "Aile Adı"}</TableColumn>
              <TableColumn>{activeTab === "products" ? "SKU" : "Aile Kodu"}</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((item) => {
                const key = activeTab === "products" ? item.productSku : item.familyCode;
                const name = activeTab === "products" ? item.productName : item.familyName;
                return (
                  <TableRow key={key}>
                    {["productImg1", "productImg2", "productImg3"].map((imgField) => (
                      <TableCell key={imgField}>
                        {item[imgField] ? (
                          <Image src={item[imgField]} alt={name} width={48} height={48} className="object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded text-xs text-gray-400">Yok</div>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>{name}</TableCell>
                    <TableCell>{key}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
