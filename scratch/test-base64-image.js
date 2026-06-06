const { Base64Image } = require('@pixellab-code/pixellab');
console.log("Base64Image string:", Base64Image.toString());
console.log("Base64Image prototype keys:", Object.getOwnPropertyNames(Base64Image.prototype));
const img = Base64Image.fromData('data:image/png;base64,iVBORw0KGgoAAA');
console.log("Image keys:", Object.keys(img));
try {
  console.log("img.toDataUrl():", img.toDataUrl ? img.toDataUrl() : 'no toDataUrl');
  console.log("img.toBuffer():", img.toBuffer ? img.toBuffer() : 'no toBuffer');
  console.log("img.data:", img.data);
} catch (e) {
  console.error(e);
}
