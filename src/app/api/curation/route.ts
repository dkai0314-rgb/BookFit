
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/curation - Fetch all curations
export async function GET() {
    try {
        const curations = await prisma.curation.findMany({
            include: {
                books: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(curations);
    } catch (error) {
        console.error('Failed to fetch curations:', error);
        return NextResponse.json({ error: 'Failed to fetch curations' }, { status: 500 });
    }
}

// DELETE /api/curation?id={id} - Delete a curation
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        await prisma.curation.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Curation deleted successfully' });
    } catch (error) {
        console.error('Failed to delete curation:', error);
        return NextResponse.json({ error: 'Failed to delete curation' }, { status: 500 });
    }
}
