---
name: rive-character-animation
description: Guía de integración y animación de personajes 2D interactivos en Rive, controlados mediante State Machines y sincronizados con eventos del juego.
---

# Rive Character Animation Agent — Guía de Implementación Pro

Esta guía especializada documenta las mejores prácticas para integrar personajes interactivos 2D utilizando **Rive**, **State Machines** y controladores de código dentro de la aplicación. 

El sistema está diseñado bajo un modelo escalable y orientado a producto, utilizando el personaje actual (**Diablo Elegante**) como base competitiva y permitiendo la adición fluida de futuros rivales o aliados.

---

## 🎨 Principio de Animación Profesional: Preparación de Assets

> [!WARNING]
> **Advertencia de Diseño Crucial:**
> Si el personaje se encuentra consolidado en una sola imagen plana (PNG o JPG), **es imposible realizar una animación interactiva profesional**. Para lograr una experiencia premium con deformaciones de malla (mesh warping), parpadeos, respiración y articulaciones fluidas, el personaje **debe ser dividido en capas vectoriales** o piezas de imagen separadas en tu software de diseño (Figma/Illustrator/Photoshop) antes de importarlo a Rive.
>
> **Capas recomendadas para separar:**
> *   **Cabeza**: Rostro base, ojos (párpados superior/inferior por separado), cejas, boca (múltiples estados de labios para sincronización), cuernos y cabello.
> *   **Torso**: Traje elegante (saco, corbata, hombreras).
> *   **Extremidades**: Brazos (divididos en hombro-codo y antebrazo-mano) y piernas para permitir cinemática inversa (IK).
> *   **Efectos**: Capas adicionales para fuego, chispas o el humo de invocación.

---

## 🏗️ División del Trabajo: Rive vs. Código

Para lograr animaciones interactivas de alto rendimiento y bajo peso (los archivos `.riv` suelen pesar menos de 100 KB), el trabajo se divide estrictamente de la siguiente manera:

### 🎮 Qué se hace en la herramienta web de Rive:
1.  **Rigging (Huesos y Mallas)**: Creación de la estructura esquelética (bones) sobre las capas separadas y asignación de pesos a las mallas vectoriales para lograr flexiones naturales en el traje y cuerpo.
2.  **Líneas de Tiempo (Timelines)**: Animación de cada una de las 11 acciones base en bucles (loops) o reproducciones de una sola vez (one-shots).
3.  **State Machine (`DevilStateMachine`)**: Configuración de los estados de animación y las transiciones lógicas entre ellos utilizando **Inputs** (Triggers, Booleanos o Números).

### 💻 Qué se hace en el Código (React/Next.js):
1.  **Carga del Asset**: Importación del archivo binario `.riv` en el frontend utilizando `@rive-app/react-canvas`.
2.  **Conexión a la State Machine**: Obtención de una referencia a los Inputs de `DevilStateMachine`.
3.  **Disparar Transiciones**: Escuchar los eventos del flujo del juego y cambiar los valores de los inputs de Rive en respuesta a las acciones del usuario.

---

## 👹 Configuración de la State Machine: `DevilStateMachine`

La lógica del personaje se centraliza en una máquina de estados de Rive llamada obligatoriamente **`DevilStateMachine`**. Esta máquina utiliza los siguientes inputs de control:

| Input Rive | Tipo | Descripción |
| :--- | :--- | :--- |
| `state` | **Number** | Control numérico para transicionar de forma instantánea entre estados base (0 = Idle, 1 = Pensando, 2 = Saludo, etc.). |
| `triggerAction` | **Trigger** | Disparador instantáneo para reproducir reacciones breves de una sola vez (como *sorprendido* o *risa_malvada*) y retornar automáticamente al estado previo. |
| `isEnraged` | **Boolean** | Mantiene al diablo en estado de enojo persistente cuando el usuario entra en racha correcta. |

---

## 🎮 Mapeo de Eventos de Juego a Animaciones

Las animaciones del Diablo se interpretan **estrictamente desde su punto de vista competitivo** (como rival que busca derrotar al usuario):

> [!IMPORTANT]
> **Interpretación del Rol:**
> *   **Victoria del Diablo** (user_lost_game): El diablo celebra y se burla porque el usuario ha perdido la partida.
> *   **Derrota del Diablo** (user_won_game): El diablo queda humillado y vencido porque el usuario ha triunfado.

### Tabla de Mapeo de Estados y Animaciones obligatorias:

| Evento del Juego | Acción Rive | Point of View (Perspectiva del Diablo) | Rive Input / Valor |
| :--- | :--- | :--- | :--- |
| `default_state` | **idle** | Estado relajado de respiración y balanceo sutil esperando el turno del usuario. | `state = 0` |
| `app_loading` | **pensando** | El diablo analiza al oponente, sobándose la barbilla de manera calculadora. | `state = 1` |
| `user_answer_wrong` | **risa_malvada** | Risa burlona y destellos de fuego tras un fallo del usuario. | `triggerAction` (Risa) |
| `user_lost_game` | **victoria** | Celebración triunfal y burla porque el diablo ganó el duelo. | `state = 2` |
| `user_won_game` | **derrota** | Estado abatido, de rodillas o con cuernos caídos por perder ante el usuario. | `state = 3` |
| `devil_power_activated`| **ataque** | Lanzamiento de poderes (como la *Trampa del Diablo*) hacia la pantalla. | `triggerAction` (Ataque) |
| `user_two_correct_answers`| **sorprendido**| Expresión de alarma temporal por la destreza del jugador. | `triggerAction` (Susto) |
| `user_correct_streak` | **enojo** | Humo saliendo de sus orejas al ver la racha perfecta del usuario. | `isEnraged = true` |
| `devil_enter_screen` | **aparecer_humo** | Invocación en pantalla con una cortina de humo morado/dorado. | `state = 4` (Entrada) |
| `devil_exit_screen` | **desaparecer_humo**| Escape de pantalla desvaneciéndose en humo tras el fin del turno. | `state = 5` (Salida) |
| `—` | **saludo** | Reverencia elegante al inicio del juego para recibir al jugador. | `triggerAction` (Saludo) |

