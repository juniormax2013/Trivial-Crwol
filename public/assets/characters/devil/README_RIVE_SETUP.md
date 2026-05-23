# 👹 Guía de Rigging y Animación 2D: Diablo Elegante en Rive

Esta guía documenta los pasos necesarios para preparar las capas del personaje, importarlas en **Rive**, crear la estructura esquelética (rigging) de huesos, animarlo y conectar los eventos a la máquina de estados.

---

## 🎨 Paso 1: Preparación y Separación de Capas

Para lograr animaciones orgánicas y tridimensionales mediante deformación de mallas vectoriales y rotación de extremidades, la ilustración consolidad del Diablo Elegante **debe ser dividida e ilustrada por separado en capas PNG transparentes a resolución 3x**:

### Lista de Archivos PNG Requeridos:

*   `head.png`: El rostro completo de color rojo, sin ojos, boca ni cuernos (rellena con rojo plano las áreas de ojos y boca para evitar que queden huecos al moverse los componentes de la cara).
*   `eyes.png`: Las cejas y los ojos por separado (las pupilas/iris amarillos brillantes deben estar aislados para animar la dirección de la mirada, y los párpados deben ser piezas móviles).
*   `mouth.png`: Los labios y dientes. Puedes usar una sola boca y deformar sus vértices en Rive, o tener 3 variaciones de formas (cerrada, abierta feliz, sorprendida) para intercambiarlas en el Timeline.
*   `horns.png`: Los dos cuernos negros.
*   `body.png`: El torso central del diablo (chaleco gris y corbata roja). Actuará como base/raíz del cuerpo.
*   `coat.png`: Saco o americana elegante de color morado (las solapas e incluso los faldones deben ir en piezas independientes para poder animarles efectos de oscilación por viento).
*   `left_arm.png` & `right_arm.png`: Los brazos (divididos en brazo superior y antebrazo para lograr articulaciones de codo naturales).
*   `left_hand.png` & `right_hand.png`: Las manos. En el caso de `right_hand.png`, debe incluir el bastón de calavera dorada completo para que se mueva en sincronía absoluta.
*   `left_leg.png` & `right_leg.png`: Las piernas (segmentadas en muslo, pantorrilla y zapato para cinemática inversa).
*   `tail.png`: La cola flexible acabada en punta de flecha.
*   `shadow.png`: Una elipse negra difuminada con opacidad (ej. 30%) para colocar en el suelo y simular la sombra de contacto.
*   `smoke_effect.png`: Recursos de partículas de humo moradas/doradas translúcidas para efectos de invocación y escape en pantalla.

> [!IMPORTANT]
> **La Regla del Traslape:**
> Reconstruye digitalmente el fondo de las áreas que queden ocultas (ej. la parte del saco detrás de los brazos) con el tampón de clonar. Si no lo haces, cuando el personaje mueva los brazos, se verán agujeros transparentes en su ropa.

---

## 📥 Paso 2: Importar Capas en Rive

1.  Crea un nuevo archivo en el editor de Rive (`rive.app`).
2.  Arrastra y suelta todas las imágenes recortadas `.png` directamente al panel `Assets` de Rive.
3.  Organiza las capas en la vista `Design` ordenando el orden de dibujo (draw order) de atrás hacia adelante (ej. la cola y las alas al fondo, luego el cuerpo, el saco, la cabeza y los ojos al frente).

---

## 🦴 Paso 3: Rigging (Creación de Huesos)

1.  Selecciona la herramienta **Bone (Hueso)** en el editor web de Rive (atajo `B`).
2.  Crea el hueso raíz (`root`) en el centro de gravedad (cintura).
3.  Traza la columna vertebral: Hueso de la cintura -> Hueso del pecho -> Hueso del cuello -> Hueso de la cabeza.
4.  Crea ramas secundarias:
    *   **Brazos**: Hombro -> Codo -> Muñeca/Mano.
    *   **Piernas**: Cadera -> Rodilla -> Tobillo -> Pie.
    *   **Cola**: Una cadena consecutiva de 5 a 6 huesos pequeños a lo largo de toda la cola.
