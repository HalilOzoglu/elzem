import Product from "@/models/product";
import Family from "@/models/family";
import Banner from "@/models/banner";
import dbConnect from "@/utils/dbConnect";
import ProductList from "@/components/ui/ProductList";
import ProductCard from "@/components/ui/ProductCard";
import FamilyCard from "@/components/ui/FamilyCard";
import FloatingButtons from "@/components/FloatingButtons";
import BannerSlider from "@/components/ui/BannerSlider";

// Dinamik davranışı zorla
export const dynamic = "force-dynamic"; // Bu satırı ekleyin

async function getBanners() {
  try {
    await dbConnect();
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 }).lean();
    return JSON.parse(JSON.stringify(banners));
  } catch {
    return [];
  }
}

async function getCategoriesWithProducts() {
  try {
    await dbConnect();

    // Tüm ürün ve aileleri al
    let [products, families] = await Promise.all([
      Product.find({})
        .select(
          "productCategory productName productPrice productDetail productCount productSku productImg1 productImgMini productImg2 productImg3 order"
        )
        .lean(),
      Family.find({})
        .select(
          "familyName familyCategory familyDetail familyCode familyBasePrice productImg1 productImgMini productImg2 productImg3 order"
        )
        .lean(),
    ]);

    // Tüm öğeleri birleştir ve dönüştür
    const allItems = [
      ...products.map(product => ({
        ...product,
        _id: product._id.toString(),
        type: "product"
      })),
      ...families.map(family => ({
        ...family,
        _id: family._id.toString(),
        productName: family.familyName,
        productCategory: family.familyCategory,
        productDetail: family.familyDetail,
        productPrice: family.familyBasePrice,
        productSku: family.familyCode,
        productImg1: family.productImg1,
        productImgMini: family.productImgMini,
        productImg2: family.productImg2,
        productImg3: family.productImg3,
        type: "family"
      }))
    ];

    // Order'a göre sırala
    const sortedItems = allItems.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : Infinity;
      const orderB = typeof b.order === 'number' ? b.order : Infinity;
      return orderA - orderB;
    });

    // İlk 24 favoriler için al
    const favorites = sortedItems.slice(0, 27);

    // Kategorilere göre grupla
    const categoryMap = {};
    sortedItems.forEach((item) => {
      const category = item.type === "product" ? item.productCategory : item.familyCategory;
      categoryMap[category] = categoryMap[category] || [];
      categoryMap[category].push(item);
    });

    return JSON.parse(JSON.stringify({
      favorites,
      categories: categoryMap
    }));
  } catch (error) {
    console.error("Veritabanı hatası:", error);
    throw error;
  }
}

export default async function Home() {
  let data;
  let banners = [];

  try {
    [data, banners] = await Promise.all([getCategoriesWithProducts(), getBanners()]);
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    data = null;
  }

  return (
    <div className="min-h-screen pt-4">
      <BannerSlider banners={banners} />
      <main className="container px-4 mx-auto">
        {/* Favoriler Bölümü */}
        <section className="mb-12">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Favoriler
                </h1>
                <div className="h-1 w-20 bg-blue-500 mt-2 rounded-full" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
            {data?.favorites.map((item) =>
              item.type === "product" ? (
                <ProductCard key={item.productSku} product={item} />
              ) : (
                <FamilyCard key={item.familyCode} family={item} />
              )
            )}
          </div>
        </section>
        
        {/* Kategoriler Bölümü */}
        <ProductList data={data?.categories} />
      </main>
      <FloatingButtons />
    </div>
  );
}
