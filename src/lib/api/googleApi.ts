import { APIError } from '../errors';
import type { ChatMessage } from '../types';

const PROXY_BASE = 'http://localhost:3001/api/google';

export const fetchGoogleModels = async (apiKey: string) => {
  console.log('Fetching Google AI models...');
  try {
    const response = await fetch(`${PROXY_BASE}/v1/models?key=${apiKey}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      throw new APIError(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched Google AI models:', data);
    
    // Transform the Google model format to match our expected format
    const transformedModels = data.models
      ?.filter((model: any) => model.name.includes('chat') || model.name.includes('gemini'))
      .map((model: any) => ({
        id: model.name.replace(/^models\//, ''),  // Remove 'models/' prefix if present
        name: model.displayName || model.name.split('/').pop(),
      })) || [];

    console.log('Transformed Google AI models:', transformedModels);
    return transformedModels;
  } catch (error) {
    console.error('Error fetching Google models:', error);
    throw error instanceof APIError ? error : new APIError('Failed to fetch models');
  }
};

export const sendGoogleMessage = async (
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal
) => {
  console.log('Sending message to Google AI...', { modelId, messages });
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{
        text: msg.content
      }]
    }));

    // Format the request according to Google's API requirements
    const requestBody = {
      contents: formattedMessages,  // Send the full conversation history
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Clean up the modelId by removing any extra "models/" prefix
    const cleanModelId = modelId.replace(/^models\//, '');
    
    const response = await fetch(
      `${PROXY_BASE}/v1/models/${cleanModelId}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal,
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', errorText);
      throw new APIError(`Failed to send message: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Google API Response:', data);

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new APIError('Invalid response format from Google AI');
    }

    return {
      message: data.candidates[0].content.parts[0].text,
      role: 'assistant',
      usage: {
        prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
        completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0
      }
    };
  } catch (error) {
    console.error('Error sending message to Google:', error);
    throw error instanceof APIError ? error : new APIError('Failed to send message');
  }
};