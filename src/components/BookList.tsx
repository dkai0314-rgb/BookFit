
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Book {
    id: string;
    title: string;
    author: string;
    imageUrl: string | null;
    summary: string | null;
}

export default function BookList() {
    const [books, setBooks] = useState<Book[]>([]);

    useEffect(() => {
        async function fetchBooks() {
            try {
                const response = await fetch("/api/books?choice=true");
                if (response.ok) {
                    const data = await response.json();
                    setBooks(data);
                }
            } catch (error) {
                console.error("Failed to fetch books", error);
            }
        }
        fetchBooks();
    }, []);

    if (books.length === 0) {
        return <div className="text-gray-500 text-center py-10 col-span-3">Loading curated books...</div>;
    }

    return (
        <>
            {books.map((book, i) => (
                <Link key={i} href={`/books/${book.id}`} className="group relative space-y-4 cursor-pointer block">
                    <div className="aspect-[1/1.5] w-full overflow-hidden rounded-sm bg-[#0B2A1F] shadow-2xl border border-[rgba(255,255,255,0.05)] group-hover:shadow-[0_20px_50px_-12px_rgba(30,142,90,0.25)] transition-all duration-500 group-hover:-translate-y-2 relative">
                        {book.imageUrl ? (
                            <Image
                                src={book.imageUrl.replace("coversum", "cover500")}
                                alt={book.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#e8e8e5] flex items-center justify-center text-gray-500">
                                No Image
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </div>

                    <div className="space-y-2 text-left pt-2">
                        <div>
                            <h3 className="font-bold text-lg text-white leading-tight group-hover:text-accent transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-xs font-semibold tracking-wider text-[#63756b] uppercase mt-1">
                                {book.author}
                            </p>
                        </div>
                        {book.summary && (
                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed opacity-80">
                                {book.summary}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </>
    );
}
