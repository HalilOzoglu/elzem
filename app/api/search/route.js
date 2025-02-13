import dbConnect from "@/utils/dbConnect";
import Product from "@/models/product";
import Family from "@/models/family";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return new Response(JSON.stringify({ error: "Arama terimi gerekli" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await dbConnect();

    // Ürünleri arama
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { productBrand: { $regex: query, $options: "i" } },
        { productCategory: { $regex: query, $options: "i" } },
        { productDetail: { $regex: query, $options: "i" } },
      ],
    })
      .select("productName productSku productBrand productCategory")
      .limit(10);

    // Aileleri arama
    const families = await Family.find({
      $or: [
        { familyName: { $regex: query, $options: "i" } },
        { familyBrand: { $regex: query, $options: "i" } },
        { familyCategory: { $regex: query, $options: "i" } },
        { familyDetail: { $regex: query, $options: "i" } },
      ],
    })
      .select("familyName familyCode familyBrand familyCategory")
      .limit(10);

    // Sonuçları birleştir ve sırala
    const results = [
      ...products.map((product) => ({
        _id: product._id.toString(),
        name: product.productName,
        code: product.productSku,
        brand: product.productBrand,
        category: product.productCategory,
        type: "product",
        productSku: product.productSku,
        productName: product.productName,
      })),
      ...families.map((family) => ({
        _id: family._id.toString(),
        name: family.familyName,
        code: family.familyCode,
        brand: family.familyBrand,
        category: family.familyCategory,
        type: "family",
        productSku: family.familyCode,
        productName: family.familyName,
      })),
    ].slice(0, 10); // Toplam sonuç sayısını 10 ile sınırla

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Arama hatası:", error);
    return new Response(JSON.stringify({ error: "Sunucu hatası" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
