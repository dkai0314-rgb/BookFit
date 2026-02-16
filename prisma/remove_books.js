
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const titlesToRemove = [
        "언어의 온도",
        "건축의 고고학",
        "침묵의 기술"
    ];

    console.log('Removing books with broken images...');

    const result = await prisma.book.deleteMany({
        where: {
            title: {
                in: titlesToRemove
            }
        }
    });

    console.log(`Deleted ${result.count} books.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
