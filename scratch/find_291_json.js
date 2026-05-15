const fs = require('fs');
const files = fs.readdirSync('scratch').filter(f => f.endsWith('.json'));
files.forEach(f => {
    try {
        const data = JSON.parse(fs.readFileSync('scratch/' + f, 'utf8'));
        if (Array.isArray(data)) {
            console.log(`${f}: ${data.length}`);
            if (data.length === 291) {
                console.log(`>>> FOUND 291 in ${f}`);
            }
        }
    } catch(e) {}
});
