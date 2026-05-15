const fs = require('fs');

function getIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /id:"(dq-[a-z0-9-]+-[0-9]+)"/g;
    const ids = [];
    let m;
    while ((m = regex.exec(content)) !== null) {
        ids.push(m[1]);
    }
    return ids;
}

const htIds = getIds('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsHT_standardized.ts');
const frIds = getIds('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsFR_standardized.ts');

console.log('HT Count:', htIds.length);
console.log('FR Count:', frIds.length);
console.log('HT First 5:', htIds.slice(0, 5));
console.log('FR First 5:', frIds.slice(0, 5));

const onlyInHt = htIds.filter(id => !frIds.includes(id));
const onlyInFr = frIds.filter(id => !htIds.includes(id));

console.log('Only in HT:', onlyInHt.length);
console.log('Only in FR:', onlyInFr.length);

if (onlyInFr.length > 0) {
    console.log('First 5 only in FR:', onlyInFr.slice(0, 5));
}
