import fs from 'fs';
import path from 'path';

function analyzeHipsMotion(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const jsonLength = buffer.readUInt32LE(12);
    const jsonBuffer = buffer.slice(20, 20 + jsonLength);
    const gltf = JSON.parse(jsonBuffer.toString('utf8'));

    // Find the channel that targets Hips (or Root) translation
    const translationChannels = gltf.animations[0].channels.filter(c => c.target.path === 'translation');
    console.log(`Canales de traslación: ${translationChannels.length}`);

    translationChannels.forEach((channel, index) => {
      const targetNode = gltf.nodes[channel.target.node];
      const nodeName = targetNode ? targetNode.name : `Node ${channel.target.node}`;
      const sampler = gltf.animations[0].samplers[channel.sampler];
      const inputAccessor = gltf.accessors[sampler.input];
      const outputAccessor = gltf.accessors[sampler.output];

      console.log(`\nCanal ${index}: Nodo="${nodeName}"`);
      console.log(`  Input Accessor (Tiempo) - count: ${inputAccessor.count}`);
      console.log(`  Output Accessor (Valores) - count: ${outputAccessor.count}, type: ${outputAccessor.type}`);

      // Let's read the binary buffer values if we can
      // For simplicity, let's check the buffer views and extract translation Y values
      const bufferView = gltf.bufferViews[outputAccessor.bufferView];
      const bufferOffset = (bufferView.byteOffset || 0) + (outputAccessor.byteOffset || 0) + 20 + jsonLength + 8; // skip header + json chunk header + JSON data

      // Reading float32 values (translation is VEC3: x, y, z - 12 bytes per frame)
      const values = [];
      const times = [];
      
      const timeBufferView = gltf.bufferViews[inputAccessor.bufferView];
      const timeOffset = (timeBufferView.byteOffset || 0) + (inputAccessor.byteOffset || 0) + 20 + jsonLength + 8;

      for (let i = 0; i < inputAccessor.count; i++) {
        const t = buffer.readFloatLE(timeOffset + i * 4);
        const x = buffer.readFloatLE(bufferOffset + i * 12);
        const y = buffer.readFloatLE(bufferOffset + i * 12 + 4);
        const z = buffer.readFloatLE(bufferOffset + i * 12 + 8);
        times.push(t);
        values.push({ x, y, z });
      }

      // Log the translation Y over time (every 10 frames)
      console.log('  Muestreo de traslación Y (vertical):');
      for (let i = 0; i < times.length; i += 10) {
        console.log(`    Tiempo: ${times[i].toFixed(2)}s -> Y: ${values[i].y.toFixed(4)}`);
      }
      // Also log last frame
      const last = times.length - 1;
      console.log(`    Tiempo: ${times[last].toFixed(2)}s -> Y: ${values[last].y.toFixed(4)}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

const filePath = path.join(process.cwd(), 'public/models/jesus3d/Meshy_AI_Tactical_Operative_biped_Animation_Stand_Clap_and_Sit_Down_withSkin.glb');
analyzeHipsMotion(filePath);
