//app/api/products/[sku]/route.js
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";

export async function GET(request, { params }) {
  const { sku } = params;

  try {
    await dbConnect();

    // Önce product kontrolü
    let data = await Product.findOne({ productSku: sku })
      .select("-__v -createdAt -updatedAt productImg1 productImgMini")
      .lean();
    let type = "product";

    if (!data) {
      // Product bulunamazsa family kontrolü
      const family = await Family.findOne({ familyCode: sku })
        .select("-__v -createdAt -updatedAt productImg1 productImgMini")
        .lean();

      if (!family) {
        return new Response(JSON.stringify({ error: "Not Found" }), {
          status: 404,
        });
      }

      data = {
        ...family,
        productName: family.familyName,
        productBrand: family.familyBrand,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        variants: family.variants,
        productImg1: family.productImg1,
        productImgMini: family.productImgMini
      };
      type = "family";
    }

    // Güvenli plain object olması için dönüşüm
    const safeData = JSON.parse(JSON.stringify(data));

    return new Response(JSON.stringify({ data: safeData, type }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
