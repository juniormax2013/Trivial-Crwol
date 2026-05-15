
const fs = require('fs');
const content = fs.readFileSync('lib/duel/questionsHT_standardized.ts', 'utf8');
const ids = Array.from(new Set(content.match(/categoryId:"([^"]+)"/g).map(m => m.match(/"([^"]+)"/)[1]))).sort();
console.log(ids);
