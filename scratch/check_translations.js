const fs = require('fs');

const frContent = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
const htContent = fs.readFileSync('lib/duel/questionsHT_standardized.ts', 'utf8');

const frQuestions = frContent.match(/questionText:"(.*?)"/g);
const htQuestions = htContent.match(/questionText:"(.*?)"/g);

console.log('Total FR questions:', frQuestions ? frQuestions.length : 0);
console.log('Total HT questions:', htQuestions ? htQuestions.length : 0);

// Check if any FR question text is identical to HT question text (indicates missing translation)
// This is a rough check since some names might be identical, but if they match exactly, it's suspicious.
let untranslated = 0;
if (frQuestions && htQuestions && frQuestions.length === htQuestions.length) {
    for (let i = 0; i < frQuestions.length; i++) {
        if (frQuestions[i] === htQuestions[i]) {
            untranslated++;
            if (untranslated < 5) {
                console.log(`Untranslated at index ${i}: ${frQuestions[i]}`);
            }
        }
    }
}

console.log('Suspected untranslated (identical text):', untranslated);
