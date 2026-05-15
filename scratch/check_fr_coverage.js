
import { ALL_QUESTIONS_FR } from './lib/duel/questionsFR_standardized';
import { DUEL_CATEGORIES } from './lib/duel/seed';

const stats = {};
DUEL_CATEGORIES.forEach(cat => {
    stats[cat.id] = { easy: 0, medium: 0, hard: 0, total: 0 };
});

ALL_QUESTIONS_FR.forEach(q => {
    if (stats[q.categoryId]) {
        stats[q.categoryId][q.difficulty]++;
        stats[q.categoryId].total++;
    } else {
        if (!stats['unknown']) stats['unknown'] = 0;
        stats['unknown']++;
    }
});

console.log('--- French Question Distribution ---');
console.log('Category'.padEnd(20) + ' | Total | Easy | Medium | Hard');
console.log('-'.repeat(55));

Object.keys(stats).filter(id => id !== 'unknown').forEach(id => {
    const s = stats[id];
    const cat = DUEL_CATEGORIES.find(c => c.id === id);
    console.log(`${id.padEnd(20)} | ${s.total.toString().padStart(5)} | ${s.easy.toString().padStart(4)} | ${s.medium.toString().padStart(6)} | ${s.hard.toString().padStart(4)}`);
});

if (stats['unknown']) {
    console.log(`\nUnknown categories found: ${stats['unknown']}`);
}

const emptyCats = Object.keys(stats).filter(id => id !== 'unknown' && stats[id].total === 0);
if (emptyCats.length > 0) {
    console.log('\n--- CRITICAL: Categories with ZERO French questions ---');
    emptyCats.forEach(id => console.log(`- ${id}`));
} else {
    console.log('\nAll categories have at least one French question.');
}
