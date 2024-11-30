export * from './base';
export * from './openai';
export * from './anthropic';
export * from './google';

import { VercelOpenAIProvider } from './openai';
import { VercelAnthropicProvider } from './anthropic';
import { VercelGoogleProvider } from './google';

export const providers = {
  openai: new VercelOpenAIProvider(),
  anthropic: new VercelAnthropicProvider(),
  google: new VercelGoogleProvider(),
};