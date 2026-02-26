import { prisma } from '@/lib/db';
import Header from "@/components/Header";
import TemplateForm from "./TemplateForm";

export const dynamic = 'force-dynamic';

export default async function TemplatePage() {
    const pageContent = await prisma.pageContent.findUnique({
        where: { id: 'template-intro' }
    });

    const htmlContent = pageContent?.content || '<p>템플릿 소개글이 아직 작성되지 않았습니다.</p>';

    return (
        <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
            <Header />
            <main className="flex-1 w-full max-w-6xl px-4 py-24 flex flex-col md:flex-row gap-12 lg:gap-24 relative">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 blur-[100px] pointer-events-none rounded-full" aria-hidden="true"></div>

                {/* HTML Content */}
                <div className="flex-1 text-gray-200 z-10">
                    <div
                        className="prose prose-invert prose-lg prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-a:text-accent hover:prose-a:text-white max-w-none break-words"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </div>

                {/* Form Section */}
                <div className="w-full md:w-[400px] flex-shrink-0 z-10">
                    <div className="sticky top-24">
                        <TemplateForm />
                    </div>
                </div>
            </main>
        </div>
    );
}