5.  **Vinculación (Binding)**: Selecciona cada capa de imagen, haz clic en `Bind Bones` y selecciona los huesos que deben controlarla. Modifica los pesos de los vértices (vertices weights) para que las dobleces del saco o la cola sean fluidas.
6.  **Cinemática Inversa (IK)**: Agrega un controlador de tipo **IK Target** en los pies para que al mover el pie, la rodilla y la pierna entera se doblen automáticamente.

---

## 🎬 Paso 4: Crear Animaciones (Timeline)

Cambia a la vista **Animate** en Rive y crea las siguientes líneas de tiempo (`Timelines`) individuales, animando las propiedades de rotación, posición y escala de los huesos:

*   `idle`: Animación en bucle (loop) con respiración sutil, movimiento leve de cola y pestañeo.
*   `saludo`: Reverencia inicial quitándose el sombrero o agachando elegantemente la cabeza (one-shot).
*   `risa_malvada`: Risa a carcajadas con hombros sacudiéndose y destellos de fuego tras un fallo del usuario (one-shot).
*   `victoria`: Celebración burlona cruzándose de brazos o apuntando con el bastón al jugador (loop).
*   `derrota`: Caída de rodillas o cara de frustración con cuernos caídos por perder (loop).
*   `ataque`: Blandido de bastón hacia el frente para activar un poder oscuro (one-shot).
*   `sorprendido`: Ojos muy abiertos y cejas elevadas debido a la destreza del usuario (one-shot).
*   `pensando`: Mano en la barbilla y mirada hacia arriba pensativa (loop).
*   `enojo`: Expresión furiosa con humo y ojos encendidos (loop/boolean triggered).
*   `aparecer_humo`: Entrada en escena escalando desde 0 envuelto en nubes de humo (one-shot).
*   `desaparecer_humo`: Salida de escena desvaneciéndose en humo con opacidad a 0 (one-shot).

---

## 👹 Paso 5: Conectar a `DevilStateMachine`

Crea una State Machine y nómbrala **`DevilStateMachine`**. Configura la lógica interactiva utilizando los siguientes inputs:

### 1. Inputs de la State Machine:
*   `state` (**Number**):
    *   `0` => idle (bucle por defecto)
    *   `1` => pensando
    *   `2` => victoria
    *   `3` => derrota
    *   `4` => aparecer_humo
    *   `5` => desaparecer_humo
*   `triggerAction` (**Trigger**): Disparador rápido para reproducir animaciones que regresan solas al idle:
    *   `saludo`
    *   `risa_malvada`
    *   `ataque`
    *   `sorprendido`
*   `isEnraged` (**Boolean**): Transiciona al diablo al estado permanente de `enojo` cuando su valor es `true`.

### 2. Estructura de Capas de Animación (Layers) en Rive:
*   **Base Layer**: Gestiona las transiciones del input numérico `state` (`idle` <-> `pensando` <-> `victoria` <-> `derrota` <-> `aparecer_humo` <-> `desaparecer_humo`).
*   **Action Layer**: Escucha el `triggerAction` para desviar temporalmente el flujo al `saludo` o la `risa_malvada` y luego retornar de forma inmediata al flujo principal.
*   **Expression Layer**: Escucha `isEnraged` para aplicar aditivamente la expresión de rabia (humo en orejas y cejas inclinadas) sobre cualquier animación que se esté reproduciendo de fondo.

Una vez finalizado, exporta el archivo como **`devil.riv`** y reemplázalo en el directorio [assets/characters/devil/devil.riv](file:///Users/angelus/Desktop/Mis%20Proyectos/Trivial%20Crowl%20App/Trivial%20App/assets/characters/devil/devil.riv) para probar las interacciones dinámicas en el simulador.
