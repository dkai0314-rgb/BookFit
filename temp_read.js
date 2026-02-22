const fs = require('fs');
fs.readFile('src/app/result/page.tsx', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(Buffer.from(data).toString('base64'));
});
