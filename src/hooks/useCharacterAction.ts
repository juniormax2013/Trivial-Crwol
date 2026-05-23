'use client';

import { useState, useEffect, useCallback } from 'react';
import devilConfig from '../../assets/characters/devil/config/characterActions.json';

// ── TYPES ──

export type CharacterType = 'devil';

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

export interface ActionInfo {
  name: string;
  type: 'state' | 'trigger' | 'boolean';
  value: number | string;
  description: string;
}

export interface UseCharacterActionReturn {
  characterName: string;
  stateMachineName: string;
  defaultState: string;
  currentEvent: GameEvent;
  currentAction: ActionInfo | null;
  triggerEvent: (event: GameEvent) => void;
  getAllActions: () => Record<string, ActionInfo>;
}

/**
 * HOOK: USE CHARACTER ACTION
 * Hook reactivo para mapear eventos del flujo de juego a las correspondientes animaciones del personaje en Rive.
 * Está estructurado de forma abstracta para soportar escalabilidad hacia futuros personajes.
 */
export function useCharacterAction(character: CharacterType = 'devil'): UseCharacterActionReturn {
  const [currentEvent, setCurrentEvent] = useState<GameEvent>('default_state');
  const [currentAction, setCurrentAction] = useState<ActionInfo | null>(null);

  // Mapeo dinámico basado en la configuración JSON del personaje
  const config = devilConfig; // En el futuro se puede mapear dinámicamente según la prop 'character'

  const triggerEvent = useCallback((event: GameEvent) => {
    setCurrentEvent(event);
  }, []);

  useEffect(() => {
    // 1. Obtener la acción asociada al evento a través del JSON
    const actionName = config.eventMappings[currentEvent as keyof typeof config.eventMappings];
    if (!actionName) {
      setCurrentAction(null);
      return;
    }

    // 2. Extraer los datos detallados del input de Rive
    const actionDetails = config.actions[actionName as keyof typeof config.actions];
    if (!actionDetails) {
      setCurrentAction(null);
      return;
    }

    setCurrentAction({
      name: actionName,
      type: actionDetails.type as 'state' | 'trigger' | 'boolean',
      value: actionDetails.value,
      description: actionDetails.description,
    });
  }, [currentEvent, config]);

  const getAllActions = useCallback(() => {
    const actions: Record<string, ActionInfo> = {};
    Object.entries(config.actions).forEach(([name, details]) => {
      actions[name] = {
        name,
        type: details.type as 'state' | 'trigger' | 'boolean',
        value: details.value,
        description: details.description,
      };
    });
    return actions;
  }, [config]);

  return {
    characterName: config.character,
    stateMachineName: config.stateMachineName,
    defaultState: config.defaultState,
    currentEvent,
    currentAction,
    triggerEvent,
    getAllActions,
  };
}
