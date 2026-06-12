import { useState, useEffect } from "preact/hooks";
import type { Dispatch, StateUpdater } from "preact/hooks";

export const usePersistedState = <S>(
  key: string,
  initialValue: S,
): [S, Dispatch<StateUpdater<S>>] => {
  const storageValue = getFromStorage(key, initialValue);
  const [value, setValue] = useState(storageValue);

  useEffect(() => {
    putInStorage(key, value);
  }, [value]);
  return [value, setValue];
};

const canUseStorage = typeof localStorage !== "undefined";

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (!canUseStorage) {
    return defaultValue;
  }
  const valueRaw = localStorage.getItem(key);
  let value = defaultValue;
  if (valueRaw) {
    try {
      value = JSON.parse(valueRaw);
    } catch {}
  }
  return value;
};

const putInStorage = <T>(key: string, value: T): void => {
  if (!canUseStorage) {
    return;
  }
  const valueRaw = JSON.stringify(value);
  localStorage.setItem(key, valueRaw);
};