---

## 💻 Ejemplo de Implementación en Next.js (Componente React)

A continuación se presenta la plantilla del componente del frontend que renderiza de manera premium al personaje e interactúa con el State Machine.

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

// ── DEFINICIÓN DE ACCIONES DE LA STATE MACHINE ──
export type DevilGameEvent =
  | 'user_answer_wrong'
  | 'user_lost_game'
  | 'user_won_game'
  | 'devil_power_activated'
  | 'user_two_correct_answers'
  | 'app_loading'
  | 'user_correct_streak'
  | 'devil_enter_screen'
  | 'devil_exit_screen'
  | 'default_state';

interface RiveRivalProps {
  event: DevilGameEvent;
  characterSrc?: string; // Ruta al archivo .riv (permite escalabilidad)
  stateMachineName?: string; // Nombre de la State Machine principal
  className?: string;
}

export default function RiveRival({
  event,
  characterSrc = '/assets/rive/elegant_devil.riv',
  stateMachineName = 'DevilStateMachine',
  className = '',
}: RiveRivalProps) {
  
  // 1. Inicialización del Hook de Rive
  const { rive, RiveComponent } = useRive({
    src: characterSrc,
    stateMachines: stateMachineName,
    autoplay: true,
  });

  // 2. Vinculación de los Inputs de la State Machine
  const stateInput = useStateMachineInput(rive, stateMachineName, 'state');
  const triggerActionInput = useStateMachineInput(rive, stateMachineName, 'triggerAction');
  const isEnragedInput = useStateMachineInput(rive, stateMachineName, 'isEnraged');

  // 3. Reactividad a los Eventos del Juego
  useEffect(() => {
    if (!rive || !stateInput) return;

    // Resetear enojo por defecto a menos que sea una racha
    if (event !== 'user_correct_streak' && isEnragedInput) {
      isEnragedInput.value = false;
    }

    switch (event) {
      case 'default_state':
        stateInput.value = 0; // idle
        break;

      case 'app_loading':
        stateInput.value = 1; // pensando
        break;

      case 'user_lost_game':
        stateInput.value = 2; // victoria (diablo celebra)
        break;

      case 'user_won_game':
        stateInput.value = 3; // derrota (diablo humillado)
        break;

      case 'devil_enter_screen':
        stateInput.value = 4; // aparecer_humo
        break;

      case 'devil_exit_screen':
        stateInput.value = 5; // desaparecer_humo
        break;

      case 'user_correct_streak':
        if (isEnragedInput) isEnragedInput.value = true; // enojo activo
        break;

      case 'user_answer_wrong':
        // Risa malvada (Trigger temporal)
        if (triggerActionInput) triggerActionInput.fire();
        break;

      case 'devil_power_activated':
        // Ataque (Trigger temporal)
        if (triggerActionInput) triggerActionInput.fire();
        break;

      case 'user_two_correct_answers':
        // Sorprendido (Trigger temporal)
        if (triggerActionInput) triggerActionInput.fire();
        break;

      default:
        stateInput.value = 0; // fallback to idle
        break;
    }
  }, [event, rive, stateInput, triggerActionInput, isEnragedInput]);

  return (
    <div className={`relative overflow-hidden w-64 h-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl shadow-[#310065]/10 flex items-center justify-center p-2 ${className}`}>
      {/* Glow decorativo de fondo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#310065]/5 to-transparent pointer-events-none" />
      
      {/* Componente Rive */}
      <RiveComponent className="w-full h-full object-contain" />
    </div>
  );
}
```

---

## 🚀 Escalabilidad: Agregar Nuevos Personajes

El sistema está estructurado bajo principios de abstracción limpia para que añadir nuevos rivales (como un *Ángel Custodio*, un *Escriba Sabio* o un *Guerrero de la Fe*) no requiera modificar el flujo lógico del juego.

### Pasos para añadir un nuevo personaje:
1.  **Consistencia de Nombres**: Diseña el nuevo archivo `.riv` respetando la misma lista de acciones y valores en la State Machine principal de ese personaje.
2.  **Parámetros dinámicos**: El componente `RiveRival` ya expone las props `characterSrc` y `stateMachineName`. Para cambiar de personaje, simplemente instáncialo con la ruta del nuevo asset:
    ```tsx
    <RiveRival 
      characterSrc="/assets/rive/angel_guardian.riv" 
      stateMachineName="AngelStateMachine" 
      event={currentEvent} 
    />
    ```
3.  **Fácil Mapeo**: El componente se encargará de mapear los mismos eventos de juego (`user_answer_wrong`, etc.) a los inputs del nuevo personaje de forma transparente.
