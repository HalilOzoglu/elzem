import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/order";
import User from "@/models/user";
import mongoose from "mongoose";
import twilio from 'twilio';

// Twilio istemcisini oluştur
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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

    // WhatsApp mesajı için sipariş özetini oluştur
    const orderSummary = `🛍️ Yeni Sipariş Bildirimi!\n\n` +
      `📦 Sipariş No: ${order._id}\n` +
      `👤 Müşteri: ${user.ad} ${user.soyad}\n` +
      `📞 Telefon: ${user.telefon}\n` +
      `🏪 Tabela: ${user.tabela}\n\n` +
      `📝 Ürünler:\n${orderProducts.map(p => `- ${p.name} (${p.count} adet)\n`).join('')}\n` +
      `💰 Toplam Tutar: ${total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}\n\n` +
      `📍 Teslimat Adresi:\n${user.adres.il}, ${user.adres.ilce}\n${user.adres.mahalle} ${user.adres.sokak}\n${user.adres.detay}`;

    // WhatsApp mesajını gönder
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER}`,
      body: orderSummary
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