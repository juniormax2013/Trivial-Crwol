const fs = require('fs');
const fr = JSON.parse(fs.readFileSync('scratch/fr_questions.json', 'utf8'));
const aligned = JSON.parse(fs.readFileSync('scratch/aligned_full.json', 'utf8'));

const matchedFrQuestions = new Set();
aligned.forEach(a => {
    if (a.fr) {
        matchedFrQuestions.add(a.fr.questionText);
    }
});

const unmatchedFr = fr.filter(f => !matchedFrQuestions.has(f.questionText));

console.log('Total FR questions:', fr.length);
console.log('Matched FR questions:', matchedFrQuestions.size);
console.log('Unmatched FR questions:', unmatchedFr.length);

if (unmatchedFr.length > 0) {
    console.log('\nFirst 5 unmatched FR questions:');
    unmatchedFr.slice(0, 5).forEach(f => {
        console.log(`- [${f.id}] [${f.bibleReference}] ${f.questionText.substring(0, 50)}...`);
    });
}
