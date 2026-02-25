import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function run() {
    const l = await prisma.letter.findUnique({ where: { slug: 'bookfit-339998630' } });
    fs.writeFileSync('temp_letter.md', l?.contentMarkdown || 'Not found');
    console.log('Saved to temp_letter.md');
}

run().catch(console.error).finally(() => prisma.$disconnect());
