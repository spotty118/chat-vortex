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

interface ApiKeyModalProps {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
}

export const ApiKeyModal = ({ provider, open, onClose }: ApiKeyModalProps) => {
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
      // Save API key
      localStorage.setItem(`${provider.id}_api_key`, apiKey.trim());
      console.log(`Saved API key for provider: ${provider.id}`);
      
      // Fetch available models
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Configure {provider.name}</DialogTitle>
          <DialogDescription>
            Enter your API key to start using {provider.name} models. 
            Your API key will be stored securely in your browser.
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