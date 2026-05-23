import { useState, useCallback } from 'react';

// ── TIPOS DE EVENTOS Y ACCIONES DEL DIABLO ──

export type GameEvent =
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

export type DevilAction =
  | 'risa_malvada'
  | 'victoria'
  | 'derrota'
  | 'ataque'
  | 'sorprendido'
  | 'pensando'
  | 'enojo'
  | 'aparecer_humo'
  | 'desaparecer_humo'
  | 'idle';

/**
 * Función pura que traduce un evento del flujo del juego a la acción correcta del diablo
 * según la matriz de comportamiento competitivo establecida.
 * 
 * @param event El evento desencadenado en el juego.
 * @returns La animación o acción correspondiente del diablo.
 * 
 * @example
 * getDevilActionFromGameEvent("user_answer_wrong") // "risa_malvada"
 */
export function getDevilActionFromGameEvent(event: GameEvent): DevilAction {
  switch (event) {
    case 'user_answer_wrong':
      return 'risa_malvada';
    case 'user_lost_game':
      return 'victoria';
    case 'user_won_game':
      return 'derrota';
    case 'devil_power_activated':
      return 'ataque';
    case 'user_two_correct_answers':
      return 'sorprendido';
    case 'app_loading':
      return 'pensando';
    case 'user_correct_streak':
      return 'enojo';
    case 'devil_enter_screen':
      return 'aparecer_humo';
    case 'devil_exit_screen':
      return 'desaparecer_humo';
    case 'default_state':
    default:
      return 'idle';
  }
}

/**
 * Hook reactivo para conectar y sincronizar los eventos del juego con las animaciones
 * del Diablo Elegante en la interfaz de usuario.
 * 
 * @param initialEvent Evento inicial opcional (por defecto es 'default_state').
 */
export function useDevilAction(initialEvent: GameEvent = 'default_state') {
  const [currentEvent, setCurrentEvent] = useState<GameEvent>(initialEvent);
  const [currentAction, setCurrentAction] = useState<DevilAction>(
    getDevilActionFromGameEvent(initialEvent)
  );

  /**
   * Dispara un evento del juego y calcula la correspondiente animación del diablo de forma reactiva.
   */
  const triggerGameEvent = useCallback((event: GameEvent) => {
    setCurrentEvent(event);
    setCurrentAction(getDevilActionFromGameEvent(event));
  }, []);

  return {
    /** Evento de juego actualmente activo */
    currentEvent,
    /** Acción del diablo calculada correspondiente al evento */
    currentAction,
    /** Desencadena un cambio de evento en el juego */
    triggerGameEvent,
    /** Función de mapeo estática para uso utilitario */
    getDevilActionFromGameEvent,
  };
}
