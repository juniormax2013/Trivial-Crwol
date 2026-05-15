const fs = require('fs');

const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const frStandardizedContent = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
const frStandardizedIds = new Set();
const idRegex = /{\s*id:\s*"(dq-[^"]+)"/g;
let match;
while ((match = idRegex.exec(frStandardizedContent)) !== null) {
    frStandardizedIds.add(match[1]);
}

console.log(`Master total: ${master.length}`);
console.log(`Standardized FR total: ${frStandardizedIds.size}`);

const inMasterOnlyFR = master.filter(q => q.fr && !q.ht);
const inMasterOnlyHT = master.filter(q => q.ht && !q.fr);
const inMasterBoth = master.filter(q => q.fr && q.ht);

console.log(`Master Only FR: ${inMasterOnlyFR.length}`);
console.log(`Master Only HT: ${inMasterOnlyHT.length}`);
console.log(`Master Both: ${inMasterBoth.length}`);

const inMasterMissingFromStandardized = master.filter(q => !frStandardizedIds.has(q.newId || q.fr?.id));
console.log(`Master items missing from Standardized FR: ${inMasterMissingFromStandardized.length}`);

const inMasterMissingFromStandardizedWithFR = inMasterMissingFromStandardized.filter(q => q.fr);
console.log(`Master items missing from Standardized FR (but have FR): ${inMasterMissingFromStandardizedWithFR.length}`);

const inMasterMissingFromStandardizedWithHT = inMasterMissingFromStandardized.filter(q => q.ht);
console.log(`Master items missing from Standardized FR (but have HT): ${inMasterMissingFromStandardizedWithHT.length}`);
