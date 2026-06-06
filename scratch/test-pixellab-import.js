try {
  const pixellab = require('@pixellab-code/pixellab');
  console.log("Keys:", Object.keys(pixellab));
  console.log("Exports:", pixellab);
} catch (e) {
  console.error("Import error:", e);
}
