const fs = require('fs');
let c = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
c = c.replace(/categoryId:"profetas-mayores"/g, 'categoryId:"profetas-may"');
c = c.replace(/categoryId:"profetas-menores"/g, 'categoryId:"profetas-men"');
c = c.replace(/categoryId:"cartas-generales"/g, 'categoryId:"cartas-gen"');
fs.writeFileSync('lib/duel/questionsFR_standardized.ts', c);
console.log('Successfully standardized category IDs in questionsFR_standardized.ts');
