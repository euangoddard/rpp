import { useEffect, useRef, useState } from "preact/hooks";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  ReplayIcon,
  StopIcon,
} from "./icons";

const methodId = "method";
const readingAttribute = "data-reading";

interface Step {
  element: HTMLLIElement;
  /** The sub-heading the step sits under, when the method is split into parts. */
  group: string | null;
  /** The number shown beside the step — each list in the method counts from 1. */
  number: number;
  /** How many steps share the step's list. */
  count: number;
  text: string;
}

/**
 * While cooking, read the method out one step at a time so it can be followed
 * without touching the screen with floury hands more than necessary: a tap to
 * hear a step, a tap to move on, and a picker to jump straight to any step.
 */
export default function MethodReader() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [index, setIndex] = useState(0);
  const [spokenIndex, setSpokenIndex] = useState<number | null>(null);
  const [isSpeaking, speak, stop] = useSpeech();

  useEffect(() => {
    setSteps(collectSteps());
  }, []);

  // Mark and bring into view the step being read, once reading has started.
  useEffect(() => {
    const step = spokenIndex === null ? undefined : steps[index];
    if (!step) {
      return;
    }
    step.element.setAttribute(readingAttribute, "");
    revealStep(step.element);
    return () => step.element.removeAttribute(readingAttribute);
  }, [steps, index, spokenIndex]);

  const current = steps[index];
  if (!current) {
    return null;
  }

  const hasGroups = steps.some((step) => step.group !== null);

  const readStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step) {
      return;
    }
    setIndex(stepIndex);
    setSpokenIndex(stepIndex);
    speak(spokenText(step, steps[stepIndex - 1]));
  };

  const isLast = index === steps.length - 1;
  const hasSpokenCurrent = spokenIndex === index;

  return (
    <section
      class="border-line bg-paper pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border py-2.5 ps-4 pe-2.5 shadow-lg shadow-black/15"
      aria-label="Read the method aloud"
      data-method-reader
    >
      <span
        class="font-display text-accent w-7 shrink-0 text-center text-[1.75rem] leading-none font-medium tabular-nums"
        aria-hidden="true"
      >
        {current.number}
      </span>
      <div class="min-w-0 flex-1">
        <p class="meta-label truncate text-[0.6875rem] leading-4">
          {current.group ?? "Method"}
        </p>
        <label class="hover:text-accent relative flex cursor-pointer items-center gap-1 text-sm font-medium">
          <span class="truncate">
            Step {current.number} of {current.count}
          </span>
          <ChevronDownIcon class="text-ink-soft size-3.5 shrink-0" />
          <select
            class="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Jump to a step"
            value={index}
            onChange={(e) =>
              readStep(Number((e.target as HTMLSelectElement).value))
            }
          >
            {hasGroups
              ? groupSteps(steps).map(({ label, entries }) => (
                  <optgroup label={label}>
                    {entries.map(([step, stepIndex]) => (
                      <StepOption step={step} index={stepIndex} />
                    ))}
                  </optgroup>
                ))
              : steps.map((step, stepIndex) => (
                  <StepOption step={step} index={stepIndex} />
                ))}
          </select>
        </label>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          class={iconButton}
          aria-label="Previous step"
          disabled={index === 0}
          onClick={() => readStep(index - 1)}
        >
          <ChevronLeftIcon class="size-5" />
        </button>
        <button
          type="button"
          class="bg-accent text-paper hover:bg-accent-deep flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors"
          aria-label={
            isSpeaking
              ? "Stop reading"
              : `${hasSpokenCurrent ? "Replay" : "Read"} step ${current.number}`
          }
          onClick={() => (isSpeaking ? stop() : readStep(index))}
        >
          {isSpeaking ? (
            <StopIcon class="size-4" />
          ) : hasSpokenCurrent ? (
            <ReplayIcon class="size-5" />
          ) : (
            <PlayIcon class="size-5 translate-x-px" />
          )}
        </button>
        <button
          type="button"
          class={iconButton}
          aria-label="Next step"
          disabled={isLast}
          onClick={() => readStep(index + 1)}
        >
          <ChevronRightIcon class="size-5" />
        </button>
      </div>
    </section>
  );
}

