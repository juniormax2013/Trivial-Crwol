const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

function formatQuestion(q) {
    if (!q) return null;
    // Remove temporary fields
    const { normalizedRef, normalizedCat, file, ...cleanQ } = q;
    return cleanQ;
}

const htQuestions = data.filter(m => m.ht).map(m => formatQuestion(m.ht));
const frQuestions = data.filter(m => m.fr).map(m => formatQuestion(m.fr));

function generateTS(name, questions) {
    let content = `import { DuelQuestion } from './models';\n\n`;
    content += `export const ${name}: DuelQuestion[] = [\n`;
    questions.forEach(q => {
        content += `  ${JSON.stringify(q)},\n`;
    });
    content += `];\n`;
    // Post-process to make it look like the original (prettier)
    return content.replace(/"id":/g, 'id:').replace(/"questionText":/g, 'questionText:')
                  .replace(/"categoryId":/g, 'categoryId:').replace(/"categoryName":/g, 'categoryName:')
                  .replace(/"difficulty":/g, 'difficulty:').replace(/"language":/g, 'language:')
                  .replace(/"options":/g, 'options:').replace(/"correctOptionId":/g, 'correctOptionId:')
                  .replace(/"explanation":/g, 'explanation:').replace(/"bibleReference":/g, 'bibleReference:')
                  .replace(/"text":/g, 'text:');
}

fs.writeFileSync('lib/duel/questionsHT_standardized.ts', generateTS('ALL_QUESTIONS_HT', htQuestions));
fs.writeFileSync('lib/duel/questionsFR_standardized.ts', generateTS('ALL_QUESTIONS_FR', frQuestions));

console.log('Final TS files generated.');
