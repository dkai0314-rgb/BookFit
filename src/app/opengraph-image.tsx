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

    // Read the local logo-square.png image directly from the app folder and encode as Base64.
    // This ensures Vercel's Edge runtime correctly bundles and resolves the file, unlike the public folder.
    const logoDataPromise = fetch(
        new URL('./logo-square.png', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const [fontDataMedium, fontDataBold, logoDataBuffer] = await Promise.all([
        fontDataMediumPromise,
        fontDataBoldPromise,
        logoDataPromise
    ]);

    const logoBase64 = `data:image/png;base64,${arrayBufferToBase64(logoDataBuffer)}`;

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
                {/* Logo Image */}
                <img src={logoBase64} width="160" height="160" style={{ marginBottom: '50px', borderRadius: '32px', border: '2px solid rgba(191, 149, 63, 0.4)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} />

                {/* Sub Copy */}
                <div style={{
                    display: 'flex',
                    fontSize: 48,
                    color: '#BF953F',
                    marginBottom: '30px',
                    fontWeight: 700,
                    fontFamily: '"NotoSansKRMedium"',
                    letterSpacing: '0.05em'
                }}>
                    취향 추천 · 마음 추천
                </div>

                {/* Main Copy */}
                <div style={{
                    display: 'flex',
                    fontSize: 76,
                    fontWeight: 700,
                    textAlign: 'center',
                    lineHeight: 1.2,
                    fontFamily: '"NotoSansKRBold"',
                    color: '#ffffff',
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
