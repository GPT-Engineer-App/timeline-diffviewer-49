import { useState } from 'react';

const API_PROXY_URL = 'https://api-proxy.gpt-engineer.workers.dev';

async function proxyFetch(destination, method, headers = {}, body = undefined) {
  const response = await fetch(API_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination,
      method,
      headers,
      body,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const useAnthropicAPI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const callAnthropicAPI = async (currentContent, userPrompt) => {
    setIsLoading(true);
    try {
      const systemPrompt = `You must ONLY answer the new text, that will replace Current text.

Current text:
${currentContent}`;

      const response = await proxyFetch(
        'https://api.anthropic.com/v1/messages',
        'POST',
        {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ]
        }
      );

      if (response.content && response.content[0] && response.content[0].text) {
        return response.content[0].text;
      } else {
        throw new Error('Unexpected response format from Anthropic API');
      }
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, callAnthropicAPI };
};