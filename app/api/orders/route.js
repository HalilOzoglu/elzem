import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/order";
import User from "@/models/user";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find().sort({ createdAt: -1 }); // En yeni siparişler önce
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Siparişleri getirme hatası:", error);
    return NextResponse.json(
      { success: false, error: "Siparişler getirilemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sipariş vermek için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const data = await request.json();
    const { cart, total } = data;

    // Session'dan gelen ID'yi ObjectId'ye çevir
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Kullanıcı bilgilerini getir
    const user = await User.findById(userId);
    
    console.log("Aranan kullanıcı ID:", userId);
    console.log("Bulunan kullanıcı:", user);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Sepetteki ürünleri sipariş formatına dönüştür
    const orderProducts = cart.map(item => {
      // Varyant bilgilerinden tam ürün adını oluştur
      let fullProductName = item.productName || item.familyName;
      if (item.variantInfo) {
        const variantParts = [];
        if (item.variantInfo.v1) variantParts.push(item.variantInfo.v1);
        if (item.variantInfo.v2) variantParts.push(item.variantInfo.v2);
        if (item.variantInfo.v3) variantParts.push(item.variantInfo.v3);
        if (variantParts.length > 0) {
          fullProductName += ` - ${variantParts.join(' ')}`;
        }
      }

      return {
        sku: item.sku,
        name: fullProductName,
        price: item.price,
        count: item.quantity,
        variantInfo: item.variantInfo || null
      };
    });

    // Yeni sipariş oluştur
    const order = await Order.create({
      userId: userId,
      userInfo: {
        ad: user.ad,
        soyad: user.soyad,
        telefon: user.telefon,
        adres: user.adres,
        tabela: user.tabela
      },
      products: orderProducts,
      total: total
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sipariş oluşturulamadı: " + error.message },
      { status: 500 }
    );
  }
} 