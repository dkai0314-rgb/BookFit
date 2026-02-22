
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'BookFit Curation';
    const booksParam = searchParams.get('books');

    let books = [];
    try {
        books = booksParam ? JSON.parse(decodeURIComponent(booksParam)) : [];
    } catch (e) {
        console.error("Failed to parse books param", e);
    }

    // Font loading (using Google Fonts)
    const fontData = await fetch(
        new URL('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&display=swap')
    ).then((res) => res.arrayBuffer());

    // We need to actually fetch the font file, not the CSS. 
    // For Edge runtime simplicity, let's use a standard fetch for a .ttf or .woff
    // But Google Fonts CSS URL returns CSS.
    // Let's use a reliable CDN for Noto Serif KR .otf or .ttf if possible, 
    // or just standard Noto Sans for now to ensure it works, then switch to Serif.

    const notoSerifKr = await fetch(
        'https://github.com/google/fonts/raw/main/ofl/notoserifkr/NotoSerifKR-Bold.otf'
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundImage: 'linear-gradient(to bottom right, #fdfbf7, #e8e6e1)',
                    padding: '40px 40px',
                    position: 'relative',
                }}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #d0d0d0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #d0d0d0 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                    opacity: 0.3,
                }} />

                {/* Logo */}
                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.8,
                }}>
                    <div style={{
                        fontSize: 24,
                        fontFamily: '"Noto Serif KR"',
                        color: '#061A14',
                        letterSpacing: '-1px',
                        fontWeight: 900,
                    }}>
                        BookFit
                    </div>
                </div>

                {/* Title Card */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 60,
                    textAlign: 'center',
                    maxWidth: '900px',
                }}>
                    <div style={{
                        fontSize: 20,
                        color: '#8c8c8c',
                        marginBottom: 10,
                        fontFamily: '"Noto Serif KR"',
                    }}>
                        ?¤ëŠ˜??ì±?ì²˜ë°©
                    </div>
                    <div style={{
                        fontSize: 64,
                        fontFamily: '"Noto Serif KR"',
                        color: '#1a1a1a',
                        lineHeight: 1.2,
                        letterSpacing: '-2px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}>
                        {title}
                    </div>
                </div>

                {/* Books Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: '40px',
                    width: '100%',
                    height: '500px',
                }}>
                    {books.map((book: any, i: number) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transform: i === 1 ? 'scale(1.1) translateY(-20px)' : 'scale(1)',
                            zIndex: i === 1 ? 10 : 1,
                            transition: 'all 0.5s',
                        }}>
                            {/* Shadow for depth */}
                            <div style={{
                                position: 'absolute',
                                width: '240px',
                                height: '350px',
                                background: 'black',
                                bottom: 10,
                                left: 20,
                                filter: 'blur(20px)',
                                opacity: 0.4,
                                transform: 'rotate(5deg)',
                                zIndex: -1,
                                borderRadius: 10,
                            }} />

                            {/* Book Cover */}
                            {book.imageUrl ? (
                                <img
                                    src={book.imageUrl.replace("coversum", "cover500")}
                                    width="260"
                                    height="380"
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        objectFit: 'cover',
                                        boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.1), inset -2px 0 5px rgba(255,255,255,0.3)', // Book spine effect
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: 260, height: 380, background: '#ddd', borderRadius: 8,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>No Image</div>
                            )}
                        </div>
                    ))}
                </div>

            </div>
        ),
        {
            width: 1080,
            height: 1080,
            fonts: [
                {
                    name: 'Noto Serif KR',
                    data: notoSerifKr,
                    style: 'normal',
                    weight: 400,
                },
            ],
        },
    );
}
