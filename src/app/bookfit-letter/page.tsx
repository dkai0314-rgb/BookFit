import { prisma } from '@/lib/db';
import Link from 'next/link';
import Header from '@/components/Header';

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
            metaTitle: true,
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
        <>
            <Header />
            <div className="max-w-4xl mx-auto p-6 md:p-10 font-sans mt-32">
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
                                    <div className="aspect-[4/3] sm:aspect-[3/4] bg-gray-50 overflow-hidden relative flex items-center justify-center">
                                        {letter.coverImageUrl ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={letter.coverImageUrl}
                                                    alt=""
                                                    aria-hidden="true"
                                                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 z-0"
                                                />
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={letter.coverImageUrl}
                                                    alt={letter.metaTitle || letter.title}
                                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-xl"
                                                />
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-[#FF5C39] opacity-10" />
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-[#FF5C39] transition-colors line-clamp-2 leading-tight">
                                            {letter.metaTitle || letter.title}
                                        </h2>
                                        {letter.headlineTitle && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-snug">
                                                {letter.headlineTitle}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 font-medium mt-auto">
                                            발행일: {new Date(letter.publishedAt || letter.createdAt).toLocaleDateString('ko-KR')}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
