export type Provider = {
  id: string;
  name: string;
  logo: string;
  models: Model[];
  latency: number;
  tps: number;
  status: "online" | "maintenance" | "offline";
  icon?: React.ComponentType;
};

export type Model = {
  id: string;
  name: string;
  capabilities: ("chat" | "code" | "analysis" | "vision")[];
  tokenCost: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};