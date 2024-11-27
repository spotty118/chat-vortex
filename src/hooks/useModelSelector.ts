import { useState, useMemo } from 'react';
import { Model, Provider } from '@/lib/types/models';

type ModelFilter = {
  capabilities?: string[];
  maxCost?: number;
  minContextWindow?: number;
  inputFormats?: string[];
  outputFormats?: string[];
};

export const useModelSelector = (providers: Provider[]) => {
  const [filters, setFilters] = useState<ModelFilter>({});
  
  const allModels = useMemo(() => {
    return providers.flatMap(provider => 
      provider.models.map(model => ({
        ...model,
        provider: provider.id,
        providerName: provider.name,
        providerStatus: provider.status,
      }))
    );
  }, [providers]);

  const filteredModels = useMemo(() => {
    return allModels.filter(model => {
      if (filters.capabilities?.length) {
        const hasAllCapabilities = filters.capabilities.every(cap => 
          model.capabilities.includes(cap as any)
        );
        if (!hasAllCapabilities) return false;
      }

      if (filters.maxCost && model.pricing.prompt > filters.maxCost) {
        return false;
      }

      if (filters.minContextWindow && model.contextWindow < filters.minContextWindow) {
        return false;
      }

      if (filters.inputFormats?.length) {
        const hasAllInputFormats = filters.inputFormats.every(format => 
          model.inputFormats.includes(format as any)
        );
        if (!hasAllInputFormats) return false;
      }

      if (filters.outputFormats?.length) {
        const hasAllOutputFormats = filters.outputFormats.every(format => 
          model.outputFormats.includes(format as any)
        );
        if (!hasAllOutputFormats) return false;
      }

      return true;
    });
  }, [allModels, filters]);

  const groupedModels = useMemo(() => {
    return filteredModels.reduce((acc, model) => {
      const key = model.provider;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(model);
      return acc;
    }, {} as Record<string, typeof filteredModels>);
  }, [filteredModels]);

  return {
    filters,
    setFilters,
    allModels,
    filteredModels,
    groupedModels,
  };
};
