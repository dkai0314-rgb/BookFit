'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
    ],
};

export default function TemplateAdminPage() {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Fetch existing content
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/content?id=template-intro');
                if (response.ok) {
                    const data = await response.json();
                    setContent(data.htmlContent || '');
                }
            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: 'template-intro',
                    htmlContent: content,
                }),
            });

            if (response.ok) {
                alert('성공적으로 저장되었습니다!');
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to save content:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    // modules moved outside component

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">불러오는 중...</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">노션 템플릿 소개글 편집</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => router.push('/template')}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        페이지 미리보기
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? '저장 중...' : '저장하기'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
                <style dangerouslySetInnerHTML={{
                    __html: `
          .ql-editor { min-height: 500px; font-size: 16px; }
        `}} />
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-[500px] mb-12"
                />
            </div>
        </div>
    );
}
