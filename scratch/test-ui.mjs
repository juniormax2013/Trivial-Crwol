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
    await page.goto('http://localhost:3002/test-character', { waitUntil: 'domcontentloaded' });
    console.log('✅ Navegación completada con éxito.');

    // Esperar 1 segundo para renderizado inicial
    await page.waitForTimeout(1500);

    // Hacer la primera captura de pantalla (Estado Idle por defecto con el diablo real)
    // Cambiar al personaje Diablo para ver sus gestos
    console.log('👤 Cambiando al personaje Diablo...');
    const devilButton = page.locator('button:has-text("😈 Diablo")');
    if (await devilButton.count() > 0) {
      await devilButton.click();
      console.log('✅ Clic en el selector de Diablo realizado.');
    }

    // Buscar los botones de acción del panel
    console.log('🖱️ Buscando la acción "Risa Malvada"...');
    const wrongButton = page.locator('button:has-text("Risa Malvada")');
    
    // Esperar a que el botón sea visible tras el cambio de pestaña
    await wrongButton.waitFor({ state: 'visible', timeout: 5000 });
    
    if (await wrongButton.count() > 0) {
      await wrongButton.click();
      console.log('👉 ¡Clic en Risa Malvada realizado con éxito!');
      
      // Esperar a que se aplique la animación
      await page.waitForTimeout(1000);
      
      // Hacer la segunda captura de pantalla para validar la reacción interactiva
      await page.screenshot({ path: 'scratch/test-character-action.png' });
      console.log('📸 Captura de pantalla de la acción RISA MALVADA guardada en scratch/test-character-action.png');
    } else {
      console.warn('⚠️ No se encontró el botón de Risa Malvada.');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba de la interfaz:', error);
  } finally {
    await browser.close();
    console.log('👋 Navegador cerrado. Proceso finalizado.');
  }
}

run();
