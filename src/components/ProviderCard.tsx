import { Provider, ProviderFeatures } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Bot, ChevronRight, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: Provider;
  isActive: boolean;
  onSelect: (provider: Provider) => void;
  onConfigure: (provider: Provider) => void;
  onAttachment?: (provider: Provider) => void;
}

export const ProviderCard = ({
  provider,
  isActive,
  onSelect,
  onConfigure,
  onAttachment,
}: ProviderCardProps) => {
  const getStatusConfig = (status: Provider["status"]) => {
    const configs = {
      online: {
        color: "bg-emerald-500",
        shadow: "shadow-emerald-500/20",
        text: "Operational"
      },
      maintenance: {
        color: "bg-yellow-500",
        shadow: "shadow-yellow-500/20",
        text: "Under Maintenance"
      },
      offline: {
        color: "bg-red-500",
        shadow: "shadow-red-500/20",
        text: "Offline"
      }
    };
    return configs[status];
  };

  const hasAttachmentSupport = (provider: Provider) => {
    return provider.models.some((model) => model.capabilities.includes("attachments"));
  };

  const statusConfig = getStatusConfig(provider.status);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border hover:border-primary/50",
        isActive ? [
          "ring-2 ring-primary shadow-lg",
          "before:absolute before:inset-0 before:bg-gradient-to-r",
          "before:from-primary/5 before:to-transparent before:opacity-50"
        ] : [
          "hover:shadow-md hover:translate-y-[-2px]",
          "hover:bg-background/80"
        ]
      )}
    >
      <div
        className={cn(
          "relative transition-all duration-300",
          "hover:bg-muted/20"
        )}
      >
        <div
          className={cn(
            "p-4 transition-all duration-300",
            !isActive && "py-3"
          )}
        >
          <div 
            className="flex items-center justify-between cursor-pointer group/card"
            onClick={() => onSelect(provider)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl overflow-hidden",
                "flex items-center justify-center",
                "bg-white/10 backdrop-blur-sm",
                "ring-1 ring-white/10",
                "transition-transform duration-300",
                "group-hover/card:scale-110"
              )}>
                <img
                  src={provider.logo}
                  alt={`${provider.name} logo`}
                  className="w-7 h-7 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><path d="M12 4h4"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 8h20"/><path d="M12 12v4"/></svg>'
                    )}`;
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-semibold tracking-tight",
                    "transition-colors duration-300",
                    "group-hover/card:text-primary"
                  )}>
                    {provider.name}
                  </h3>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground/50",
                    "transition-all duration-300",
                    "group-hover/card:translate-x-1",
                    "group-hover/card:text-primary"
                  )} />
                </div>
                {isActive && (
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        statusConfig.color,
                        "shadow-lg",
                        statusConfig.shadow,
                        "animate-pulse"
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      {statusConfig.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {isActive && (
              <div className="flex items-center gap-2">
                {hasAttachmentSupport(provider) && onAttachment && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAttachment(provider);
                    }}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                )}
                {onConfigure && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigure(provider);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {isActive && (
          <div className="px-4 pb-4 pt-1 space-y-4">
            <div className="space-y-3">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {provider.description}
                </p>
                {provider.features && Object.keys(provider.features).some(key => provider.features[key as keyof ProviderFeatures]) && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(provider.features)
                      .filter(([_, value]) => value)
                      .map(([feature]) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className={cn(
                            "bg-muted/50 text-xs",
                            "hover:bg-primary/20 hover:text-primary"
                          )}
                        >
                          {feature}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};