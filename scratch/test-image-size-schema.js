const pixellab = require('@pixellab-code/pixellab');
console.log("ImageSizeSchema shape:", Object.keys(pixellab.ImageSizeSchema.shape));
console.log("ImageSizeSchema shape keys:", pixellab.ImageSizeSchema.shape.width ? 'has width' : 'no width');
console.log("ImageSizeSchema definition:", pixellab.ImageSizeSchema.toString());
