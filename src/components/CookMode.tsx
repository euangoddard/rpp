import { useEffect, useState } from "preact/hooks";

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

  if (!canWakeLock) {
    return null;
  }

  return (
    <aside
      class="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center"
      data-hide-in-print
    >
      <label
        class={`pointer-events-auto flex cursor-pointer items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg shadow-black/15 transition-colors select-none ${
          isCooking
            ? "bg-accent-deep text-paper"
            : "bg-accent text-paper hover:bg-accent-deep"
        }`}
      >
        <input
          type="checkbox"
          class="accent-paper size-4"
          checked={isCooking}
          onChange={(e) => setIsCooking((e.target as HTMLInputElement).checked)}
        />
        {isCooking ? "Cooking — screen will stay awake" : "Cooking mode"}
      </label>
    </aside>
  );
}

const useWakeLock = (): [
  boolean,
  boolean,
  (shouldLock: boolean) => Promise<void>,
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
        console.error(err);
      }
    } else if (wakeLock) {
      await wakeLock.release();
      storeWakeLock(null);
    }
  };

  return [canWakeLock, wakeLock !== null, setWakeLock];
};
