import { useState } from 'react';
import { AIMetadata } from '@/lib/types/ai';

const DEFAULT_SETTINGS: AIMetadata = {
  model: '',  // Add the required model property
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0
};

export const useAISettings = () => {
  const [settings, setSettings] = useState<AIMetadata>(DEFAULT_SETTINGS);

  const updateSettings = (newSettings: Partial<AIMetadata>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings
  };
};