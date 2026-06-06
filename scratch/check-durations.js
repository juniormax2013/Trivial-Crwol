import fs from 'fs';
import path from 'path';

// Helper to parse GLB and get animation duration
function getGLBDuration(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // GLB header: magic (4 bytes), version (4 bytes), length (4 bytes)
    const magic = buffer.toString('utf8', 0, 4);
    if (magic !== 'glTF') {
      return 'No es un archivo GLB válido';
    }

    // Chunk 0: length (4 bytes), type (4 bytes, should be JSON)
    const jsonLength = buffer.readUInt32LE(12);
    const jsonType = buffer.toString('utf8', 16, 20);
    
    if (jsonType !== 'JSON') {
      return 'No se encontró chunk JSON en el GLB';
    }

    const jsonBuffer = buffer.slice(20, 20 + jsonLength);
    const gltf = JSON.parse(jsonBuffer.toString('utf8'));

    if (!gltf.animations || gltf.animations.length === 0) {
      return 'Sin animaciones';
    }

    // Find the max time in accessors for the animation samplers
    let maxDuration = 0;
    gltf.animations.forEach((anim) => {
      anim.samplers.forEach((sampler) => {
        const inputAccessorIdx = sampler.input;
        const accessor = gltf.accessors[inputAccessorIdx];
        if (accessor && accessor.max && accessor.max[0] > maxDuration) {
          maxDuration = accessor.max[0];
        }
      });
    });

    return maxDuration.toFixed(2) + 's';
  } catch (error) {
    return 'Error al leer: ' + error.message;
  }
}

const jesusModels = {
  appear: "Meshy_AI_Tactical_Operative_biped_Animation_Wave_One_Hand_withSkin.glb",
  protect: "Meshy_AI_Tactical_Operative_biped_Animation_Stand_Cheer_and_Sit_Down_withSkin.glb",
  reveal: "Meshy_AI_Tactical_Operative_biped_Animation_Grip_and_Throw_Down_withSkin.glb",
  compassion: "Meshy_AI_Tactical_Operative_biped_Animation_Cheer_with_Both_Hands_1_withSkin.glb",
  clap: "Meshy_AI_Tactical_Operative_biped_Animation_Stand_Clap_and_Sit_Down_withSkin.glb",
  idle: "jesus_idle.glb",
  greeting: "jesus_greeting.glb",
  blessing: "jesus_blessing.glb",
  victory: "jesus_victory.glb",
  authority: "jesus_authority.glb",
  disappear: "jesus_disappear.glb"
};

console.log('--- Duraciones de las Animaciones de Jesús 3D ---');
Object.entries(jesusModels).forEach(([action, filename]) => {
  const filePath = path.join(process.cwd(), 'public/models/jesus3d', filename);
  const duration = getGLBDuration(filePath);
  console.log(`${action.padEnd(12)} -> ${filename.padEnd(85)} : ${duration}`);
});
