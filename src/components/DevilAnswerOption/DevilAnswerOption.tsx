'use client';

import React from 'react';
import DevilAnswerCover from '../DevilAnswerCover/DevilAnswerCover';

interface DevilAnswerOptionProps {
  /** Identificador único de la opción (ej: "A", "B", "C") */
  optionId: string;
  /** El texto real de la respuesta */
  optionText: string;
  /** Indica si la respuesta está actualmente tapada por la trampa del diablo */
  isCovered: boolean;
  /** Acción para revelar el texto y registrar la respuesta en la partida */
  onRevealAndSelect: () => void;
  /** El componente o diseño original del botón de respuesta para cuando no esté tapado */
  children: React.ReactNode;
}

/**
 * COMPONENTE: DevilAnswerOption
 * Envuelve una opción de respuesta. Si el poder del diablo está activo y la opción
 * no ha sido revelada, renderiza la carta cubierta premium. Si ya se reveló o el
 * poder está inactivo, renderiza el botón original del juego.
 */
export default function DevilAnswerOption({
  optionId,
  optionText,
  isCovered,
  onRevealAndSelect,
  children,
}: DevilAnswerOptionProps) {
  if (isCovered) {
    // Si la opción está cubierta por el diablo, mostramos la carta tapada premium
    return (
      <DevilAnswerCover
        onReveal={onRevealAndSelect}
        className="w-full"
      />
    );
  }

  // De lo contrario, renderizamos el botón de respuesta original del juego
  return <>{children}</>;
}
