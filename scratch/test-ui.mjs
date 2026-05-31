import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function run() {
  console.log('🚀 Iniciando navegador Playwright para probar la UI...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Establecer tamaño de ventana similar a iPad/iPhone
  await page.setViewportSize({ width: 800, height: 1000 });

  try {
    console.log('🌐 Navegando a la pantalla de pruebas del personaje diablo local...');
    await page.goto('http://localhost:3001/test-character', { waitUntil: 'networkidle' });
    console.log('✅ Navegación completada con éxito.');

    // Esperar 1 segundo para renderizado inicial
    await page.waitForTimeout(1500);

    // Hacer la primera captura de pantalla (Estado Idle por defecto con el diablo real)
    await page.screenshot({ path: 'scratch/test-character-idle.png' });
    console.log('📸 Captura de pantalla en estado IDLE guardada en scratch/test-character-idle.png');

    // Buscar los botones de acción del panel
    console.log('🖱️ Simulando clic en la acción "user_answer_wrong" (Risa Malvada)...');
    
    // Haremos clic en el botón que contiene "Burlarse" o "risa_malvada"
    const wrongButton = page.locator('button:has-text("Burlarse")');
    if (await wrongButton.count() > 0) {
      await wrongButton.click();
      console.log('👉 ¡Clic realizado con éxito!');
      
      // Esperar a que se aplique la animación y se muestre la frase
      await page.waitForTimeout(1000);
      
      // Hacer la segunda captura de pantalla para validar la reacción interactiva
      await page.screenshot({ path: 'scratch/test-character-action.png' });
      console.log('📸 Captura de pantalla de la acción BURLARSE guardada en scratch/test-character-action.png');
    } else {
      console.warn('⚠️ No se encontró el botón de Burlarse.');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba de la interfaz:', error);
  } finally {
    await browser.close();
    console.log('👋 Navegador cerrado. Proceso finalizado.');
  }
}

run();
