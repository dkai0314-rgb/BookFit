import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'BookFit - 지금 당신에게 필요한 딱 한 권';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

// Edge-compatible array buffer to base64 converter
function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export default async function Image() {
    // Read local Korean fonts using fetch for Edge compatibility
    const fontDataMediumPromise = fetch(
        new URL('./fonts/NotoSansKR-Medium.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const fontDataBoldPromise = fetch(
        new URL('./fonts/NotoSansKR-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const [fontDataMedium, fontDataBold] = await Promise.all([
        fontDataMediumPromise,
        fontDataBoldPromise
    ]);

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #050d0a, #061A14)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"NotoSansKRBold"',
                    color: 'white',
                    padding: '60px',
                }}
            >
                {/* Logo Image Removed for simplicity */}

                {/* Brand Name */}
                <div style={{
                    display: 'flex',
                    fontSize: 96,
                    color: '#1E8E5A',
                    marginBottom: '20px',
                    fontWeight: 700,
                    fontFamily: '"NotoSansKRBold"',
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                    BookFit
                </div>

                {/* Main Copy */}
                <div style={{
                    display: 'flex',
                    fontSize: 64,
                    fontWeight: 700,
                    textAlign: 'center',
                    lineHeight: 1.3,
                    fontFamily: '"NotoSansKRBold"',
                    color: '#F5F7F6',
                }}>
                    지금 당신에게 필요한 딱 한 권
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'NotoSansKRBold',
                    data: fontDataBold,
                    style: 'normal',
                    weight: 700,
                },
                {
                    name: 'NotoSansKRMedium',
                    data: fontDataMedium,
                    style: 'normal',
                    weight: 500,
                },
            ],
        }
    );
}
