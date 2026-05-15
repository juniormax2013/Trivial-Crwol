const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const sourceFile = path.join('scratch', 'ht_to_translate.json');

const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const idToCheck = 'dq-esp-001';
const masterItem = fullData.find(q => q.newId === idToCheck);
const sourceStr = sourceData.find(s => s.includes(idToCheck));

console.log('--- MASTER ITEM HT ---');
console.log(JSON.stringify(masterItem ? masterItem.ht : null, null, 2));

console.log('\n--- SOURCE FILE STRING ---');
console.log(sourceStr);
