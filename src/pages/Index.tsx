import { useState } from "react";
import { providers } from "@/lib/providers";
import { Provider } from "@/lib/types";
import { ProviderCard } from "@/components/ProviderCard";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { AttachmentModal } from "@/components/AttachmentModal";
import { Chat } from "@/components/Chat";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

const Index = () => {
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [configureProvider, setConfigureProvider] = useState<Provider | null>(null);
  const [attachmentProvider, setAttachmentProvider] = useState<Provider | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { theme, setTheme } = useTheme();

  const handleAttachmentUpload = (files: File[]) => {
    setAttachments(files);
  };

  return (
    <div className="h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Chat Vortex</h1>
          </div>
          <div className="flex-1" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-3.5rem)] p-4">
        <ResizablePanelGroup direction="horizontal" className="fade-in">
          {/* Left Panel - Provider List */}
          <ResizablePanel 
            defaultSize={20} 
            minSize={15}
            maxSize={30}
            className="min-w-[250px]"
          >
            <div className="flex h-full flex-col">
              <h2 className="px-4 text-lg font-semibold mb-4">Providers</h2>
              <ScrollArea className="flex-1">
                <div className="space-y-2 px-2">
                  {providers.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      isActive={activeProvider?.id === provider.id}
                      onSelect={() => setActiveProvider(provider)}
                      onConfigure={() => setConfigureProvider(provider)}
                      onAttachment={() => setAttachmentProvider(provider)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border" />

          {/* Right Panel - Chat */}
          <ResizablePanel defaultSize={80}>
            <div className="h-full rounded-lg border bg-card text-card-foreground shadow-sm">
              {activeProvider ? (
                <Chat 
                  provider={activeProvider} 
                  attachments={attachments}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-muted-foreground">
                  <MessageSquare className="h-12 w-12" />
                  <h3 className="text-lg font-medium">Select a provider to start chatting</h3>
                  <p className="text-sm">Choose from the available AI providers on the left</p>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <ApiKeyModal
        provider={configureProvider}
        open={!!configureProvider}
        onClose={() => setConfigureProvider(null)}
      />

      <AttachmentModal
        provider={attachmentProvider}
        open={!!attachmentProvider}
        onClose={() => setAttachmentProvider(null)}
        onUpload={handleAttachmentUpload}
      />
    </div>
  );
};

export default function IndexPage() {
  return (
    <ThemeProvider>
      <Index />
    </ThemeProvider>
  );
}