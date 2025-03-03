import dbConnect from '@/utils/dbConnect';
import Product from '@/models/product';
import Family from '@/models/family';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await dbConnect();

        const { items } = await request.json();

        // Her bir öğe için sıralama güncellemesi yap
        const updatePromises = items.map(item => {
            if (item.type === 'product') {
                return Product.findByIdAndUpdate(item.id, { order: item.order });
            } else if (item.type === 'family') {
                return Family.findByIdAndUpdate(item.id, { order: item.order });
            }
            return null;
        }).filter(Boolean);

        await Promise.all(updatePromises);

        return NextResponse.json({ message: 'Sıralama başarıyla güncellendi' });
    } catch (error) {
        console.error('Sıralama güncellenirken hata:', error);
        return NextResponse.json(
            { message: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}