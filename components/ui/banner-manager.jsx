"use client";
import React, { useEffect, useState } from "react";
import {
  Card, CardHeader, CardBody, Divider, Button, Input, Image,
  Select, SelectItem, Switch,
} from "@heroui/react";

const LINK_TYPES = [
  { key: "none", label: "Link Yok" },
  { key: "search", label: "Arama Sayfası" },
  { key: "product", label: "Ürün Sayfası" },
];

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ title: "", linkType: "none", linkValue: "", order: 0, isActive: true });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      setBanners(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Lütfen bir resim dosyası seçin"); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedFile && !editingId) { alert("Lütfen bir görsel seçin"); return; }
    setIsLoading(true);
    try {
      let imageUrl = editingId ? banners.find(b => b._id === editingId)?.imageUrl : null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", "banner");
        formData.append("id", editingId || "new");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) { alert("Görsel yüklenemedi: " + uploadData.message); return; }
        imageUrl = uploadData.url;
      }

      const payload = { ...form, imageUrl };

      if (editingId) {
        await fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: editingId, ...payload }),
        });
      } else {
        await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      fetchBanners();
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner._id);
    setForm({
      title: banner.title || "",
      linkType: banner.linkType || "none",
      linkValue: banner.linkValue || "",
      order: banner.order ?? 0,
      isActive: banner.isActive ?? true,
    });
    setPreviewUrl(banner.imageUrl);
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu banner'ı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/banners?id=${id}`, { method: "DELETE" });
    fetchBanners();
  };

  const resetForm = () => {
    setForm({ title: "", linkType: "none", linkValue: "", order: 0, isActive: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(null);
  };

  return (
    <div className="flex gap-4">
      {/* Sol: Form */}
      <Card className="w-1/3">
        <CardHeader>
          <h2 className="text-lg font-semibold">{editingId ? "Banner Düzenle" : "Yeni Banner Ekle"}</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3">
            <Input
              label="Başlık (opsiyonel)"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              size="sm"
            />

            <div>
              <p className="text-sm mb-1">Banner Görseli (1920×600 önerilir)</p>
              <Input type="file" accept="image/*" onChange={handleFileChange} size="sm" />
              {previewUrl && (
                <Image src={previewUrl} alt="Önizleme" className="mt-2 w-full h-24 object-cover rounded" />
              )}
            </div>

            <Select
              label="Link Tipi"
              selectedKeys={[form.linkType]}
              onSelectionChange={keys => setForm(p => ({ ...p, linkType: Array.from(keys)[0] }))}
              size="sm"
            >
              {LINK_TYPES.map(t => <SelectItem key={t.key}>{t.label}</SelectItem>)}
            </Select>

            {form.linkType !== "none" && (
              <Input
                label={form.linkType === "search" ? "Arama Terimi" : "Ürün SKU / Aile Kodu"}
                value={form.linkValue}
                onChange={e => setForm(p => ({ ...p, linkValue: e.target.value }))}
                size="sm"
                placeholder={form.linkType === "search" ? "örn: kablo" : "örn: PRD-1234"}
              />
            )}

            <Input
              label="Sıra"
              type="number"
              value={String(form.order)}
              onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
              size="sm"
            />

            <div className="flex items-center gap-2">
              <Switch
                isSelected={form.isActive}
                onValueChange={v => setForm(p => ({ ...p, isActive: v }))}
                size="sm"
              />
              <span className="text-sm">Aktif</span>
            </div>

            <div className="flex gap-2">
              <Button color="primary" onClick={handleSave} isLoading={isLoading} className="flex-1">
                {editingId ? "Güncelle" : "Kaydet"}
              </Button>
              {editingId && (
                <Button variant="flat" onClick={resetForm}>İptal</Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sağ: Banner Listesi */}
      <Card className="w-2/3">
        <CardHeader><h2 className="text-lg font-semibold">Banner Listesi</h2></CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3">
            {banners.length === 0 && <p className="text-gray-400 text-sm">Henüz banner eklenmemiş.</p>}
            {banners.map(banner => (
              <div key={banner._id} className="flex items-center gap-3 border rounded p-2">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "banner"}
                  width={120}
                  height={40}
                  className="object-cover rounded h-12 w-24"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{banner.title || "(Başlıksız)"}</p>
                  <p className="text-xs text-gray-500">
                    Sıra: {banner.order} · {banner.isActive ? "Aktif" : "Pasif"} ·{" "}
                    {banner.linkType === "none" ? "Link yok" : `${banner.linkType}: ${banner.linkValue}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="flat" color="primary" onClick={() => handleEdit(banner)}>Düzenle</Button>
                  <Button size="sm" variant="flat" color="danger" onClick={() => handleDelete(banner._id)}>Sil</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
