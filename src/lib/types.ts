export type Provider = {
  id: string;
  name: string;
  logo: string;
  models: Model[];
  latency: number;
  tps: number;
  status: "online" | "maintenance" | "offline";
};

export type Model = {
  id: string;
  name: string;
  capabilities: string[];
  tokenCost: number;
};

export type LatencyStats = {
  current: number;
  average: number;
  tps: number;
};