import { useState } from "react";
import { providers } from "@/lib/providers";
import { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/ProviderCard";
import { LatencyStats } from "@/components/LatencyStats";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Chat } from "@/components/Chat";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

const Index = () => {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [configureProvider, setConfigureProvider] = useState<Provider | null>(null);

  const handleProviderSelect = (provider: Provider) => {
    setActiveProvider(provider);
  };

  const handleProviderSettings = (provider: Provider) => {
    setConfigureProvider(provider);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-sapphire to-amethyst p-4">
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-2rem)] rounded-lg border">
        {/* Left Panel - Provider Selection */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
          <div className="h-full flex flex-col bg-background/50 backdrop-blur-lg">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Providers
              </h2>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    isActive={activeProvider?.id === provider.id}
                    onSelect={handleProviderSelect}
                    onSettings={handleProviderSettings}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Chat and Stats */}
        <ResizablePanel defaultSize={75}>
          <div className="h-full flex flex-col bg-background/50 backdrop-blur-lg">
            {activeProvider ? (
              <>
                <div className="p-4 border-b">
                  <LatencyStats providerId={activeProvider.id} />
                </div>
                <div className="flex-1 p-4">
                  <Chat provider={activeProvider} />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a provider to start chatting
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ApiKeyModal
        provider={configureProvider}
        open={!!configureProvider}
        onClose={() => setConfigureProvider(null)}
      />
    </div>
  );
};

export default Index;