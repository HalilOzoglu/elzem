"use client";
import ProductAdd from "@/components/ui/newtable";
import ProductFamily from "@/components/ui/family";
import { Tab, Tabs } from "@heroui/tabs";
import { Divider } from "@heroui/react";
import OrderList from "@/components/OrderList";
import PhotoManager from "@/components/ui/photo-manager";
export default function CreatePage() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Ürün Ekleme Sayfası</h1>
      <Divider className="mb-3"></Divider>
      <Tabs aria-label="Options" color="success">
        <Tab title="Tekli">
          <ProductAdd />
        </Tab>
        <Tab title="Varyantlı">
          <ProductFamily />
        </Tab>
        <Tab title="Sıralama">
          <OrderList />
        </Tab>
        <Tab title="Fotoğraf Yöneticisi">
          <PhotoManager />
        </Tab>
      </Tabs>
    </div>
  );
}
