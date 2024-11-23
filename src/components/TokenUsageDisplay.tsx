import { TokenUsage } from '@/lib/types/ai';
import { Progress } from '@/components/ui/progress';

interface TokenUsageDisplayProps {
  usage: TokenUsage;
  maxTokens: number;
}

export const TokenUsageDisplay = ({ usage, maxTokens }: TokenUsageDisplayProps) => {
  const percentage = (usage.total_tokens / maxTokens) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Tokens Used: {usage.total_tokens}</span>
        <span>Max: {maxTokens}</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Prompt: {usage.prompt_tokens}</span>
        <span>Completion: {usage.completion_tokens}</span>
      </div>
    </div>
  );
};