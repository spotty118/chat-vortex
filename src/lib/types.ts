export type Provider = {
  id: string;
  name: string;
  logo: string;
  models: Model[];
  status: "online" | "maintenance" | "offline";
  icon?: React.ComponentType;
  latency: number;
  tps: number;
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