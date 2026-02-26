import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        const templateRequest = await prisma.templateRequest.create({
            data: {
                name,
                email,
                status: 'pending',
            }
        });

        return NextResponse.json({ success: true, data: templateRequest }, { status: 201 });
    } catch (error) {
        console.error('Template request error:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
