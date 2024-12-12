import React from 'react';
import { ThoughtStep } from '@/lib/chainOfThought';
import { Brain, Play, Eye, CheckCircle } from 'lucide-react';

interface ChainOfThoughtStepsProps {
  steps: ThoughtStep[];
}

export const ChainOfThoughtSteps = ({ steps }: ChainOfThoughtStepsProps) => {
  const getIcon = (type: ThoughtStep['type']) => {
    switch (type) {
      case 'thought':
        return <Brain className="w-4 h-4" />;
      case 'action':
        return <Play className="w-4 h-4" />;
      case 'observation':
        return <Eye className="w-4 h-4" />;
      case 'conclusion':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getColor = (type: ThoughtStep['type']) => {
    switch (type) {
      case 'thought':
        return 'text-blue-600';
      case 'action':
        return 'text-green-600';
      case 'observation':
        return 'text-purple-600';
      case 'conclusion':
        return 'text-orange-600';
    }
  };

  return (
    <div className="space-y-2 text-sm">
      {steps.map((step, index) => (
        <div 
          key={index}
          className={`flex items-start gap-2 p-2 rounded-lg bg-gray-50 ${getColor(step.type)}`}
        >
          <div className="mt-1">
            {getIcon(step.type)}
          </div>
          <div>
            <div className="font-medium capitalize">{step.type}</div>
            <div className="text-gray-700">{step.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};