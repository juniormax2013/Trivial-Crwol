const fs = require('fs');

function parseQuestions(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Basic regex to extract IDs and the whole object string
    const regex = /\{[\s\n]*id:[\s\n]*"([^"]+)"[\s\S]*?\n\s*\}/g;
    const questions = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        questions.push({ id: match[1], full: match[0] });
    }
    return questions;
}

const frQuestions = parseQuestions('lib/duel/questionsFR_standardized.ts');
const htQuestions = parseQuestions('lib/duel/questionsHT_standardized.ts');

const frIds = new Set(frQuestions.map(q => q.id));
const missingInFr = htQuestions.filter(q => !frIds.has(q.id));

console.log(JSON.stringify(missingInFr.map(q => q.full), null, 2));
