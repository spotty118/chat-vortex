import { Provider } from "../types";
import { openaiProvider } from "./openai";
import { googleProvider } from "./google";
import { anthropicProvider } from "./anthropic";
import { mistralProvider } from "./mistral";
import { openrouterProvider } from "./openrouter";
import { cohereProvider } from "./cohere";

export const providers: Provider[] = [
  openaiProvider,
  googleProvider,
  anthropicProvider,
  mistralProvider,
  openrouterProvider,
  cohereProvider
];