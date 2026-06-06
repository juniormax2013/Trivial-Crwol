const pixellab = require('@pixellab-code/pixellab');
const keys = Object.keys(pixellab);
const schemaKey = keys.find(k => k.toLowerCase().includes('rotateparams'));
if (schemaKey) {
  console.log(schemaKey, "shape:", Object.keys(pixellab[schemaKey].shape));
} else {
  console.log("No RotateParamsSchema found");
}
