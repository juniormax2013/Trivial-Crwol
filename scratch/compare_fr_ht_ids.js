const fs = require('fs');

function readIdFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    let content;
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString('utf16le');
    } else {
        content = buffer.toString('utf8');
    }
    return content.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
}

const frIds = readIdFile('fr_ids.txt');
const htIds = readIdFile('ht_ids.txt');
const frSet = new Set(frIds);
const htSet = new Set(htIds);

const frOnly = frIds.filter(id => !htSet.has(id));
const htOnly = htIds.filter(id => !frSet.has(id));
const both = frIds.filter(id => htSet.has(id));

console.log(`IDs only in fr_ids.txt: ${frOnly.length}`);
console.log(`IDs only in ht_ids.txt: ${htOnly.length}`);
console.log(`IDs in both: ${both.length}`);

// Let's see if 291 appears here.
// Maybe the 291 are the ones that are in FR but NOT in master AND not in HT?
const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const frOnlyMissingInMaster = frOnly.filter(id => !masterIds.has(id));
console.log(`IDs only in FR and missing in Master: ${frOnlyMissingInMaster.length}`);
