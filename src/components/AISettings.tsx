import { AIMetadata } from '@/lib/types/ai';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AISettingsProps {
  settings: AIMetadata;
  onUpdate: (settings: Partial<AIMetadata>) => void;
}

export const AISettings = ({ settings, onUpdate }: AISettingsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Temperature ({settings.temperature})</Label>
            <Slider
              value={[settings.temperature || 0.7]}
              min={0}
              max={2}
              step={0.1}
              onValueChange={([value]) => onUpdate({ temperature: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Max Tokens ({settings.maxTokens})</Label>
            <Slider
              value={[settings.maxTokens || 2000]}
              min={100}
              max={4000}
              step={100}
              onValueChange={([value]) => onUpdate({ maxTokens: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Top P ({settings.topP})</Label>
            <Slider
              value={[settings.topP || 1]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => onUpdate({ topP: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Frequency Penalty ({settings.frequencyPenalty})</Label>
            <Slider
              value={[settings.frequencyPenalty || 0]}
              min={-2}
              max={2}
              step={0.1}
              onValueChange={([value]) => onUpdate({ frequencyPenalty: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Presence Penalty ({settings.presencePenalty})</Label>
            <Slider
              value={[settings.presencePenalty || 0]}
              min={-2}
              max={2}
              step={0.1}
              onValueChange={([value]) => onUpdate({ presencePenalty: value })}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};