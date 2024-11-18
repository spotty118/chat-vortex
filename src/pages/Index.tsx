import { useState } from "react";
import { providers } from "@/lib/providers";
import { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/ProviderCard";
import { LatencyStats } from "@/components/LatencyStats";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Chat } from "@/components/Chat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Code, Wand } from "lucide-react";

const Index = () => {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [configureProvider, setConfigureProvider] = useState<Provider | null>(
    null
  );

  const handleProviderSelect = (provider: Provider) => {
    setActiveProvider(provider);
  };

  const handleProviderSettings = (provider: Provider) => {
    setConfigureProvider(provider);
  };

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">AI Chat Dashboard</h1>
        <p className="text-neutral-light">
          Select a provider to start chatting with AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {activeProvider && (
        <div className="space-y-6">
          <LatencyStats providerId={activeProvider.id} />

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="glass-card">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="creative" className="flex items-center gap-2">
                <Wand className="w-4 h-4" />
                Creative
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat">
              <Chat provider={activeProvider} />
            </TabsContent>
            <TabsContent value="code">
              <div className="text-center p-8 text-neutral-light">
                Code Assistant coming soon
              </div>
            </TabsContent>
            <TabsContent value="creative">
              <div className="text-center p-8 text-neutral-light">
                Creative Tools coming soon
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <ApiKeyModal
        provider={configureProvider!}
        open={!!configureProvider}
        onClose={() => setConfigureProvider(null)}
      />
    </div>
  );
};

export default Index;