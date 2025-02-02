import Family from "@/models/family";
import dbConnect from "@/utils/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const families = await Family.find({}).sort({ createdAt: -1 });
    return NextResponse.json(families);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // familyCode otomatik oluşturulacak, kabul etmiyoruz
    const { familyCode, ...rest } = body;

    const family = new Family(rest);
    await family.save();
    return NextResponse.json({ success: true, family }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { _id, familyCode, ...updateFields } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Aile kimliği belirtilmeli" },
        { status: 400 }
      );
    }

    const family = await Family.findByIdAndUpdate(_id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!family) {
      return NextResponse.json(
        { success: false, message: "Aile bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, family });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { _id } = await req.json();

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Aile kimliği belirtilmeli" },
        { status: 400 }
      );
    }

    const family = await Family.findByIdAndDelete(_id);
    if (!family) {
      return NextResponse.json(
        { success: false, message: "Aile bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Aile silindi" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
