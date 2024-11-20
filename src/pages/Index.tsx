import { useState } from "react";
import { providers } from "@/lib/providers";
import { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/ProviderCard";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Chat } from "@/components/Chat";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

const Index = () => {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [configureProvider, setConfigureProvider] = useState<Provider | null>(null);

  return (
    <div className="h-screen p-4">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Panel - Provider List */}
        <ResizablePanel defaultSize={25}>
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isActive={activeProvider?.id === provider.id}
                  onSelect={() => setActiveProvider(provider)}
                  onConfigure={() => setConfigureProvider(provider)}
                />
              ))}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Chat */}
        <ResizablePanel defaultSize={75}>
          <div className="h-full flex flex-col bg-white">
            {activeProvider ? (
              <div className="flex-1 p-4">
                <Chat provider={activeProvider} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
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