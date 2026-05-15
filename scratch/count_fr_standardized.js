const fs = require('fs');

function countQuestions() {
    const content = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
    // Simple count of objects in the array
    const matches = content.match(/{\s*id:\s*"/g);
    console.log(`Questions in FR_standardized: ${matches ? matches.length : 0}`);
}

countQuestions();
