const { PixelLabClient } = require('@pixellab-code/pixellab');
const client = new PixelLabClient({ apiKey: '6fb83ae9-d485-4823-8363-ac17f76bbae7' });
console.log("Client instance keys:", Object.keys(client));
console.log("Is generateImagePixflux a function on client?", typeof client.generateImagePixflux);
console.log("Is rotate a function on client?", typeof client.rotate);
console.log("Is animateWithText a function on client?", typeof client.animateWithText);
console.log("Is getBalance a function on client?", typeof client.getBalance);
