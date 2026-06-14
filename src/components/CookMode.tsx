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
        class={`pointer-events-auto flex cursor-pointer items-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium shadow-lg shadow-black/15 transition-[max-width,background-color] duration-300 select-none ${
          isCooking
            ? "bg-accent-deep text-paper max-w-[22rem]"
            : "bg-accent text-paper hover:bg-accent-deep max-w-[12rem]"
        }`}
      >
        <input
          type="checkbox"
          class="sr-only"
          checked={isCooking}
          onChange={(e) => setIsCooking((e.target as HTMLInputElement).checked)}
        />
        <div
          class={`relative h-5 w-9 rounded-full transition-colors duration-300 ${isCooking ? "bg-paper/40" : "bg-paper/20"}`}
        >
          <div
            class={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-paper shadow-sm transition-transform duration-300 ${isCooking ? "translate-x-4" : "translate-x-0"}`}
          />
        </div>
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
