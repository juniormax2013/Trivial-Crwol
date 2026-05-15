const fs = require('fs');
const content = fs.readFileSync('lib/duel/questionsES.ts', 'utf8');
const regex = /categoryId:"([^"]+)"/g;
const ids = new Set();
let match;
while ((match = regex.exec(content)) !== null) {
  ids.add(match[1]);
}
console.log(Array.from(ids).sort());
