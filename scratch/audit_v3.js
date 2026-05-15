const fs = require('fs');

function readIdFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const buffer = fs.readFileSync(filePath);
    let content;
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString('utf16le');
    } else {
        content = buffer.toString('utf8');
    }
    return content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
}

const frIdsTxt = readIdFile('fr_ids.txt');
const htIdsTxt = readIdFile('ht_ids.txt');

const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const frStandardizedContent = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
// Extract question IDs (at the start of each object, usually starting with dq-)
const frStandardizedIds = [];
const idRegex = /{\s*id:\s*"(dq-[^"]+)"/g;
let match;
while ((match = idRegex.exec(frStandardizedContent)) !== null) {
    frStandardizedIds.push(match[1]);
}

const frStandardizedSet = new Set(frStandardizedIds);

console.log(`Total IDs in fr_ids.txt: ${frIdsTxt.length}`);
console.log(`Total IDs in ht_ids.txt: ${htIdsTxt.length}`);
console.log(`Total IDs in full_standardization.json: ${masterIds.size}`);
console.log(`Total IDs in questionsFR_standardized.ts: ${frStandardizedIds.length}`);

// 1. Questions in FR_standardized but NOT in Master
const frOnlyInStandardized = frStandardizedIds.filter(id => !masterIds.has(id));
console.log(`IDs in FR_standardized but missing in Master: ${frOnlyInStandardized.length}`);

// 2. Questions in fr_ids.txt but NOT in Master
const frOnlyInTxt = frIdsTxt.filter(id => !masterIds.has(id));
console.log(`IDs in fr_ids.txt but missing in Master: ${frOnlyInTxt.length}`);

// 3. Questions in fr_ids.txt but NOT in FR_standardized
const frTxtNotStandardized = frIdsTxt.filter(id => !frStandardizedSet.has(id));
console.log(`IDs in fr_ids.txt but missing in FR_standardized: ${frTxtNotStandardized.length}`);
console.log(`Sample missing IDs: ${frTxtNotStandardized.slice(0, 10).join(', ')}`);

// 5. Questions in Master that have FR but are NOT in FR_standardized
const frInMasterMissingInStandardized = master.filter(q => q.fr && !frStandardizedSet.has(q.newId || q.fr.id));
console.log(`Questions in Master with FR but missing in FR_standardized: ${frInMasterMissingInStandardized.length}`);

// 6. Questions in Master with FR but NO HT
const frOnlyInMasterMissingHT = master.filter(q => q.fr && !q.ht);
console.log(`Questions in Master with FR but NO HT: ${frOnlyInMasterMissingHT.length}`);

// Check ht_to_translate.json
if (fs.existsSync('scratch/ht_to_translate.json')) {
    const htToTranslate = JSON.parse(fs.readFileSync('scratch/ht_to_translate.json', 'utf8'));
    const htToTranslateIds = htToTranslate.map(q => q.id || q.newId);
    const missingFromMaster = htToTranslateIds.filter(id => !masterIds.has(id));
    console.log(`Items in ht_to_translate.json: ${htToTranslate.length}`);
    console.log(`Items in ht_to_translate.json NOT in Master: ${missingFromMaster.length}`);
}
