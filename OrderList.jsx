const handleDragEnd = async (event) => {
  // ... sıralama işlemleri ...
  const updatedItems = newItems.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
  setItems(updatedItems);
  // API çağrısı
}

const moveItem = async (index, direction) => {
  // ... sıralama işlemleri ...
  const updatedItems = newItems.map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
  setItems(updatedItems);
  // API çağrısı
} 