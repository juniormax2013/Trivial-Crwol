const fs = require('fs');

function countQuestions(filePath, exportName) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const match = content.match(new RegExp(`export const ${exportName}.*?= \\[([\\s\\S]*?)\\];`, 'm'));
        if (!match) return 0;
        const items = match[1].split('},').length;
        return items;
    } catch (e) {
        console.error('Error reading ' + filePath, e);
        return 0;
    }
}

console.log('HT Standardized:', countQuestions('lib/duel/questionsHT_standardized.ts', 'ALL_QUESTIONS_HT'));
console.log('FR Standardized:', countQuestions('lib/duel/questionsFR_standardized.ts', 'ALL_QUESTIONS_FR'));
console.log('ES Current:', countQuestions('lib/duel/questionsES.ts', 'ALL_QUESTIONS_ES'));
