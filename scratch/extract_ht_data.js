const fs = require('fs');
const path = require('path');

const filePath = path.join('scratch', 'ht_to_translate.json');
const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const questions = [];

rawData.forEach(str => {
    // Remove trailing comma if present
    let cleanStr = str.trim();
    if (cleanStr.endsWith(',')) {
        cleanStr = cleanStr.slice(0, -1);
    }
    
    // It's not valid JSON (keys are not quoted). 
    // We can try to use eval() safely or use a regex to fix it.
    // Since it's a controlled environment, we can use a small parser or regex.
    try {
        // Try to fix it to valid JSON: quote keys
        // id: -> "id":
        const jsonStr = cleanStr.replace(/(\w+):/g, '"$1":');
        const obj = JSON.parse(jsonStr);
        questions.push(obj);
    } catch (e) {
        // Fallback: regex for id
        const idMatch = cleanStr.match(/id:"([^"]+)"/);
        if (idMatch) {
            // If we can't parse everything, at least get the ID to see if it matches
            questions.push({ id: idMatch[1], raw: cleanStr });
        }
    }
});

console.log(`Extracted ${questions.length} questions from ht_to_translate.json`);
fs.writeFileSync('scratch/ht_extracted_from_strings.json', JSON.stringify(questions, null, 2));

// Compare with remaining_fr_only.json
const remainingFr = JSON.parse(fs.readFileSync('scratch/remaining_fr_only.json', 'utf8'));
const remainingIds = new Set(remainingFr.map(q => q.newId));

const matches = questions.filter(q => remainingIds.has(q.id));
console.log(`Found ${matches.length} matches for the 98 missing questions!`);

if (matches.length > 0) {
    console.log('Sample match:', matches[0].id);
}
