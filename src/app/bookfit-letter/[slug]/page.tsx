import { prisma } from '@/lib/db';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60;

interface Props {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const letter = await prisma.letter.findUnique({ where: { slug } });

    if (!letter) return {};

    return {
        title: letter.metaTitle || letter.title,
        description: letter.metaDescription || letter.headlineTitle || letter.title,
        openGraph: {
            title: letter.metaTitle || letter.title,
            description: letter.metaDescription || letter.headlineTitle || letter.title,
            images: letter.ogImageUrl || letter.coverImageUrl ? [letter.ogImageUrl || letter.coverImageUrl!] : [],
        },
    };
}

export default async function BookFitLetterDetailPage({ params }: Props) {
    const { slug } = await params;

    const letter = await prisma.letter.findUnique({
        where: { slug },
    });

    if (!letter || letter.status !== 'PUBLISHED') {
        notFound();
    }

    // 메타 인포 숨김 처리
    let displayContent = letter.contentMarkdown;
    displayContent = displayContent.replace(/<!--META_INFO_START-->[\s\S]*?<!--META_INFO_END-->/g, '');

    return (
        <article className="max-w-3xl mx-auto p-6 md:p-10 font-sans mt-20 bg-white shadow-sm rounded-xl mb-20">
            <header className="mb-10 text-center border-b pb-8">
                {letter.coverImageUrl && (
                    <div className="w-32 h-44 mx-auto mb-6 shadow-md rounded-md overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={letter.coverImageUrl} alt={letter.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
                    {letter.title}
                </h1>

                <div className="text-sm text-gray-500 font-medium space-y-1 mb-6">
                    {letter.authors && <p>저자: {letter.authors}</p>}
                    {(letter.publisher || letter.publishedDate) && (
                        <p>출판: {letter.publisher} {letter.publishedDate}</p>
                    )}
                </div>

                <p className="text-sm text-gray-400">
                    {new Date(letter.publishedAt || letter.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                    })} 북핏 발행
                </p>
            </header>

            <div className="prose prose-lg prose-[#FF5C39] max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight 
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-slate-800
          prose-h3:text-xl prose-h3:text-slate-700
          prose-a:text-[#FF5C39] hover:prose-a:text-[#d44829]
          prose-blockquote:border-l-4 prose-blockquote:border-[#FF5C39] prose-blockquote:bg-gray-50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-slate-800 prose-blockquote:rounded-r-lg
          prose-img:rounded-xl prose-img:shadow-md
          prose-ul:list-disc prose-ol:list-decimal">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        a: ({ node, ...props }) => {
                            const linkText = String(props.children);
                            const isCta = linkText.includes('이 책 확인하고') || linkText.includes('적용해보기');

                            if (isCta) {
                                return (
                                    <a
                                        {...props}
                                        className="not-prose block w-full sm:w-10/12 md:w-8/12 mx-auto my-12 bg-[#FF5C39] text-white text-center font-bold text-lg md:text-xl py-5 px-6 rounded-2xl hover:bg-[#e04b2a] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {props.children}
                                    </a>
                                );
                            }
                            return <a {...props} target="_blank" rel="noopener noreferrer" />;
                        }
                    }}
                >
                    {displayContent}
                </ReactMarkdown>
            </div>

        </article>
    );
}
