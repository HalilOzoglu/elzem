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
  Input,
  Button,
  Textarea,
  Pagination,
} from "@heroui/react";

export default function App() {
  // Aile ile ilgili state’ler
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    familyName: "",
    familyBrand: "",
    familyCategory: "",
    familyVariantCount: "",
    familyV1Name: "",
    familyV2Name: "",
    familyV3Name: "",
    familyDetail: "",
  });
  const [page, setPage] = useState(1); // Sayfa durumu
  const rowsPerPage = 7; // Her sayfada gösterilecek aile sayısı
  const [selectedKeys, setSelectedKeys] = useState(new Set()); // Seçili aile satırı

  // Varyant ile ilgili state’ler
  const [variantFormData, setVariantFormData] = useState({
    v1: "",
    v2: "",
    v3: "",
    sku: "",
    box: "",
    price: "",
    count: "",
  });
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantSelectedKeys, setVariantSelectedKeys] = useState(new Set());

  // Aile verisini çeker
  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/family");
      const data = await res.json();

      if (!data.success && data.message) {
        setError(data.message);
        return;
      }
      setFamilies(data);
    } catch (error) {
      setError("Veri çekme hatası oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      familyName: "",
      familyBrand: "",
      familyCategory: "",
      familyVariantCount: "",
      familyV1Name: "",
      familyV2Name: "",
      familyV3Name: "",
      familyDetail: "",
    });
    setSelectedFamily(null);
    setError("");
    setSelectedKeys(new Set());
    // Varyant paneli temizle
    resetVariantForm();
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Ekleme işlemi başarısız");
        return;
      }

      await fetchFamilies();
      resetForm();
    } catch (error) {
      setError("Ekleme işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedFamily?._id) {
      setError("Lütfen düzenlenecek aileyi seçin");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          _id: selectedFamily._id,
          // Varyantlar da varsa onları gönderiyoruz; yoksa dokümanda kalırlar.
          variants: selectedFamily.variants || [],
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Güncelleme işlemi başarısız");
        return;
      }

      await fetchFamilies();
      resetForm();
    } catch (error) {
      setError("Güncelleme işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFamily?._id) {
      setError("Lütfen silinecek aileyi seçin");
      return;
    }

    if (!window.confirm("Bu aileyi silmek istediğinizden emin misiniz?"))
      return;

    try {
      setLoading(true);
      const res = await fetch("/api/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: selectedFamily._id }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Silme işlemi başarısız");
        return;
      }

      await fetchFamilies();
      resetForm();
    } catch (error) {
      setError("Silme işlemi sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const paginatedFamilies = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return families.slice(start, end);
  }, [page, families]);

  // Aile tablosundan seçim olduğunda, seçili aile ve form bilgileri güncellenir
  useEffect(() => {
    const selectedId = Array.from(selectedKeys)[0]; // selectionMode="single" olduğundan tek bir key
    const family = families.find((f) => f._id === selectedId); // Aile bilgisini bul
    setSelectedFamily(family); // Seçili aileyi state'e kaydet

    // Seçilen aileyi formData'ya aktar
    if (family) {
      setFormData({
        familyName: family.familyName || "",
        familyBrand: family.familyBrand || "",
        familyCategory: family.familyCategory || "",
        familyVariantCount: family.familyVariantCount || "",
        familyV1Name: family.familyV1Name || "",
        familyV2Name: family.familyV2Name || "",
        familyV3Name: family.familyV3Name || "",
        familyDetail: family.familyDetail || "",
      });
      // Aile değiştiğinde varyant paneli de sıfırlansın
      resetVariantForm();
    }
  }, [selectedKeys, families]);

  // Varyant formundaki input değişiklikleri
  const handleVariantInputChange = (e) => {
    setVariantFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetVariantForm = () => {
    setVariantFormData({
      v1: "",
      v2: "",
      v3: "",
      sku: "",
      box: "",
      price: "",
      count: "",
    });
    setSelectedVariant(null);
    setVariantSelectedKeys(new Set());
  };

  // Seçili ailede yeni varyant ekler
  const handleVariantAdd = async () => {
    if (!selectedFamily?._id) {
      setError("Önce bir aile seçmelisiniz");
      return;
    }
    try {
      setLoading(true);
      const newVariants = [
        ...(selectedFamily.variants || []),
        { ...variantFormData },
      ];
      // Aile güncelleme için diğer alanları da koruyoruz
      const res = await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedFamily._id,
          variants: newVariants,
          // Diğer aile alanları, dokümandan alınarak gönderilebilir
          familyName: selectedFamily.familyName,
          familyBrand: selectedFamily.familyBrand,
          familyCategory: selectedFamily.familyCategory,
          familyVariantCount: selectedFamily.familyVariantCount,
          familyV1Name: selectedFamily.familyV1Name,
          familyV2Name: selectedFamily.familyV2Name,
          familyV3Name: selectedFamily.familyV3Name,
          familyDetail: selectedFamily.familyDetail,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Varyant ekleme işlemi başarısız");
        return;
      }
      await fetchFamilies();
      // Eklenen varyantın görünmesi için seçili aileyi güncelle
      resetVariantForm();
    } catch (error) {
      setError("Varyant ekleme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Seçili varyantı düzenler
  const handleVariantEdit = async () => {
    if (!selectedFamily?._id || !selectedVariant?._id) {
      setError("Lütfen düzenlenecek varyantı seçin");
      return;
    }
    try {
      setLoading(true);
      const newVariants = (selectedFamily.variants || []).map((v) =>
        v._id === selectedVariant._id ? { ...v, ...variantFormData } : v
      );
      const res = await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedFamily._id,
          variants: newVariants,
          familyName: selectedFamily.familyName,
          familyBrand: selectedFamily.familyBrand,
          familyCategory: selectedFamily.familyCategory,
          familyVariantCount: selectedFamily.familyVariantCount,
          familyV1Name: selectedFamily.familyV1Name,
          familyV2Name: selectedFamily.familyV2Name,
          familyV3Name: selectedFamily.familyV3Name,
          familyDetail: selectedFamily.familyDetail,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Varyant düzenleme işlemi başarısız");
        return;
      }
      await fetchFamilies();
      resetVariantForm();
    } catch (error) {
      setError("Varyant düzenleme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Seçili varyantı siler
  const handleVariantDelete = async () => {
    if (!selectedFamily?._id || !selectedVariant?._id) {
      setError("Lütfen silinecek varyantı seçin");
      return;
    }
    if (!window.confirm("Bu varyantı silmek istediğinizden emin misiniz?"))
      return;
    try {
      setLoading(true);
      const newVariants = (selectedFamily.variants || []).filter(
        (v) => v._id !== selectedVariant._id
      );
      const res = await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedFamily._id,
          variants: newVariants,
          familyName: selectedFamily.familyName,
          familyBrand: selectedFamily.familyBrand,
          familyCategory: selectedFamily.familyCategory,
          familyVariantCount: selectedFamily.familyVariantCount,
          familyV1Name: selectedFamily.familyV1Name,
          familyV2Name: selectedFamily.familyV2Name,
          familyV3Name: selectedFamily.familyV3Name,
          familyDetail: selectedFamily.familyDetail,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Varyant silme işlemi başarısız");
        return;
      }
      await fetchFamilies();
      resetVariantForm();
    } catch (error) {
      setError("Varyant silme sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Varyant tablosunda seçim olduğunda form bilgilerini güncelle
  useEffect(() => {
    const selectedVarId = Array.from(variantSelectedKeys)[0];
    if (selectedFamily && selectedVarId) {
      const variant = (selectedFamily.variants || []).find(
        (v) => v._id === selectedVarId
      );
      setSelectedVariant(variant);
      if (variant) {
        setVariantFormData({
          v1: variant.v1 || "",
          v2: variant.v2 || "",
          v3: variant.v3 || "",
          sku: variant.sku || "",
          box: variant.box || "",
          price: variant.price || "",
          count: variant.count || "",
        });
      }
    }
  }, [variantSelectedKeys, selectedFamily]);

  return (
    <>
      <div className="flex">
        {/* Aile Paneli */}
        <div>
          <Card className="bg-transparent flex-1 max-w-sm">
            <CardHeader>
              <h1 className="mx-auto">Ürün Aile Paneli</h1>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardHeader>
            <Divider />
            <CardBody className="flex-row gap-5">
              <div className="w-1/2">
                <p className="text-sm px-2">Ürün Ailesi İsmi</p>
                <Input
                  size="sm"
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleInputChange}
                  placeholder="Ürünün ana ismi"
                  disabled={loading}
                />
                <p className="text-sm px-2 pt-4">Varyant Sayısı</p>
                <Input
                  size="sm"
                  type="number"
                  name="familyVariantCount"
                  value={formData.familyVariantCount}
                  onChange={handleInputChange}
                  placeholder="Varyant sayısı"
                  disabled={loading}
                />
                <p className="text-sm px-2 pt-4">Ürün Kategorisi</p>
                <Input
                  size="sm"
                  name="familyCategory"
                  value={formData.familyCategory}
                  onChange={handleInputChange}
                  placeholder="Ürün kategorisi"
                  disabled={loading}
                />
                <p className="text-sm px-2 pt-4">Ürün Markası</p>
                <Input
                  size="sm"
                  name="familyBrand"
                  value={formData.familyBrand}
                  onChange={handleInputChange}
                  placeholder="Ürün markası"
                  disabled={loading}
                />

                <div className="flex mt-16 mr-5 pr-4 gap-2">
                  <Button
                    size="sm"
                    color="success"
                    onClick={handleAdd}
                    disabled={loading}
                  >
                    {loading ? "İşleniyor..." : "Aile Ekle"}
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    onClick={handleEdit}
                    disabled={loading || !selectedFamily}
                  >
                    {loading ? "İşleniyor..." : "Düzenle"}
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    onClick={handleDelete}
                    disabled={loading || !selectedFamily}
                  >
                    {loading ? "İşleniyor..." : "Sil"}
                  </Button>
                  <Button
                    size="sm"
                    color="default"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Temizle
                  </Button>
                </div>
              </div>

              <div className="w-1/2">
                <p className="text-sm px-2">1. Varyant İsmi</p>
                <Input
                  size="sm"
                  name="familyV1Name"
                  value={formData.familyV1Name}
                  onChange={handleInputChange}
                  placeholder="İlk varyant ismi"
                  disabled={loading}
                />
                <p className="text-sm px-2 pt-4">2. Varyant İsmi</p>
                <Input
                  size="sm"
                  name="familyV2Name"
                  value={formData.familyV2Name}
                  onChange={handleInputChange}
                  placeholder="İkinci varyant ismi"
                  disabled={loading}
                />
                <p className="text-sm px-2 pt-4">3. Varyant İsmi</p>
                <Input
                  size="sm"
                  name="familyV3Name"
                  value={formData.familyV3Name}
                  onChange={handleInputChange}
                  placeholder="Üçüncü varyant ismi"
                  disabled={loading}
                />
                <p className="text-sm px-2 pt-4">Ürün Açıklaması</p>
                <Textarea
                  name="familyDetail"
                  value={formData.familyDetail}
                  onChange={handleInputChange}
                  placeholder="Ürün açıklaması"
                  disabled={loading}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Aile Tablosu */}
        <div className="mx-4 text-sm">
          <Card>
            <CardHeader>
              <h1 className="mx-auto">Ürün Aileleri</h1>
            </CardHeader>
            <Divider />
            <Table
              aria-label="Ürün aileleri tablosu"
              color="primary"
              selectionMode="single" // Tekli seçim
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="secondary"
                    page={parseInt(page, 10)}
                    total={Math.ceil(families.length / rowsPerPage)} // Toplam sayfa sayısı
                    onChange={(newPage) => setPage(newPage)} // Sayfa değişimi
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>AİLE İSMİ</TableColumn>
                <TableColumn>MARKA</TableColumn>
                <TableColumn>KATEGORİ</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedFamilies.map((family) => (
                  <TableRow
                    key={family._id}
                    onClick={() => setSelectedKeys(new Set([family._id]))}
                  >
                    <TableCell className="text-xs">
                      {family.familyName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {family.familyBrand}
                    </TableCell>
                    <TableCell className="text-xs">
                      {family.familyCategory}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Varyant Paneli */}
        <div className="text-sm max-w-xs">
          <Card>
            <CardHeader>
              <h1 className="mx-auto">Varyant Paneli</h1>
            </CardHeader>
            <Divider />
            <CardBody className="flex-row gap-4">
              <div className="w-1/2">
                <p className="text-sm">1. Varyant</p>
                <Input
                  size="sm"
                  name="v1"
                  value={variantFormData.v1}
                  onChange={handleVariantInputChange}
                  placeholder={formData.familyV1Name || "Varyant 1"}
                  disabled={loading}
                />
                <p className="text-sm mt-2">2. Varyant</p>
                <Input
                  size="sm"
                  name="v2"
                  value={variantFormData.v2}
                  onChange={handleVariantInputChange}
                  placeholder={formData.familyV2Name || "Varyant 2"}
                  disabled={loading}
                />
                <p className="text-sm mt-2">3. Varyant</p>
                <Input
                  size="sm"
                  name="v3"
                  value={variantFormData.v3}
                  onChange={handleVariantInputChange}
                  placeholder={formData.familyV3Name || "Varyant 3"}
                  disabled={loading}
                />
              </div>
              <div className="w-1/2">
                <p className="text-sm">Fiyat</p>
                <Input
                  size="sm"
                  name="price"
                  value={variantFormData.price}
                  onChange={handleVariantInputChange}
                  placeholder="Fiyat"
                  disabled={loading}
                />
                <p className="text-sm mt-2">SKU</p>
                <Input
                  size="sm"
                  name="sku"
                  value={variantFormData.sku}
                  onChange={handleVariantInputChange}
                  placeholder="SKU"
                  disabled={loading}
                />
                <p className="text-sm mt-2">Koli İçi Sayısı</p>
                <Input
                  size="sm"
                  name="box"
                  value={variantFormData.box}
                  onChange={handleVariantInputChange}
                  placeholder="Koli içi sayısı"
                  disabled={loading}
                />
                <p className="text-sm mt-2">Stok Sayısı</p>
                <Input
                  size="sm"
                  name="count"
                  value={variantFormData.count}
                  onChange={handleVariantInputChange}
                  placeholder="Stok sayısı"
                  disabled={loading}
                />
              </div>
            </CardBody>
            <Divider />
            <div className="flex justify-center gap-2 p-2">
              <Button
                size="sm"
                color="success"
                onClick={handleVariantAdd}
                disabled={loading || !selectedFamily}
              >
                {loading ? "İşleniyor..." : "Varyant Ekle"}
              </Button>
              <Button
                size="sm"
                color="warning"
                onClick={handleVariantEdit}
                disabled={loading || !selectedVariant}
              >
                {loading ? "İşleniyor..." : "Düzenle"}
              </Button>
              <Button
                size="sm"
                color="danger"
                onClick={handleVariantDelete}
                disabled={loading || !selectedVariant}
              >
                {loading ? "İşleniyor..." : "Sil"}
              </Button>
              <Button
                size="sm"
                color="default"
                onClick={resetVariantForm}
                disabled={loading}
              >
                Temizle
              </Button>
            </div>
          </Card>
        </div>

        {/* Varyant Tablosu */}
        <div className="ml-4">
          <Card>
            <CardHeader>
              <h1 className="mx-auto">Varyantlar</h1>
            </CardHeader>
            <Divider />
            <Table
              className="mt-1"
              aria-label="Varyantlar tablosu"
              color="primary"
              selectionMode="single"
              selectedKeys={variantSelectedKeys}
              onSelectionChange={setVariantSelectedKeys}
            >
              <TableHeader>
                <TableColumn>v1</TableColumn>
                <TableColumn>v2</TableColumn>
                <TableColumn>v3</TableColumn>
                <TableColumn>FİYAT</TableColumn>
                <TableColumn>SKU</TableColumn>
                <TableColumn>STOK</TableColumn>
              </TableHeader>
              <TableBody>
                {(selectedFamily?.variants || []).map((variant) => (
                  <TableRow
                    key={variant._id}
                    onClick={() =>
                      setVariantSelectedKeys(new Set([variant._id]))
                    }
                  >
                    <TableCell className="text-xs">{variant.v1}</TableCell>
                    <TableCell className="text-xs">{variant.v2}</TableCell>
                    <TableCell className="text-xs">{variant.v3}</TableCell>
                    <TableCell className="text-xs">{variant.price}</TableCell>
                    <TableCell className="text-xs">{variant.sku}</TableCell>
                    <TableCell className="text-xs">{variant.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
