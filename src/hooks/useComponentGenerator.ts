import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { useLocalStorage } from './useLocalStorage';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

function deserializeComponents(raw: string): GeneratedComponent[] {
  const parsed = JSON.parse(raw) as Array<Omit<GeneratedComponent, 'createdAt'> & { createdAt: string }>;
  return parsed.map((c) => ({ ...c, createdAt: new Date(c.createdAt) }));
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useLocalStorage<GeneratedComponent[]>(
    'rcg_components',
    [],
    { deserialize: deserializeComponents }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate component');
      }

      const newComponent: GeneratedComponent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        code: data.code,
        createdAt: new Date(),
      };

      setComponents((prev) => [newComponent, ...prev]);
      setCurrentIndex(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    const removedIndex = components.findIndex((c) => c.id === id);
    setComponents((prev) => prev.filter((c) => c.id !== id));
    if (removedIndex !== -1) {
      const newLength = components.length - 1;
      if (newLength === 0) {
        setCurrentIndex(0);
      } else if (removedIndex < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (removedIndex === currentIndex && currentIndex >= newLength) {
        setCurrentIndex(newLength - 1);
      }
    }
  }, [components, currentIndex]);

  const clearAll = useCallback(() => {
    setComponents([]);
    setCurrentIndex(0);
  }, []);

  return { components, isLoading, error, currentIndex, setCurrentIndex, generate, removeComponent, clearAll };
}
