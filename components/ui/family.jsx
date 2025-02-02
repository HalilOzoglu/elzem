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
  const rowsPerPage = 10; // Her sayfada gösterilecek aile sayısı
  const [selectedKeys, setSelectedKeys] = useState(new Set()); // Seçili satırlar

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
    }
  }, [selectedKeys, families]);

  return (
    <div className="flex">
      <Card className="bg-transparent">
        <CardHeader>
          <h1 className="mx-auto">Varyantlı Ürün Paneli</h1>
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

            <div className="flex mt-4 mr-5 pr-4 gap-2">
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

      <div className="mx-4">
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
              <TableColumn>KOD</TableColumn>
              <TableColumn>AİLE İSMİ</TableColumn>
              <TableColumn>MARKA</TableColumn>
              <TableColumn>KATEGORİ</TableColumn>
              <TableColumn>1. VARYANT ADI</TableColumn>
              <TableColumn>2. VARYANT ADI</TableColumn>
              <TableColumn>3. VARYANT ADI</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedFamilies.map((family) => (
                <TableRow
                  key={family._id}
                  onClick={() => setSelectedKeys(new Set([family._id]))}
                >
                  <TableCell className="font-mono">
                    {family.familyCode}
                  </TableCell>
                  <TableCell>{family.familyName}</TableCell>
                  <TableCell>{family.familyBrand}</TableCell>
                  <TableCell>{family.familyCategory}</TableCell>
                  <TableCell>{family.familyV1Name}</TableCell>
                  <TableCell>{family.familyV2Name}</TableCell>
                  <TableCell>{family.familyV3Name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
