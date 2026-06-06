const pixellab = require('@pixellab-code/pixellab');
// Find the RotateParamsSchema inside the module
const fs = require('fs');
const path = require('path');
const sdkPath = require.resolve('@pixellab-code/pixellab');
const content = fs.readFileSync(sdkPath, 'utf8');

const schemaRegex = /RotateParamsSchema\s*=\s*([\s\S]*?);/g;
const match = content.match(/RotateParamsSchema\s*=\s*[\s\S]*?\}\);/);
if (match) {
  console.log("RotateParamsSchema text snippet:");
  console.log(match[0].substring(0, 1000));
} else {
  // Let's search using a simple regex search in content
  const lines = content.split('\n');
  const index = lines.findIndex(l => l.includes('RotateParamsSchema'));
  if (index !== -1) {
    console.log("Found RotateParamsSchema at line:", index);
    console.log(lines.slice(index, index + 25).join('\n'));
  } else {
    console.log("Not found in index, printing all text matches");
    lines.forEach((l, idx) => {
      if (l.includes('RotateParams')) {
        console.log(idx, ":", l);
      }
    });
  }
}
