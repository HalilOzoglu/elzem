import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/order";

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { status } = await request.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Sipariş güncelleme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sipariş güncellenemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Sipariş başarıyla silindi" });
  } catch (error) {
    console.error("Sipariş silme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sipariş silinemedi" },
      { status: 500 }
    );
  }
} 