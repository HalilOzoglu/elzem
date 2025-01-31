"use client";
import ProductAdd from "@/components/ui/newtable";
import { Tab, Tabs } from "@heroui/tabs";
export default function CreatePage() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Ürün Ekleme Sayfası</h1>
      <Tabs aria-label="Options" color="success">
        <Tab title="Tekli">
          <ProductAdd />
        </Tab>
        <Tab title="Varyantlı"></Tab>
      </Tabs>
    </div>
  );
}
