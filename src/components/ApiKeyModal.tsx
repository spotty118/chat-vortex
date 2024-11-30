import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { fetchModels } from "@/lib/api";
import { ExternalLink } from "lucide-react";

const API_KEY_LINKS: Record<string, string> = {
  openai: "https://platform.openai.com/api-keys",
  anthropic: "https://console.anthropic.com/account/keys",
  google: "https://makersuite.google.com/app/apikey",
  mistral: "https://console.mistral.ai/api-keys",
  openrouter: "https://openrouter.ai/keys",
  cohere: "https://dashboard.cohere.com/api-keys",
  cloudflare: "https://developers.cloudflare.com/ai-gateway/get-started/"
};

export const ApiKeyModal = ({ provider, open, onClose }: { 
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [apiKey, setApiKey] = useState("");
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (provider) {
      if (provider.id === 'cloudflare') {
        // Set the proxy URL for Cloudflare
        setGatewayUrl(process.env.NODE_ENV === 'production'
          ? 'https://preview--chat-vortex.lovable.app/api/cloudflare'
          : 'http://localhost:8081/api/cloudflare'
        );
      } else if (provider.id === 'google') {
        // Set the proxy URL for Google AI Studio
        setGatewayUrl(process.env.NODE_ENV === 'production'
          ? 'https://preview--chat-vortex.lovable.app/api/google'
          : 'http://localhost:8081/api/google'
        );
      }
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    if ((provider?.id === 'cloudflare' || provider?.id === 'google') && !gatewayUrl.trim()) {
      toast({
        title: "Error",
        description: `Please enter your ${provider.id} AI Gateway URL`,
        variant: "destructive",
      });
      return;
    }

    if (!provider) {
      toast({
        title: "Error",
        description: "No provider selected",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      localStorage.setItem(`${provider.id}_api_key`, apiKey.trim());
      if (provider.id === 'cloudflare' || provider.id === 'google') {
        localStorage.setItem(`${provider.id}_gateway_url`, gatewayUrl.trim());
      }
      console.log(`Saved API key for provider: ${provider.id}`);
      
      const models = await fetchModels(provider);
      console.log(`Fetched models for ${provider.id}:`, models);
      
      toast({
        title: "Success",
        description: "API key saved and models fetched successfully",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving API key or fetching models:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!provider) {
    return null;
  }

  const apiKeyLink = API_KEY_LINKS[provider.id];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-neutral-200">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <div>Enter your API key to start using {provider.name} models.</div>
              {apiKeyLink && (
                <div>
                  <a 
                    href={apiKeyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get your {provider.name} API key here
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              required
              autoComplete="new-password"
            />
          </div>
          {(provider.id === 'cloudflare' || provider.id === 'google') && (
            <div className="space-y-2">
              <Label htmlFor="gatewayUrl">Gateway URL</Label>
              <Input
                id="gatewayUrl"
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder={provider.id === 'cloudflare' ? 'http://localhost:8081/proxy/v1/fe45775498a97cb07c10d3f0d79cc2f0/big/openai' : 'http://localhost:8081/proxy/v1/google-gateway-url'}
                required
                readOnly={provider.id === 'cloudflare'} // Make it read-only since we're auto-setting it
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};