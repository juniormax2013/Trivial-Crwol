process.env.PIXELLAB_SECRET = '6fb83ae9-d485-4823-8363-ac17f76bbae7';
const { PixelLabClient } = require('@pixellab-code/pixellab');
try {
  const client = PixelLabClient.fromEnv();
  console.log("Success! secret:", client.secret);
} catch (e) {
  console.error("fromEnv failed:", e);
}
