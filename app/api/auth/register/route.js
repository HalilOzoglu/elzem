import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/user";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { telefon, tabela, ad, soyad, password, adres } = body;

    // Telefon numarası kontrolü
    const userExists = await User.findOne({ telefon });
    if (userExists) {
      return NextResponse.json(
        { message: "Bu telefon numarası zaten kayıtlı" },
        { status: 400 }
      );
    }

    // Şifre hashleme
    const passwordHash = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluşturma
    const user = await User.create({
      telefon,
      tabela,
      ad,
      soyad,
      passwordHash,
      adres,
    });

    return NextResponse.json(
      {
        message: "Kullanıcı başarıyla oluşturuldu",
        user: {
          id: user._id,
          telefon: user.telefon,
          tabela: user.tabela,
          ad: user.ad,
          soyad: user.soyad,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { message: "Kullanıcı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 