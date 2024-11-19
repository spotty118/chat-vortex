import { APIError } from '../errors';
import type { ChatMessage } from '../types';

const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1';

export const fetchGoogleModels = async (apiKey: string) => {
  console.log('Fetching Google AI models...');
  try {
    // Google requires API key as a query parameter
    const response = await fetch(`${GOOGLE_API_BASE}/models?key=${apiKey}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Google AI models:', data);
    
    // Filter for only the chat models
    return data.models?.filter((model: any) => 
      model.name.includes('chat') || model.name.includes('gemini')
    ) || [];
  } catch (error) {
    console.error('Error fetching Google models:', error);
    throw error instanceof APIError ? error : new APIError('Failed to fetch models');
  }
};

export const sendGoogleMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[]
) => {
  console.log('Sending message to Google AI...', { modelId });
  try {
    const response = await fetch(
      `${GOOGLE_API_BASE}/models/${modelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
          }))
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Google AI Response:', data);

    return {
      message: data.candidates[0].content.parts[0].text,
      usage: data.usage
    };
  } catch (error) {
    console.error('Error sending message to Google:', error);
    throw error instanceof APIError ? error : new APIError('Failed to send message');
  }
};