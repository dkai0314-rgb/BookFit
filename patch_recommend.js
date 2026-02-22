const fs = require('fs');

function patchRecommend() {
    let code = fs.readFileSync('src/app/recommend/page.tsx', 'utf8');

    // Remove Aladin buy link block
    // It looks like: {book.link && ( ... )}
    const buyLinkPattern = /\{book\.link[^{}]+\{\s*<a href=\{book\.link\}[^>]+>\s*구매하기\s*<\/a>\s*\}\s*\)\}/g;

    // Actually, handling exact strings is safer.
    const startPattern = '{book.link && (';
    while (true) {
        let startIndex = code.indexOf(startPattern);
        if (startIndex === -1) break;
        let endIndex = code.indexOf(')}', startIndex);
        if (endIndex === -1) break;
        code = code.substring(0, startIndex) + code.substring(endIndex + 2);
    }

    // Add Coupang Widget just before the "다시 추천받기" section
    const footerMarker = 'className="text-center pt-10"';
    let footerIndex = code.indexOf(footerMarker);
    if (footerIndex !== -1) {
        // search backwards to find the `<div `
        let divIndex = code.lastIndexOf('<div ', footerIndex);
        if (divIndex !== -1) {
            const widgetUI = `
                            {/* Coupang Widget Section */}
                            <div className="w-full flex flex-col items-center bg-[#0B2A1F]/30 p-6 rounded-2xl border border-white/10 shadow-sm mt-8 mb-8">
                                <p className="text-gray-300 mb-4 font-medium text-center text-lg">💡 추천받은 책, 쿠팡에서 바로 찾아보세요!</p>
                                <div className="w-full overflow-hidden rounded-lg bg-white/80 p-1">
                                    <iframe src="https://coupa.ng/clGXS1" width="100%" height="44" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" browsingtopics="true"></iframe>
                                </div>
                                <p className="text-sm text-gray-500 mt-4 text-center">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
                            </div>
                            
                            `;
            code = code.substring(0, divIndex) + widgetUI + code.substring(divIndex);
        }
    }

    fs.writeFileSync('src/app/recommend/page.tsx', code, 'utf8');
    console.log('Patched recommend/page.tsx');
}

patchRecommend();
