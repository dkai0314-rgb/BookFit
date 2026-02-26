import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import fs from 'fs';
import path from 'path';
import Header from "@/components/Header";
import TemplateForm from "./TemplateForm";

export default function TemplatePage() {
    const filePath = path.join(process.cwd(), 'src', 'content', 'template-intro.md');
    const fileContent = fs.readFileSync(filePath, 'utf8');

    return (
        <div className="min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
            <Header />
            <main className="flex-1 w-full max-w-6xl px-4 py-24 flex flex-col md:flex-row gap-12 lg:gap-24 relative">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 blur-[100px] pointer-events-none rounded-full" aria-hidden="true"></div>

                {/* Markdown Content */}
                <div className="flex-1 text-gray-200 z-10">
                    <div className="prose prose-invert prose-lg prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-a:text-accent hover:prose-a:text-white max-w-none">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {fileContent}
                        </ReactMarkdown>
                    </div>
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
