import { useState, useEffect } from "preact/hooks";
import * as styles from "./CookMode.module.css";

const cookingClass = "recipe__cooking";

export default function CookMode() {
  const [isCooking, setIsCooking] = useState<boolean>(false);
  const [canWakeLock, isWakeLocked, setWakeLock] = useWakeLock();

  useEffect(() => {
    const method = isCooking ? "add" : "remove";
    setWakeLock(isCooking);
    document.body.classList[method](cookingClass);
  }, [isCooking]);

  useEffect(() => {
    if (!isWakeLocked && isCooking) {
      setIsCooking(false);
    }
  }, [isWakeLocked]);

  return (
    canWakeLock && (
      <aside class={styles.cookMode}>
        <label class={styles.label}>
          <input
            type="checkbox"
            checked={isCooking}
            onChange={(e) => setIsCooking(e.target.checked)}
          />
          Cooking mode
        </label>
      </aside>
    )
  );
}

const useWakeLock = (): [
  boolean,
  boolean,
  (shouldLock: boolean) => Promise<void>
] => {
  const [canWakeLock, setCanWakeLock] = useState(false);
  const [wakeLock, storeWakeLock] = useState<WakeLockSentinel | null>(null);

  const handleVisibilityChange = () => {
    if (wakeLock !== null && document.visibilityState === "visible") {
      setWakeLock(true);
    }
  };

  useEffect(() => {
    setCanWakeLock("wakeLock" in navigator);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  const setWakeLock = async (shouldLock: boolean) => {
    if (!canWakeLock) {
      return;
    }

    if (shouldLock) {
      try {
        const newWakeLock = await navigator.wakeLock.request("screen");
        newWakeLock.addEventListener("release", () => {
          storeWakeLock(null);
        });
        storeWakeLock(newWakeLock);
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    } else if (wakeLock) {
      await wakeLock.release();
      storeWakeLock(null);
    }
  };

  return [canWakeLock, wakeLock !== null, setWakeLock];
};
