"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Button,
  Textarea,
} from "@heroui/react";

export default function App() {
  return (
    <div className="flex">
      <Card className="bg-transparent">
        <CardHeader>
          <h1 className="mx-auto">Varyantlı Ürün Paneli</h1>
        </CardHeader>
        <Divider></Divider>
        <CardBody className=" flex-row gap-5">
          <div className="w-1/2">
            <p className="text-sm px-2">Ürün Ailesi İsmi</p>
            <Input size="sm" placeholder="Ürünün ana ismi"></Input>
            <p className="text-sm px-2 pt-4">Varyant Sayısı</p>
            <Input size="sm" placeholder="Varyant sayısı"></Input>
            <p className="text-sm px-2 pt-4">Ürün Kategorisi</p>
            <Input size="sm" placeholder="Ürünün kategorisi"></Input>
            <p className="text-sm px-2 pt-4">Ürün Markası</p>
            <Input size="sm" placeholder="Ürünün markası"></Input>

            <div className="flex mt-4 gap-2">
              <Button size="sm" color="success">
                Aile Ekle
              </Button>
              <Button className="" size="sm" color="warning">
                Düzenle
              </Button>
              <Button className="" size="sm" color="danger">
                Sil
              </Button>
            </div>
          </div>
          <div className="w-1/2">
            <p className="text-sm px-2">1.Varyant ismi </p>
            <Input size="sm" placeholder="İlk varyant ismi"></Input>
            <p className="text-sm px-2 pt-4">2.Varyant ismi </p>
            <Input size="sm" placeholder="İkinci varyant ismi"></Input>
            <p className="text-sm px-2 pt-4">3.Varyant ismi </p>
            <Input size="sm" placeholder="Üçüncü varyant ismi"></Input>
            <p className="text-sm px-2 pt-4">Ürün Açıklaması</p>
            <Textarea placeholder="Ürün açıklaması"></Textarea>
          </div>
        </CardBody>
      </Card>
      <div className="mx-4">
        <Card>
          <CardHeader>
            <h1 className="mx-auto"> Ürün Aileleri</h1>
          </CardHeader>
          <Divider></Divider>
          <Table shadow="none" aria-label="Example static collection table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow key="1">
                <TableCell>Tony Reichert</TableCell>
                <TableCell>CEO</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
              <TableRow key="2">
                <TableCell>Zoey Lang</TableCell>
                <TableCell>Technical Lead</TableCell>
                <TableCell>Paused</TableCell>
              </TableRow>
              <TableRow key="3">
                <TableCell>Jane Fisher</TableCell>
                <TableCell>Senior Developer</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
              <TableRow key="4">
                <TableCell>William Howard</TableCell>
                <TableCell>Community Manager</TableCell>
                <TableCell>Vacation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
