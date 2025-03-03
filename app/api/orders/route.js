import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/order";

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
    await dbConnect();
    
    const data = await request.json();
    const { cart, total } = data;

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
      products: orderProducts,
      total: total
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Sipariş oluşturma hatası:", error);
    return NextResponse.json(
      { success: false, error: "Sipariş oluşturulamadı" },
      { status: 500 }
    );
  }
} 