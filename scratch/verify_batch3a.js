const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/batch3a_raw.json', 'utf8'));
const translated = JSON.parse(fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/fr_batch3_translated.json', 'utf8'));

const rawIds = raw.map(q => q.id);
const translatedIds = translated.map(q => q.id);

console.log('Raw count:', rawIds.length);
console.log('Translated count:', translatedIds.length);

const missingInTranslated = rawIds.filter(id => !translatedIds.includes(id));
const extraInTranslated = translatedIds.filter(id => !rawIds.includes(id));

console.log('Missing in Translated:', missingInTranslated);
console.log('Extra in Translated:', extraInTranslated);
