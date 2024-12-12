import { MessageWithMetadata } from './types/ai';

export interface ThoughtStep {
  type: 'thought' | 'action' | 'observation' | 'conclusion';
  content: string;
}

export interface ChainOfThoughtResponse {
  finalAnswer: string;
  steps: ThoughtStep[];
}

export const chainOfThoughtPrompt = `Please break down your thinking process using the following steps:
1. Think about the question and identify key components
2. Plan your approach
3. Execute your plan step by step
4. Observe the results
5. Draw conclusions

Format your response as follows:
[Thought] Initial analysis of the question
[Action] Steps you're taking
[Observation] What you notice
[Conclusion] Your final answer

Keep each step clear and concise.`;

export const parseChainOfThought = (response: string): ChainOfThoughtResponse => {
  const steps: ThoughtStep[] = [];
  let finalAnswer = '';

  const lines = response.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('[Thought]')) {
      steps.push({
        type: 'thought',
        content: line.replace('[Thought]', '').trim()
      });
    } else if (line.startsWith('[Action]')) {
      steps.push({
        type: 'action',
        content: line.replace('[Action]', '').trim()
      });
    } else if (line.startsWith('[Observation]')) {
      steps.push({
        type: 'observation',
        content: line.replace('[Observation]', '').trim()
      });
    } else if (line.startsWith('[Conclusion]')) {
      const conclusion = line.replace('[Conclusion]', '').trim();
      steps.push({
        type: 'conclusion',
        content: conclusion
      });
      finalAnswer = conclusion;
    }
  }

  return {
    finalAnswer,
    steps
  };
};

export const enhanceMessageWithChainOfThought = (message: MessageWithMetadata): MessageWithMetadata => {
  if (message.role === 'user') {
    return {
      ...message,
      content: `${chainOfThoughtPrompt}\n\nQuestion: ${message.content}`
    };
  }
  return message;
};