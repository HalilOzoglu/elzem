"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import axios from "axios";

const ProductFamilyTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/products-families");
        setData(res.data.filter((item) => !item.sku.startsWith("FAM-")));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <Table aria-label="Product and Family Table">
      <TableHeader>
        <TableColumn>Kategori</TableColumn>
        <TableColumn>Stok Kodu</TableColumn>
        <TableColumn>Ürün / Aile İsmi</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.sku}</TableCell>
            <TableCell>{item.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductFamilyTable;
