const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'full_standardization_v4.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function toFirestoreValue(val) {
    if (typeof val === 'string') return { stringValue: val };
    if (typeof val === 'number') return { doubleValue: val };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (Array.isArray(val)) {
        return { arrayValue: { values: val.map(toFirestoreValue) } };
    }
    if (typeof val === 'object' && val !== null) {
        const fields = {};
        for (const k in val) {
            fields[k] = toFirestoreValue(val[k]);
        }
        return { mapValue: { fields } };
    }
    return { nullValue: null };
}

const transformed = [];

data.forEach(q => {
    // HT version
    if (q.ht) {
        const docData = { ...q.ht, id: q.newId, language: 'ht' };
        transformed.push({
            docId: `${q.newId}_ht`,
            document: { fields: {} }
        });
        const currentDoc = transformed[transformed.length - 1];
        for (const k in docData) {
            currentDoc.document.fields[k] = toFirestoreValue(docData[k]);
        }
    }
    // FR version
    if (q.fr) {
        const docData = { ...q.fr, id: q.newId, language: 'fr' };
        transformed.push({
            docId: `${q.newId}_fr`,
            document: { fields: {} }
        });
        const currentDoc = transformed[transformed.length - 1];
        for (const k in docData) {
            currentDoc.document.fields[k] = toFirestoreValue(docData[k]);
        }
    }
});

console.log(`Total transformed documents: ${transformed.length}`);

const CHUNK_SIZE = 100;
for (let i = 0; i < transformed.length; i += CHUNK_SIZE) {
    const chunk = transformed.slice(i, i + CHUNK_SIZE);
    fs.writeFileSync(path.join(__dirname, `seed_rest_chunk_${i / CHUNK_SIZE}.json`), JSON.stringify(chunk, null, 2));
}

console.log(`Created ${Math.ceil(transformed.length / CHUNK_SIZE)} REST chunks.`);
