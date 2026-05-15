const fs = require('fs');
const aligned = JSON.parse(fs.readFileSync('scratch/final_aligned_with_ids.json', 'utf8'));
const missing = aligned.filter(q => !q.fr);

// Batch 1 (of missing)
const batch1 = missing.slice(0, 127);

// I will now provide the translated array for batch1
const translations1 = [
  // I will fill this in the next step
];
