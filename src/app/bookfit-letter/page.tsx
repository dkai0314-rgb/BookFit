import {
    listLettersWithBooks,
    type LetterKind,
    type LetterWithBooks,
} from '@/lib/firestore-models';
import Link from 'next/link';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const KIND_LABELS: Record<LetterKind, string> = {
    weekly: '이주의 한 권',
    monthly_pick: '이달의 픽 (3권)',
    special: '스페셜',
};

type Props = {
    searchParams: Promise<{ kind?: string }>;
};

export default async function BookFitLetterListPage({ searchParams }: Props) {
    const sp = await searchParams;
    const filterKind = (sp.kind && (sp.kind as LetterKind)) || undefined;

    let letters: LetterWithBooks[] = [];
    try {
        // Firestore composite index 의존 제거 — 단일 orderBy + in-memory 정렬
        letters = await listLettersWithBooks({
            status: 'PUBLISHED',
            kind:
                filterKind === 'weekly' ||
                filterKind === 'monthly_pick' ||
                filterKind === 'special'
                    ? filterKind
                    : undefined,
            orderBy: [{ field: 'publishedAt', dir: 'desc' }],
        });
        letters.sort((a, b) => {
            if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
            const ad = a.publishedAt?.getTime() ?? 0;
            const bd = b.publishedAt?.getTime() ?? 0;
            return bd - ad;
        });
    } catch (error) {
        console.error('letter list query failed', error);
    }

    return (
        <>
            <Header />
            <div className="max-w-5xl mx-auto p-6 md:p-10 font-sans mt-32">
                <div className="space-y-3 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
                        BookFit Letter
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
                        북핏레터
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl">
                        매주 한 회차 — 어떤 주는 책 한 권을 깊이 파고들고, 어떤 주는 테마로 묶은 세 권을 함께 권해요.
                    </p>
                </div>

                <FilterChips active={filterKind} />

                {letters.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-secondary/30 border border-border rounded-xl">
                        {filterKind
                            ? '이 형식의 발행된 레터가 아직 없어요.'
                            : '발행된 레터가 아직 없어요. 첫 번째 레터를 기대해 주세요!'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {letters.map((letter) => (
                            <LetterCard key={letter.id} letter={letter} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function FilterChips({ active }: { active: LetterKind | undefined }) {
    const items: { value: LetterKind | 'all'; label: string }[] = [
        { value: 'all', label: '전체' },
        { value: 'weekly', label: KIND_LABELS.weekly },
        { value: 'monthly_pick', label: KIND_LABELS.monthly_pick },
        { value: 'special', label: KIND_LABELS.special },
    ];
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((it) => {
                const isActive = it.value === 'all' ? !active : active === it.value;
                const href = it.value === 'all' ? '/bookfit-letter' : `/bookfit-letter?kind=${it.value}`;
                return (
                    <Link
                        key={it.value}
                        href={href}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            isActive
                                ? 'bg-accent text-primary-foreground border-accent shadow-sm'
                                : 'bg-background border-border text-muted-foreground hover:border-accent hover:text-accent'
                        }`}
                    >
                        {it.label}
                    </Link>
                );
            })}
        </div>
    );
}

function LetterCard({ letter }: { letter: LetterWithBooks }) {
    const cover =
        letter.ogImageUrl ||
        letter.coverImageUrl ||
        letter.books[0]?.imageUrl ||
        null;
    const headline =
        letter.headlineTitle || letter.metaTitle || letter.title;
    const dateStr = new Date(
        letter.publishedAt || letter.createdAt,
    ).toLocaleDateString('ko-KR');

    return (
        <Link
            href={`/bookfit-letter/${letter.slug}`}
            className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all block bg-white"
        >
            <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative flex items-center justify-center">
                {cover ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={cover.replace('coversum', 'cover500').replace(/^http:/i, 'https:')}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 z-0"
                        />
                        {letter.kind === 'monthly_pick' && letter.books.length >= 3 ? (
                            <div className="relative z-10 flex gap-2 px-4">
                                {letter.books.slice(0, 3).map((b) => (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        key={b.id}
                                        src={(b.imageUrl ?? '')
                                            .replace('coversum', 'cover500')
                                            .replace(/^http:/i, 'https:')}
                                        alt={b.title}
                                        className="w-1/3 aspect-[2/3] object-cover rounded shadow-lg group-hover:-translate-y-1 transition-transform"
                                    />
                                ))}
                            </div>
                        ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={cover.replace('coversum', 'cover500').replace(/^http:/i, 'https:')}
                                alt={headline}
                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-xl"
                            />
                        )}
                    </>
                ) : (
                    <div className="w-full h-full bg-accent/10" />
                )}
                {letter.isFeatured && (
                    <div className="absolute top-3 left-3 z-20 bg-accent text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                        Featured
                    </div>
                )}
                <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm border border-border text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded text-accent">
                    {KIND_LABELS[letter.kind]}
                </div>
            </div>
            <div className="p-6 space-y-2">
                {letter.category && (
                    <div className="text-[10px] font-bold uppercase tracking-widest text-accent">
                        {letter.category}
                    </div>
                )}
                <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                    {headline}
                </h2>
                {letter.metaDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 break-keep">
                        {letter.metaDescription}
                    </p>
                )}
                <div className="text-xs text-gray-400 font-medium pt-1 flex items-center justify-between">
                    <span>{dateStr}</span>
                    {letter.readingTime ? <span>약 {letter.readingTime}분</span> : null}
                </div>
            </div>
        </Link>
    );
}
