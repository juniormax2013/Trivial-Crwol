import fs from 'fs';
import path from 'path';

function analyzeGLBTracks(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const jsonLength = buffer.readUInt32LE(12);
    const jsonBuffer = buffer.slice(20, 20 + jsonLength);
    const gltf = JSON.parse(jsonBuffer.toString('utf8'));

    if (!gltf.animations || gltf.animations.length === 0) {
      console.log('No hay animaciones.');
      return;
    }

    const anim = gltf.animations[0];
    console.log(`Animación: "${anim.name}"`);
    console.log(`Número de canales: ${anim.channels.length}`);
    console.log(`Número de samplers: ${anim.samplers.length}`);

    // Let's analyze the input times of the first few samplers to find the keyframe timeline
    const timeAccessors = new Set();
    anim.samplers.forEach((sampler) => {
      timeAccessors.add(sampler.input);
    });

    console.log('\nLíneas de tiempo detectadas (accessors de tiempo):');
    Array.from(timeAccessors).forEach((accessorIdx) => {
      const accessor = gltf.accessors[accessorIdx];
      console.log(`Accessor ${accessorIdx}: total frames = ${accessor.count}, min = ${accessor.min[0]}s, max = ${accessor.max[0]}s`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

const filePath = path.join(process.cwd(), 'public/models/jesus3d/Meshy_AI_Tactical_Operative_biped_Animation_Stand_Clap_and_Sit_Down_withSkin.glb');
analyzeGLBTracks(filePath);
