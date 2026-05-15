const fs = require('fs');

function countQuestions(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /\{[\s\n]*id:[\s\n]*"([^"]+)"/g;
    let count = 0;
    while (regex.exec(content) !== null) {
        count++;
    }
    return count;
}

console.log('FR Questions:', countQuestions('lib/duel/questionsFR_standardized.ts'));
console.log('HT Questions:', countQuestions('lib/duel/questionsHT_standardized.ts'));
