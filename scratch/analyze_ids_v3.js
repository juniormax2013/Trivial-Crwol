const fs = require('fs');
const path = require('path');

function readIdFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    let content;
    // Check for BOM or try to detect encoding
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString('utf16le');
    } else {
        content = buffer.toString('utf8');
    }
    return content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
}

const frIds = readIdFile('fr_ids.txt');
const htIds = readIdFile('ht_ids.txt');
const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const masterIds = new Set(master.map(q => q.newId));
const masterHtIds = new Set(master.filter(q => q.ht).map(q => q.newId));
const masterFrIds = new Set(master.filter(q => q.fr).map(q => q.newId));

console.log(`Total IDs in fr_ids.txt: ${frIds.length}`);
console.log(`Total IDs in ht_ids.txt: ${htIds.length}`);
console.log(`Total questions in master: ${master.length}`);

const frMissingInMaster = frIds.filter(id => !masterIds.has(id));
const htMissingInMaster = htIds.filter(id => !masterIds.has(id));

console.log(`\nIDs from fr_ids.txt missing in master: ${frMissingInMaster.length}`);
console.log(`IDs from ht_ids.txt missing in master: ${htMissingInMaster.length}`);

// Check for questions in master that have FR but not HT
const frOnlyInMaster = master.filter(q => q.fr && !q.ht);
console.log(`\nQuestions in master with only FR (needs HT): ${frOnlyInMaster.length}`);

// Check ht_to_translate.json
const htToTranslate = JSON.parse(fs.readFileSync('scratch/ht_to_translate.json', 'utf8'));
const htToTranslateIds = new Set(htToTranslate.map(q => q.id));

console.log(`\nQuestions in ht_to_translate.json: ${htToTranslate.length}`);

// How many of the FR-only in master are in ht_to_translate?
const frOnlyCoveredByPending = frOnlyInMaster.filter(q => htToTranslateIds.has(q.newId));
console.log(`FR-only in master covered by ht_to_translate: ${frOnlyCoveredByPending.length}`);

const frOnlyStillMissingHT = frOnlyInMaster.filter(q => !htToTranslateIds.has(q.newId));
console.log(`FR-only in master STILL missing HT (needs new batch): ${frOnlyStillMissingHT.length}`);

// What about the 291?
// Let's see if we can find where those 291 come from.
// Maybe 408 (missing in master) - 129 (ht_to_translate) = 279?
// User said 291. 
