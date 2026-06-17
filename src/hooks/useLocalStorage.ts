import { useState, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  deserialize?: (raw: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return options?.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as T);
    } catch {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
      return initialValue;
    }
  });

  const setValue = useCallback(
    (valueOrUpdater: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof valueOrUpdater === 'function'
            ? (valueOrUpdater as (prev: T) => T)(prev)
            : valueOrUpdater;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch { /* QuotaExceededError 등 — 메모리 state는 유지 */ }
        return next;
      });
    },
    [key]
  );

  return [state, setValue];
}
