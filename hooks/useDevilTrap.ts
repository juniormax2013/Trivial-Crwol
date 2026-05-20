import { useState, useCallback } from 'react';

export function useDevilTrap() {
  const [isDevilActive, setIsDevilActive] = useState(false);
  const [revealedOptions, setRevealedOptions] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

  const triggerDevilTrap = useCallback((originalOptions: any[], force = false, probability = 0.15) => {
    // 15% probability unless forced
    const shouldTrigger = force || Math.random() < probability;
    
    if (shouldTrigger && originalOptions && originalOptions.length > 0) {
      setIsDevilActive(true);
      setRevealedOptions([]);
      // Shuffle options to disorient the player
      const shuffled = [...originalOptions].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    } else {
      setIsDevilActive(false);
      setRevealedOptions([]);
      setShuffledOptions(originalOptions || []);
    }
  }, []);

  const revealOption = useCallback((optionId: string) => {
    setRevealedOptions((prev) => {
      if (prev.includes(optionId)) return prev;
      return [...prev, optionId];
    });
  }, []);

  const resetDevilTrap = useCallback(() => {
    setIsDevilActive(false);
    setRevealedOptions([]);
    setShuffledOptions([]);
  }, []);

  return {
    isDevilActive,
    revealedOptions,
    shuffledOptions,
    triggerDevilTrap,
    revealOption,
    resetDevilTrap,
  };
}
