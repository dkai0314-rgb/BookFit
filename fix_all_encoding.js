const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let fixedCount = 0;

walkDir('src', function (filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.css')) {
        try {
            const buffer = fs.readFileSync(filePath);
            const asUtf8String = buffer.toString('utf8');

            if (asUtf8String.includes('\uFFFD')) {
                console.log('Fixing file:', filePath);
                const asEucKr = new TextDecoder('euc-kr').decode(buffer);
                fs.writeFileSync(filePath, Buffer.from(asEucKr, 'utf8'));
                fixedCount++;
            }
        } catch (e) {
            console.error('Error on', filePath, e);
        }
    }
});

console.log('Fixed files total:', fixedCount);
