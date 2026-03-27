import dbConnect from '../../../utils/dbConnect';
import Family from '../../../models/family';

export async function GET(req) {
    try {
        await dbConnect();

        // Ürün ailelerini getir ve sıralamaya göre sırala
        const families = await Family.find()
            .sort('order')
            .select('familyName familyBrand familyCategory familyCode order');

        return Response.json(families);
    } catch (error) {
        console.error('Ürün aileleri getirilirken hata:', error);
        return Response.json(
            { message: 'Sunucu hatası' },
            { status: 500 }
        );
    }
} 