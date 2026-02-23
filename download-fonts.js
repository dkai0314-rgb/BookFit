const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'src', 'app', 'fonts');

if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
}

function fetchCSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    console.log('Fetching Google Fonts CSS...');
    const css = await fetchCSS('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700&display=swap');

    // Parse CSS for the URLs of the TTF files
    const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)];

    if (urls.length >= 2) {
        const mediumUrlMatch = urls[urls.length - 2][1];
        const boldUrlMatch = urls[urls.length - 1][1];

        console.log(`Downloading Medium from ${mediumUrlMatch}`);
        await downloadFile(mediumUrlMatch, path.join(FONTS_DIR, 'NotoSansKR-Medium.ttf'));
        console.log(`Downloading Bold from ${boldUrlMatch}`);
        await downloadFile(boldUrlMatch, path.join(FONTS_DIR, 'NotoSansKR-Bold.ttf'));
        console.log('Done!');
    } else {
        console.error('Could not find font URLs in CSS:', css.substring(0, 200));
    }
}

run();
