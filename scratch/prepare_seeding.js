const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'full_standardization_v4.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const flattened = [];

data.forEach(q => {
    // Add HT version
    if (q.ht) {
        flattened.push({
            docId: `${q.newId}_ht`,
            data: {
                ...q.ht,
                id: q.newId, // Ensure it uses the newId
                language: 'ht'
            }
        });
    }
    // Add FR version
    if (q.fr) {
        flattened.push({
            docId: `${q.newId}_fr`,
            data: {
                ...q.fr,
                id: q.newId, // Ensure it uses the newId
                language: 'fr'
            }
        });
    }
});

console.log(`Total documents to seed: ${flattened.length}`);

// Split into chunks of 100 for easier processing via MCP
const CHUNK_SIZE = 100;
for (let i = 0; i < flattened.length; i += CHUNK_SIZE) {
    const chunk = flattened.slice(i, i + CHUNK_SIZE);
    fs.writeFileSync(path.join(__dirname, `seed_chunk_${i / CHUNK_SIZE}.json`), JSON.stringify(chunk, null, 2));
}

console.log(`Created ${Math.ceil(flattened.length / CHUNK_SIZE)} chunks.`);
