import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { Model, Provider } from '@/lib/types/models';
import { UsageMetrics } from '@/lib/types/analytics';

const STORAGE_KEY = 'vortex_analytics';

interface ModelUsage {
  modelId: string;
  providerId: string;
  tokensUsed: number;
  requestCount: number;
  totalCost: number;
  averageLatency: number;
  errors: number;
  errorCount: number;
  errorRate: number;
  lastUsed: number;
}

interface AnalyticsState {
  dailyUsage: Record<string, UsageMetrics>;
  modelUsage: Record<string, ModelUsage>;
  totalSpend: number;
  startDate: number;
}

const calculateCost = (
  tokens: number,
  model: Model,
  type: 'prompt' | 'completion'
): number => {
  return (tokens * model.pricing[type]) / 1000; // Cost per 1k tokens
};

export const useAnalytics = () => {
  const [state, setState] = useState<AnalyticsState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      dailyUsage: {},
      modelUsage: {},
      totalSpend: 0,
      startDate: Date.now(),
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const trackRequest = useCallback((
    messages: ChatMessage[],
    model: Model,
    provider: Provider,
    response: ChatMessage,
    latency: number,
    error?: Error
  ) => {
    const date = new Date().toISOString().split('T')[0];
    const modelKey = `${provider.id}/${model.id}`;

    setState(prev => {
      // Calculate tokens and cost
      const promptTokens = messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
      const completionTokens = response.tokens || 0;
      const promptCost = calculateCost(promptTokens, model, 'prompt');
      const completionCost = calculateCost(completionTokens, model, 'completion');
      const totalCost = promptCost + completionCost;

      // Update daily usage
      const dailyUsage = {
        ...prev.dailyUsage,
        [date]: {
          totalTokens: (prev.dailyUsage[date]?.totalTokens || 0) + promptTokens + completionTokens,
          requestCount: (prev.dailyUsage[date]?.requestCount || 0) + 1,
          totalCost: (prev.dailyUsage[date]?.totalCost || 0) + totalCost,
          averageLatency: (
            ((prev.dailyUsage[date]?.averageLatency || 0) * (prev.dailyUsage[date]?.requestCount || 0)) +
            latency
          ) / ((prev.dailyUsage[date]?.requestCount || 0) + 1),
          errorCount: (prev.dailyUsage[date]?.errorCount || 0) + (error ? 1 : 0),
        },
      };

      // Update model usage
      const modelUsage = {
        ...prev.modelUsage,
        [modelKey]: {
          modelId: model.id,
          providerId: provider.id,
          tokensUsed: (prev.modelUsage[modelKey]?.tokensUsed || 0) + promptTokens + completionTokens,
          requestCount: (prev.modelUsage[modelKey]?.requestCount || 0) + 1,
          totalCost: (prev.modelUsage[modelKey]?.totalCost || 0) + totalCost,
          averageLatency: (
            ((prev.modelUsage[modelKey]?.averageLatency || 0) * (prev.modelUsage[modelKey]?.requestCount || 0)) +
            latency
          ) / ((prev.modelUsage[modelKey]?.requestCount || 0) + 1),
          errorCount: (prev.modelUsage[modelKey]?.errorCount || 0) + (error ? 1 : 0),
          errors: (prev.modelUsage[modelKey]?.errors || 0) + (error ? 1 : 0),
          errorRate: ((prev.modelUsage[modelKey]?.errorCount || 0) + (error ? 1 : 0)) /
                    ((prev.modelUsage[modelKey]?.requestCount || 0) + 1) * 100,
          lastUsed: Date.now(),
        } as ModelUsage,
      };

      return {
        ...prev,
        dailyUsage,
        modelUsage,
        totalSpend: prev.totalSpend + totalCost,
      };
    });
  }, []);

  const getUsageReport = useCallback((days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyData = Object.entries(state.dailyUsage)
      .filter(([date]) => {
        const entryDate = new Date(date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .sort(([a], [b]) => a.localeCompare(b));

    const modelData = Object.values(state.modelUsage)
      .sort((a, b) => b.lastUsed - a.lastUsed);

    return {
      dailyData,
      modelData,
      totalSpend: state.totalSpend,
      averageDaily: dailyData.reduce((sum, [, data]) => sum + data.totalCost, 0) / days,
      mostUsedModel: modelData[0],
      startDate: state.startDate,
    };
  }, [state]);

  const resetAnalytics = useCallback(() => {
    setState({
      dailyUsage: {},
      modelUsage: {},
      totalSpend: 0,
      startDate: Date.now(),
    });
  }, []);

  return {
    trackRequest,
    getUsageReport,
    resetAnalytics,
    totalSpend: state.totalSpend,
  };
};
