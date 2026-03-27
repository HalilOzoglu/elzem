import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/order";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Session'dan gelen ID'yi ObjectId'ye çevir
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Kullanıcının siparişlerini getir
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    console.log("Kullanıcı ID:", userId);
    console.log("Bulunan siparişler:", orders.length);

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Siparişleri getirme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Siparişler getirilemedi" },
      { status: 500 }
    );
  }
} 