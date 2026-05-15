const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const htToTranslatePath = path.join(__dirname, 'ht_to_translate.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const htToTranslateRaw = JSON.parse(fs.readFileSync(htToTranslatePath, 'utf8'));

// ht_to_translate.json seems to be an array of strings that look like JS objects
const htToTranslate = htToTranslateRaw.map(str => {
    try {
        // Clean up the string to be parseable JSON or just extract ID with regex
        const idMatch = str.match(/id:"([^"]+)"/);
        return { id: idMatch ? idMatch[1] : null, raw: str };
    } catch (e) {
        return { id: null, raw: str };
    }
});

const masterIds = new Set(master.map(q => q.newId));
const htToTranslateIds = htToTranslate.map(q => q.id).filter(id => id !== null);

console.log(`Total items in ht_to_translate.json: ${htToTranslate.length}`);
console.log(`Total unique IDs in ht_to_translate.json: ${new Set(htToTranslateIds).size}`);

const missingInMaster = htToTranslateIds.filter(id => !masterIds.has(id));
console.log(`IDs in ht_to_translate.json NOT in Master: ${missingInMaster.length}`);
if (missingInMaster.length > 0) {
    console.log(`Sample missing IDs: ${missingInMaster.slice(0, 10).join(', ')}`);
}

const presentInMaster = htToTranslateIds.filter(id => masterIds.has(id));
console.log(`IDs in ht_to_translate.json ALREADY in Master: ${presentInMaster.length}`);

const masterMap = new Map(master.map(q => [q.newId, q]));
const missingHtInMaster = presentInMaster.filter(id => {
    const q = masterMap.get(id);
    return !q.ht || !q.ht.questionText;
});
console.log(`IDs in ht_to_translate.json that are MISSING HT in Master: ${missingHtInMaster.length}`);

const matchFrOnly = htToTranslateIds.filter(id => frIdsSet.has(id));
console.log(`IDs in ht_to_translate.json that are in questionsFR_standardized.ts: ${matchFrOnly.length}`);
