import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(
  key: string | null | undefined,
  initialValue: T
) {
  const initialValueRef = useRef(initialValue);

  const readStorageValue = useCallback((storageKey: string): T => {
    try {
      const item = window.localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialValueRef.current;
    } catch (error) {
      console.error(error);
      return initialValueRef.current;
    }
  }, []);

  const [value, setValue] = useState<T>(() => {
    if (!key || typeof window === 'undefined') {
      return initialValueRef.current;
    }

    return readStorageValue(key);
  });

  const [loadedKey, setLoadedKey] = useState(() => typeof window === 'undefined' ? null : key);

  useEffect(() => {
    if (!key || typeof window === 'undefined') {
      setValue(initialValueRef.current);
      setLoadedKey(null);
      return;
    }

    setValue(readStorageValue(key));
    setLoadedKey(key);
  }, [key, readStorageValue]);

  const setStoredValue = useCallback((nextValue: T | ((prevValue: T) => T)) => {
    setValue((prevValue) => {
      const valueToStore =
        nextValue instanceof Function ? nextValue(prevValue) : nextValue;

      try {
        if (key && typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }

      return valueToStore;
    });
  }, [key]);

  return { value, setStoredValue, isStorageReady: Boolean(key) && loadedKey === key };
}
