import { Provider } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: Provider;
  isActive: boolean;
  onSelect: (provider: Provider) => void;
  onConfigure: (provider: Provider) => void;
}

export const ProviderCard = ({
  provider,
  isActive,
  onSelect,
  onConfigure,
}: ProviderCardProps) => {
  const getStatusColor = (status: Provider["status"]) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "maintenance":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
    }
  };

  return (
    <Card
      className={cn(
        "bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:bg-background/80",
        isActive ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/20"
      )}
    >
      <div className={cn(
        "transition-all duration-300",
        !isActive && "hover:bg-muted/50"
      )}>
        <div className={cn(
          "p-4",
          !isActive && "py-2"
        )}>
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => onSelect(provider)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-sm">
                <img
                  src={provider.logo}
                  alt={`${provider.name} logo`}
                  className="w-6 h-6 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><path d="M12 4h4"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 8h20"/><path d="M12 12v4"/></svg>'
                    )}`;
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold">{provider.name}</h3>
                {isActive && (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        getStatusColor(provider.status)
                      )}
                    />
                    <span className="text-xs text-muted-foreground capitalize">
                      {provider.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {isActive && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure(provider);
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isActive && (
          <div className="px-4 pb-4 pt-1">
            <div className="space-y-3">
              <div className="grid gap-1">
                {provider.models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between"
                  >
                    <div className="grid gap-0.5">
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="flex items-center gap-2">
                        {model.capabilities.map((capability) => (
                          <Badge
                            key={capability}
                            variant="secondary"
                            className="text-xs"
                          >
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ${model.tokenCost.toFixed(3)}/1k tokens
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid gap-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span>{provider.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens per Second</span>
                  <span>{provider.tps}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};