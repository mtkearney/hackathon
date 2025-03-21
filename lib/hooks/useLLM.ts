import { useState } from 'react';

interface UseLLMProps {
  endpoint: string;
}

interface UseLLMReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (payload: any) => Promise<void>;
}

export function useLLM<T>({ endpoint }: UseLLMProps): UseLLMReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (payload: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/llm/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response from the LLM service');
      }
      
      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      console.error(`Error calling LLM ${endpoint} endpoint:`, err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}

// Specialized hooks for specific LLM functions
export function useSchemaGenerator() {
  return useLLM<any>({ endpoint: 'schema' });
}

export function useAppStructureGenerator() {
  return useLLM<any>({ endpoint: 'app-structure' });
}

export function useTechStackGenerator() {
  return useLLM<any>({ endpoint: 'tech-stack' });
}

export function useFeatureTreeGenerator() {
  return useLLM<any>({ endpoint: 'feature-tree' });
}
