import { prisma } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 60; // 1분마다 페이지 재생성 유효성 검사

export default async function BookFitLetterListPage() {
    const letters = await prisma.letter.findMany({
        where: {
            status: 'PUBLISHED',
        },
        select: {
            id: true,
            slug: true,
            title: true,
            headlineTitle: true,
            coverImageUrl: true,
            createdAt: true,
            publishedAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 font-sans mt-20">
            <h1 className="text-4xl font-extrabold text-[#FF5C39] mb-4">BookFit Letter</h1>
            <p className="text-lg text-gray-600 mb-10">지금 당신에게 필요한 딱 한 권, 매주 배달해 드릴게요.</p>

            {letters.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    발행된 레터가 아직 없습니다. 첫 번째 레터를 기대해 주세요!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {letters.map((letter) => {
                        return (
                            <Link
                                href={`/bookfit-letter/${letter.slug}`}
                                key={letter.id}
                                className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all block bg-white"
                            >
                                <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                                    {letter.coverImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={letter.coverImageUrl}
                                            alt={letter.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#FF5C39] opacity-10" />
                                    )}
                                </div>
                                <div className="p-6">
                                    <h2 className="text-base font-bold mb-3 text-slate-900 group-hover:text-[#FF5C39] transition-colors line-clamp-2 leading-snug">
                                        {letter.headlineTitle || letter.title}
                                    </h2>
                                    <p className="text-xs text-gray-500 font-medium">
                                        발행일: {new Date(letter.publishedAt || letter.createdAt).toLocaleDateString('ko-KR')}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
