import { HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModelSelectorProps {
  selectedModel: string;
  availableModels: any[];
  onModelSelect: (modelId: string) => void;
}

export const ModelSelector = ({
  selectedModel,
  availableModels,
  onModelSelect,
}: ModelSelectorProps) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-neutral-900">Select Model</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground/70 hover:text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Pricing shown per 1,000 tokens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-4 items-start">
        <Select
          value={selectedModel}
          onValueChange={onModelSelect}
        >
          <SelectTrigger className="w-[300px] bg-white/95 backdrop-blur-sm border-neutral-200 hover:bg-white/98 transition-colors">
            <SelectValue placeholder="Choose a model" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] w-[300px] bg-white/98 backdrop-blur-sm border-neutral-200 shadow-lg divide-y divide-neutral-100">
            {availableModels.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id}
                className="py-4 px-4 hover:bg-neutral-50 focus:bg-neutral-50 cursor-pointer"
              >
                <span className="font-medium text-[0.925rem] leading-snug text-neutral-900">
                  {model.name || model.id}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Pricing information moved outside */}
        {availableModels.find(m => m.id === selectedModel)?.pricing && (
          <div className="text-[0.75rem] text-neutral-500 pt-2.5">
            <span>P: ${availableModels.find(m => m.id === selectedModel)?.pricing?.prompt}</span>
            {" · "}
            <span>C: ${availableModels.find(m => m.id === selectedModel)?.pricing?.completion}</span>
          </div>
        )}
      </div>
    </div>
  );
};