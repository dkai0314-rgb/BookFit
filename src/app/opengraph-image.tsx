import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'BookFit - 지금 당신에게 필요한 딱 한 권';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    // Read local Korean fonts using fetch for Edge compatibility
    const fontDataMedium = await fetch(
        new URL('./fonts/NotoSansKR-Medium.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const fontDataBold = await fetch(
        new URL('./fonts/NotoSansKR-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '2px solid rgba(191, 149, 63, 0.2)',
                    borderRadius: '40px',
                    padding: '60px',
                    width: '100%',
                    height: '100%',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                }}>
                    {/* Logo Image */}
                    <img src="https://bookfit.kr/logo-square.png" width="120" height="120" style={{ marginBottom: '40px', borderRadius: '24px', border: '1px solid rgba(191, 149, 63, 0.3)' }} />

                    {/* Sub Copy */}
                    <div style={{
                        display: 'flex',
                        fontSize: 36,
                        color: '#BF953F',
                        marginBottom: '20px',
                        fontWeight: 700,
                        fontFamily: '"NotoSansKRMedium"',
                        letterSpacing: '0.05em'
                    }}>
                        취향 추천 · 마음 추천
                    </div>

                    {/* Main Copy */}
                    <div style={{
                        display: 'flex',
                        fontSize: 72,
                        fontWeight: 700,
                        textAlign: 'center',
                        lineHeight: 1.2,
                        fontFamily: '"NotoSansKRBold"',
                        color: '#ffffff',
                    }}>
                        지금 당신에게 필요한 딱 한 권
                    </div>
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
