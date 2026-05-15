const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const pending = data.filter(m => m.ht && !m.fr);

console.log(`Total questions in master: ${data.length}`);
console.log(`Questions with HT: ${data.filter(m => m.ht).length}`);
console.log(`Questions with FR: ${data.filter(m => m.fr).length}`);
console.log(`Pending translations (HT but no FR): ${pending.length}`);

if (pending.length > 0) {
    console.log('\nSample pending IDs:');
    console.log(pending.slice(0, 10).map(p => p.newId));
    
    // Group by category
    const categories = {};
    pending.forEach(p => {
        const cat = p.ht.categoryId;
        categories[cat] = (categories[cat] || 0) + 1;
    });
    console.log('\nPending by Category:');
    console.log(categories);
}
