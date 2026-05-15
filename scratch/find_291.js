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

const htIdsTxt = readIdFile('ht_ids.txt');
const htSet = new Set(htIdsTxt);

const frStandardizedContent = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
const frStandardizedIds = [];
const idRegex = /{\s*id:\s*"(dq-[^"]+)"/g;
let match;
while ((match = idRegex.exec(frStandardizedContent)) !== null) {
    frStandardizedIds.push(match[1]);
}

const frOnlyNotInHtTxt = frStandardizedIds.filter(id => !htSet.has(id));
console.log(`Questions in FR_standardized but NOT in ht_ids.txt: ${frOnlyNotInHtTxt.length}`);

// What about questions in Master that have FR but not in ht_ids.txt?
const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const masterFrOnlyNotInHtTxt = master.filter(q => q.fr && !htSet.has(q.newId || q.fr.id));
console.log(`Questions in Master with FR but NOT in ht_ids.txt: ${masterFrOnlyNotInHtTxt.length}`);
