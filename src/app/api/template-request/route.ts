import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        const db = getDb();
        const id = randomUUID();
        const data = {
            name,
            email,
            status: 'pending',
            createdAt: new Date(),
        };
        await db.collection('templateRequests').doc(id).set(data);

        return NextResponse.json(
            { success: true, data: { id, ...data } },
            { status: 201 },
        );
    } catch (error) {
        console.error('Template request error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
