const fs = require('fs');
const path = require('path');

const filesToPatch = [
    'src/app/bestsellers/page.tsx',
    'src/app/recommend/page.tsx',
    'src/app/result/page.tsx'
];

filesToPatch.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/browsingtopics="true"/g, '');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Patched browsingtopics in ${file}`);
    }
});

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let fontReplaced = 0;
['src/app', 'src/components'].forEach(dir => {
    walkDir(dir, function (filePath) {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            try {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content.replace(/\btext-xs\b/g, 'text-base').replace(/\btext-sm\b/g, 'text-base');
                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    fontReplaced++;
                }
            } catch (e) { }
        }
    });
});

console.log(`Replaced fonts in ${fontReplaced} files`);

