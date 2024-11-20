import { Provider } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
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
        return "bg-emerald";
      case "maintenance":
        return "bg-yellow-500";
      case "offline":
        return "bg-red-500";
    }
  };

  return (
    <Card
      className={`bg-background/60 backdrop-blur-sm border transition-all duration-300 hover:bg-background/80 ${
        isActive ? "ring-2 ring-electric" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={provider.logo}
              alt={provider.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{provider.name}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${getStatusColor(
                    provider.status
                  )}`}
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {provider.status}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onConfigure(provider)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {provider.models.map((model) => (
            <Badge
              key={model.id}
              variant="secondary"
              className="text-xs"
            >
              {model.name}
            </Badge>
          ))}
        </div>

        <Button
          variant={isActive ? "secondary" : "default"}
          className={cn(
            "w-full transition-all",
            !isActive && "h-12 overflow-hidden"
          )}
          onClick={() => onSelect(provider)}
        >
          {isActive ? (
            <>
              {/* Existing content */}
            </>
          ) : (
            <div className="flex items-center gap-2">
              {provider.icon && <div className="h-5 w-5">{<provider.icon />}</div>}
              <span>{provider.name}</span>
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
};