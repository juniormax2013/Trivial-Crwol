const fs = require('fs');

const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));

const htOnly = data.filter(q => q.ht && !q.fr);
const frOnly = data.filter(q => !q.ht && q.fr);

console.log(`HT Only: ${htOnly.length}`);
console.log(`FR Only: ${frOnly.length}`);

const potentialMatches = [];

for (const htQ of htOnly) {
    for (const frQ of frOnly) {
        // Match by normalized reference (if exists and not null)
        if (htQ.ht.normalizedRef && frQ.fr.normalizedRef && htQ.ht.normalizedRef === frQ.fr.normalizedRef) {
            // Also check if they are in the same category
            if (htQ.ht.normalizedCat === frQ.fr.normalizedCat) {
                potentialMatches.push({
                    htId: htQ.newId,
                    frId: frQ.newId,
                    ref: htQ.ht.normalizedRef,
                    htText: htQ.ht.questionText,
                    frText: frQ.fr.questionText
                });
            }
        }
    }
}

console.log(`\nPotential matches by Ref + Category: ${potentialMatches.length}`);

if (potentialMatches.length > 0) {
    console.log('\nSample Potential Matches:');
    potentialMatches.slice(0, 5).forEach(m => {
        console.log(`HT: [${m.htId}] ${m.htText}`);
        console.log(`FR: [${m.frId}] ${m.frText}`);
        console.log(`Ref: ${m.ref}`);
        console.log('---');
    });
}