const iconButton =
  "text-ink-soft hover:bg-paper-deep hover:text-ink flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent";

const StepOption = ({ step, index }: { step: Step; index: number }) => (
  <option value={index}>
    {step.number}. {truncate(step.text, 48)}
  </option>
);

/** Whether this device can read the method aloud at all. */
export const canReadAloud = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Gather the numbered steps of the method, noting the sub-heading each falls
 * under so a method split into parts ("For the sauce", …) reads naturally.
 */
const collectSteps = (): Step[] => {
  const heading = document.getElementById(methodId);
  const steps: Step[] = [];
  let group: string | null = null;

  for (
    let node = heading?.nextElementSibling;
    node && node.tagName !== "H2";
    node = node.nextElementSibling
  ) {
    if (/^H[3-6]$/.test(node.tagName)) {
      group = normalise(node.textContent);
    } else if (node.tagName === "OL") {
      const items = [...node.children].filter(
        (child): child is HTMLLIElement => child.tagName === "LI",
      );
      items.forEach((element, i) => {
        steps.push({
          element,
          group,
          number: i + 1,
          count: items.length,
          text: normalise(element.textContent),
        });
      });
    }
  }

  return steps;
};

const groupSteps = (steps: Step[]) => {
  const groups: { label: string; entries: [Step, number][] }[] = [];
  steps.forEach((step, i) => {
    const label = step.group ?? "Method";
    const last = groups.at(-1);
    if (last?.label === label) {
      last.entries.push([step, i]);
    } else {
      groups.push({ label, entries: [[step, i]] });
    }
  });
  return groups;
};

/** Announce the part of the method when a step opens a new one. */
const spokenText = (step: Step, previous: Step | undefined) => {
  const opensGroup = step.group !== null && step.group !== previous?.group;
  return [opensGroup && `${step.group}.`, `Step ${step.number}.`, step.text]
    .filter(Boolean)
    .join(" ");
};

const normalise = (text: string | null) =>
  (text ?? "").replace(/\s+/g, " ").trim();

const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;

/**
 * Scroll the step clear of the pinned ingredients above and this widget below,
 * leaving the page alone if it is already in full view.
 */
const revealStep = (element: HTMLElement) => {
  const gap = 16;
  const top =
    (document
      .querySelector("[data-pinned-ingredients]")
      ?.getBoundingClientRect().bottom ?? 0) + gap;
  const bottom =
    (document.querySelector("[data-method-reader]")?.getBoundingClientRect()
      .top ?? innerHeight) - gap;
  const rect = element.getBoundingClientRect();
  if (rect.top >= top && rect.bottom <= bottom) {
    return;
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollBy({
    top: rect.top - top,
    behavior: reduceMotion ? "auto" : "smooth",
  });
};

/**
 * Speak text with the Web Speech API. The text is queued a sentence at a time,
 * as some engines (Chrome especially) cut long utterances off part way through.
 */
const useSpeech = (): [boolean, (text: string) => void, () => void] => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Cancelling fires `end`/`error` on the utterances it discards; only the
  // latest request may report that speech has finished.
  const request = useRef(0);

  const stop = () => {
    request.current++;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speak = (text: string) => {
    const id = ++request.current;
    const finish = () => {
      if (id === request.current) {
        setIsSpeaking(false);
      }
    };

    speechSynthesis.cancel();
    const sentences = splitSentences(text);
    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = document.documentElement.lang || navigator.language;
      utterance.onerror = finish;
      if (i === sentences.length - 1) {
        utterance.onend = finish;
      }
      speechSynthesis.speak(utterance);
    });
    setIsSpeaking(true);
  };

  // Don't carry on talking once cooking mode is switched off.
  useEffect(() => {
    addEventListener("pagehide", stop);
    return () => {
      removeEventListener("pagehide", stop);
      request.current++;
      speechSynthesis.cancel();
    };
  }, []);

  return [isSpeaking, speak, stop];
};

const splitSentences = (text: string): string[] => {
  if (typeof Intl.Segmenter !== "function") {
    return [text];
  }
  const segmenter = new Intl.Segmenter(document.documentElement.lang || "en", {
    granularity: "sentence",
  });
  return [...segmenter.segment(text)]
    .map(({ segment }) => segment.trim())
    .filter(Boolean);
};
