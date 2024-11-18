import { Provider } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

interface ProviderCardProps {
  provider: Provider;
  isActive: boolean;
  onSelect: (provider: Provider) => void;
  onSettings: (provider: Provider) => void;
}

export const ProviderCard = ({
  provider,
  isActive,
  onSelect,
  onSettings,
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
      className={`glass-card p-4 transition-all duration-300 ${
        isActive ? "ring-2 ring-electric" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
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
              <span className="text-sm text-gray-500 capitalize">
                {provider.status}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSettings(provider)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
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
          className="w-full"
          variant={isActive ? "secondary" : "default"}
          onClick={() => onSelect(provider)}
        >
          {isActive ? "Selected" : "Select Provider"}
        </Button>
      </div>
    </Card>
  );
};