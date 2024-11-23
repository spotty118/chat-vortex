import { useState } from "react";
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
  cohere: "https://dashboard.cohere.com/api-keys"
};

export const ApiKeyModal = ({ provider, open, onClose }: { 
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setSaving] = useState(false);
  const { toast } = useToast();

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

    if (!provider) {
      toast({
        title: "Error",
        description: "No provider selected",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      localStorage.setItem(`${provider.id}_api_key`, apiKey.trim());
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
        description: error instanceof Error ? error.message : "Failed to save API key",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
          <DialogDescription className="space-y-2">
            <p>Enter your API key to start using {provider.name} models.</p>
            {apiKeyLink && (
              <p>
                <a 
                  href={apiKeyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get your {provider.name} API key here
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
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
            />
          </div>
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