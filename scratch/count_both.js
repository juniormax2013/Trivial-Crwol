const fs = require('fs');

function countInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/{\s*id:\s*"(dq-[^"]+)"/g);
    return matches ? matches.length : 0;
}

console.log(`FR: ${countInFile('lib/duel/questionsFR_standardized.ts')}`);
console.log(`HT: ${countInFile('lib/duel/questionsHT_standardized.ts')}`);
