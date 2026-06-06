const pixellab = require('@pixellab-code/pixellab');
// Print the shape of GenerateImagePixfluxParamsSchema or check its exports
for (const key of Object.keys(pixellab)) {
  if (key.includes('GenerateImagePixfluxParamsSchema')) {
    console.log(key, ":", Object.keys(pixellab[key].shape));
  }
}
// If not exported, let's find it in the module
const keys = Object.keys(pixellab);
const schemaKey = keys.find(k => k.toLowerCase().includes('generateimagepixfluxparams'));
if (schemaKey) {
  console.log(schemaKey, "shape keys:", Object.keys(pixellab[schemaKey].shape));
} else {
  // Let's print all exported keys containing Schema
  console.log("Schemas:", keys.filter(k => k.includes('Schema')));
}
