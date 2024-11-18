import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Provider } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

interface ApiKeyModalProps {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
}

export const ApiKeyModal = ({ provider, open, onClose }: ApiKeyModalProps) => {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
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

    try {
      localStorage.setItem(`${provider.id}_api_key`, apiKey.trim());
      console.log(`Saved API key for provider: ${provider.id}`);
      
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
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
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};