const { PixelLabClient } = require('@pixellab-code/pixellab');
console.log("PixelLabClient:", PixelLabClient);
console.log("Prototype keys:", Object.getOwnPropertyNames(PixelLabClient.prototype));
try {
  const client = new PixelLabClient({ apiKey: 'dummy' });
  console.log("Client keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
} catch (e) {
  console.log("Instantiate error:", e);
}
