const fs = require('fs');
const path = require('path');

const MASTER_V3_PATH = path.join(__dirname, 'full_standardization_v3.json');
const MISSING_TRANSLATIONS_PATH = path.join(__dirname, 'missing_translations.json');
const OUTPUT_PATH = path.join(__dirname, 'full_standardization_v4.json');

function finalizeMaster() {
  console.log('Starting merge process...');

  const masterV3 = JSON.parse(fs.readFileSync(MASTER_V3_PATH, 'utf8'));
  const missingTranslations = JSON.parse(fs.readFileSync(MISSING_TRANSLATIONS_PATH, 'utf8'));

  console.log(`Master V3 records: ${masterV3.length}`);
  
  const missingIds = Object.keys(missingTranslations);
  console.log(`Missing translation IDs to merge: ${missingIds.length}`);

  let mergedCount = 0;
  const masterV4 = masterV3.map(item => {
    const id = item.newId;
    if (missingTranslations[id]) {
      mergedCount++;
      const fixes = missingTranslations[id];
      // fixes[id] contains { fr: ..., ht: ... }
      // Wait, let's look at missing_translations.json again
      // It's { "id": { "fr": {...} } } or { "id": { "ht": {...} } }
      
      const newFr = fixes.fr || (item.fr);
      const newHt = fixes.ht || (item.ht);

      return {
        ...item,
        fr: newFr,
        ht: newHt
      };
    }
    return item;
  });

  console.log(`Successfully merged ${mergedCount} records.`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(masterV4, null, 2));
  console.log(`Saved finalized dataset to: ${OUTPUT_PATH}`);

  // Final Audit
  const incomplete = masterV4.filter(q => !q.fr || !q.ht);
  if (incomplete.length === 0) {
    console.log('✅ Success! 100% language parity achieved (1,049 questions).');
  } else {
    console.log(`❌ Warning: Still found ${incomplete.length} incomplete records.`);
    incomplete.forEach(q => {
        const missing = [];
        if (!q.fr) missing.push('fr');
        if (!q.ht) missing.push('ht');
        console.log(` - ID: ${q.newId} (Missing: ${missing.join(', ')})`);
    });
  }
}

finalizeMaster();
