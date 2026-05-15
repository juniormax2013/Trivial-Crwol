const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('scratch/final_aligned_with_ids.json', 'utf8'));

function flatten(lang) {
    return data.map(item => {
        const langData = item[lang];
        return {
            id: item.id,
            questionText: langData.questionText,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            difficulty: item.difficulty,
            language: lang,
            options: langData.options,
            correctOptionId: langData.correctOptionId,
            explanation: langData.explanation,
            bibleReference: item.bibleReference
        };
    });
}

function generateTS(name, questions) {
    let content = `import { DuelQuestion } from './models';\n\n`;
    content += `export const ${name}: DuelQuestion[] = [\n`;
    questions.forEach(q => {
        content += `  ${JSON.stringify(q)},\n`;
    });
    content += `];\n`;
    return content.replace(/"id":/g, 'id:').replace(/"questionText":/g, 'questionText:')
                  .replace(/"categoryId":/g, 'categoryId:').replace(/"categoryName":/g, 'categoryName:')
                  .replace(/"difficulty":/g, 'difficulty:').replace(/"language":/g, 'language:')
                  .replace(/"options":/g, 'options:').replace(/"correctOptionId":/g, 'correctOptionId:')
                  .replace(/"explanation":/g, 'explanation:').replace(/"bibleReference":/g, 'bibleReference:')
                  .replace(/"text":/g, 'text:');
}

const htQuestions = flatten('ht');
const frQuestions = flatten('fr');

fs.writeFileSync('lib/duel/questionsHT_standardized.ts', generateTS('ALL_QUESTIONS_HT', htQuestions));
fs.writeFileSync('lib/duel/questionsFR_standardized.ts', generateTS('ALL_QUESTIONS_FR', frQuestions));

console.log(`Generated ${htQuestions.length} HT questions and ${frQuestions.length} FR questions.`);
