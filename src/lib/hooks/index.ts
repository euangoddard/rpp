import { useState, useEffect, StateUpdater } from "preact/hooks";

export const usePersistedState = <S>(
  key: string,
  initialValue: S
): [S, StateUpdater<S>] => {
  const storageValue = getFromStorage(key, initialValue);
  const [value, setValue] = useState(storageValue);

  useEffect(() => {
    putInStorage(key, value);
  }, [value]);
  return [value, setValue];
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
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
  const valueRaw = JSON.stringify(value);
  localStorage.setItem(key, valueRaw);
};
