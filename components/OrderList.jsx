"use client";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Button,
  Divider,
} from "@heroui/react";

const SortableItem = ({ id, item, index, moveItem, itemsLength, isProcessing }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? "var(--nextui-default-200)" : "",
    cursor: "move",
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isProcessing ? 0.7 : 1,
      }}
      {...attributes}
      {...listeners}
      className="grid grid-cols-7 p-3 border-b bg-default-50"
    >
      <div>{index + 1}</div>
      <div>{item.type === "product" ? "Ürün" : "Ürün Ailesi"}</div>
      <div>{item.name}</div>
      <div>{item.brand}</div>
      <div>{item.category}</div>
      <div>{item.type === "product" ? item.sku : item.code}</div>
      <div className="flex gap-2">
        <Button
          size="sm"
          color="primary"
          isDisabled={index === 0 || isProcessing}
          onClick={() => moveItem(index, "up")}
        >
          ↑
        </Button>
        <Button
          size="sm"
          color="primary"
          isDisabled={index === itemsLength - 1 || isProcessing}
          onClick={() => moveItem(index, "down")}
        >
          ↓
        </Button>
      </div>
    </div>
  );
};

export default function OrderList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const [productsRes, familiesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/families"),
      ]);

      const products = await productsRes.json();
      const families = await familiesRes.json();

      // Ürünleri ve aileleri birleştir ve formatla
      const formattedItems = [
        ...products.map((product) => ({
          id: product._id,
          name: product.productName,
          type: "product",
          brand: product.productBrand,
          category: product.productCategory,
          order: product.order || 0,
          sku: product.productSku,
        })),
        ...families.map((family) => ({
          id: family._id,
          name: family.familyName,
          type: "family",
          brand: family.familyBrand,
          category: family.familyCategory,
          order: family.order || 0,
          code: family.familyCode,
        })),
      ]
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        ...item,
        order: index + 1, // Her elemana sıralı order değeri atıyoruz
      }));

      // İlk yüklemede order değerlerini backend'e kaydet
      await fetch("/api/updateOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: formattedItems,
        }),
      });

      setItems(formattedItems);
      setLoading(false);
    } catch (error) {
      console.error("Veri yüklenirken hata:", error);
      setError("Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
      setLoading(false);
    }
  };

  const moveItem = async (index, direction) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (
        (direction === "up" && index === 0) ||
        (direction === "down" && index === items.length - 1)
      )
        return;

      const oldItems = [...items];
      const newItems = [...items];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      
      [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
      
      const updatedItems = newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));

      setItems(updatedItems);

      const response = await fetch("/api/updateOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: updatedItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Sıralama güncellenemedi');
      }
    } catch (error) {
      console.error("Sıralama güncellenirken hata:", error);
      setItems(oldItems); // Hata durumunda eski sıralamaya geri dön
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragEnd = async (event) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const { active, over } = event;
      
      if (active.id !== over.id) {
        const oldItems = [...items];
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updatedItems = newItems.map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));

        setItems(updatedItems);

        const response = await fetch("/api/updateOrder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: updatedItems,
          }),
        });

        if (!response.ok) {
          throw new Error('Sıralama güncellenemedi');
        }
      }
    } catch (error) {
      console.error("Sıralama güncellenirken hata:", error);
      setItems(oldItems); // Hata durumunda eski sıralamaya geri dön
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <Card className="bg-transparent">
      <CardHeader className="flex justify-center">
        <p className="text-lg">Ürün ve Ürün Ailesi Sıralaması</p>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="w-full">
          {/* Table Header */}
          <div className="grid grid-cols-7 bg-default-100 p-3">
            <div>SIRA</div>
            <div>TÜR</div>
            <div>ÜRÜN/AİLE ADI</div>
            <div>MARKA</div>
            <div>KATEGORİ</div>
            <div>KOD</div>
            <div>İŞLEMLER</div>
          </div>
          
          {/* Table Body */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  itemsLength={items.length}
                  isProcessing={isProcessing}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </CardBody>
    </Card>
  );
} 