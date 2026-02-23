import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'BookFit - 지금 당신에게 필요한 딱 한 권';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    // Fetch a reliable Korean font for OG Image generation (Pretendard Bold)
    const fontUrl = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/packages/pretendard/dist/public/static/Pretendard-Bold.ttf';
    const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

    const fontUrlMedium = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/packages/pretendard/dist/public/static/Pretendard-Medium.ttf';
    const fontDataMedium = await fetch(fontUrlMedium).then((res) => res.arrayBuffer());

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
                    fontFamily: '"Pretendard"',
                    color: 'white',
                    padding: '80px',
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
                    padding: '60px 80px',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                }}>
                    {/* Logo / Brand Name */}
                    <div style={{
                        display: 'flex',
                        color: '#BF953F',
                        fontSize: 48,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '30px',
                        fontFamily: '"PretendardBold"'
                    }}>
                        BookFit
                    </div>

                    {/* Main Copy */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        fontSize: 68,
                        fontWeight: 700,
                        textAlign: 'center',
                        lineHeight: 1.3,
                        fontFamily: '"PretendardBold"',
                        color: '#ffffff'
                    }}>
                        <div>지금 당신에게 필요한</div>
                        <div style={{ color: '#FCF6BA' }}>딱 한 권</div>
                    </div>

                    <div style={{
                        display: 'flex',
                        fontSize: 32,
                        color: '#A0AEC0',
                        marginTop: '40px',
                        fontWeight: 500,
                        fontFamily: '"PretendardMedium"'
                    }}>
                        북핏 큐레이터가 엄선한 베스트셀러 추천
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'PretendardBold',
                    data: fontData,
                    style: 'normal',
                    weight: 700,
                },
                {
                    name: 'PretendardMedium',
                    data: fontDataMedium,
                    style: 'normal',
                    weight: 500,
                },
            ],
        }
    );
}
