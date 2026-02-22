const fs = require('fs');

try {
    const buffer = fs.readFileSync('src/app/survey/page.tsx');

    // Check if it is invalid UTF-8
    const asUtf8String = buffer.toString('utf8');
    const hasReplacementChar = asUtf8String.includes('');

    if (hasReplacementChar) {
        console.log('File has invalid UTF-8 (replacement char found), trying EUC-KR decode...');
        const asEucKr = new TextDecoder('euc-kr').decode(buffer);
        console.log('Sample decoded EUC-KR:', asEucKr.substring(0, 100));

        fs.writeFileSync('src/app/survey/page.tsx', Buffer.from(asEucKr, 'utf8'));
        console.log('Successfully written as UTF-8');
    } else {
        console.log('File seems to be valid UTF-8 already');
    }

} catch (e) {
    console.error(e);
}
