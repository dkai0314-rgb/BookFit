const fs = require('fs');

function patchResult() {
    let code = fs.readFileSync('src/app/result/page.tsx', 'utf8');

    // Remove Aladin 3D viewer button
    let startIndex = code.indexOf('{book.viewerUrl && (');
    if (startIndex !== -1) {
        let endIndex = code.indexOf(')}', startIndex);
        if (endIndex !== -1) {
            code = code.substring(0, startIndex) + code.substring(endIndex + 2);
        }
    }

    // Add Coupang Widget
    const footerIndex = code.indexOf('{/* Footer Actions */}');
    if (footerIndex !== -1) {
        const widgetUI = `
                {/* Coupang Widget Section */}
                <div className="w-full flex flex-col items-center bg-secondary/5 p-6 rounded-2xl border border-secondary/10 shadow-sm mt-8 mb-8">
                    <p className="text-foreground/80 mb-4 font-medium text-center text-lg">💡 추천받은 책, 쿠팡에서 바로 찾아보세요!</p>
                    <div className="w-full overflow-hidden rounded-lg bg-white/80 p-1">
                        <iframe src="https://coupa.ng/clGXS1" width="100%" height="44" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" browsingtopics="true"></iframe>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</p>
                </div>

                {/* Footer Actions */}`;
        code = code.replace('{/* Footer Actions */}', widgetUI);
    }

    fs.writeFileSync('src/app/result/page.tsx', code, 'utf8');
    console.log('Patched result/page.tsx');
}

patchResult();

if (fs.existsSync('src/app/recommend/page.tsx')) {
    const code = fs.readFileSync('src/app/recommend/page.tsx', 'utf8');
    const b64 = Buffer.from(code).toString('base64');
    console.log("BASE64_START");
    for (let i = 0; i < b64.length; i += 1000) {
        console.log(b64.substring(i, i + 1000));
    }
    console.log("BASE64_END");
}
