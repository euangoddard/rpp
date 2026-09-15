import { useEffect, useRef, useState } from "preact/hooks";
import { usePersistedState } from "../lib/hooks";
import { ChevronDownIcon } from "./icons";

const ingredientsId = "ingredients";
const methodId = "method";

/**
 * While cooking, keep the ingredients within reach: once the list has scrolled
 * off the top of the screen a copy of it pins there as a scrollable panel, and
 * the method is pushed down to sit just below it so the two read as a split.
 */
export default function PinnedIngredients() {
  const panelRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasIngredients, setHasIngredients] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [isOpen, setIsOpen] = usePersistedState(
    "cookModeIngredientsOpen",
    true,
  );

  // Copy the ingredients out of the recipe body, then follow the scroll so the
  // panel appears only once the real list has gone past the top of the screen.
  useEffect(() => {
    const heading = document.getElementById(ingredientsId);
    const method = document.getElementById(methodId);
    const container = contentRef.current;
    if (!heading || !method || !container) {
      return;
    }

    const nodes: Element[] = [];
    for (
      let node = heading.nextElementSibling;
      node && node !== method;
      node = node.nextElementSibling
    ) {
      nodes.push(node);
    }
    const lastNode = nodes.at(-1);
    if (!lastNode) {
      return;
    }

    for (const node of nodes) {
      const clone = node.cloneNode(true) as Element;
      // The copy is a duplicate of live markup — ids would no longer be unique.
      clone.removeAttribute("id");
      for (const child of clone.querySelectorAll("[id]")) {
        child.removeAttribute("id");
      }
      container.appendChild(clone);
    }
    setHasIngredients(true);

    let frame = 0;
    const measure = () => {
      frame = 0;
      setIsPinned(lastNode.getBoundingClientRect().bottom <= 0);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(measure);
    };

    measure();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      container.replaceChildren();
    };
  }, []);

  // Hold the method clear of the panel. Driving the margin from the panel's
  // measured height keeps the two locked together while it opens and closes.
  useEffect(() => {
    const method = document.getElementById(methodId);
    const panel = panelRef.current;
    if (!method || !panel) {
      return;
    }

    const restingMargin =
      parseFloat(getComputedStyle(method).marginBlockStart) || 0;
    const observer = new ResizeObserver(([entry]) => {
      method.style.marginBlockStart = `${entry.contentRect.height + restingMargin}px`;
    });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      method.style.marginBlockStart = "";
    };
  }, []);

  // Keep the collapsed panel out of the tab order and the accessibility tree.
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.inert = !isPinned;
    }
  }, [isPinned]);

  // Fade the bottom edge whenever there is more of the list below the fold, so
  // a long ingredients list doesn't look as though it stops at the cut.
  useEffect(() => {
    const scroller = contentRef.current;
    if (!scroller) {
      return;
    }

    const check = () => {
      setHasMoreBelow(
        scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1,
      );
    };
    const observer = new ResizeObserver(check);
    observer.observe(scroller);
    scroller.addEventListener("scroll", check, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", check);
    };
  }, [hasIngredients]);

  return (
    <aside
      ref={panelRef}
      class="fixed inset-x-0 top-0 z-30"
      aria-label="Ingredients"
      data-hide-in-print
    >
      <div
        class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{
          gridTemplateRows: isPinned && hasIngredients ? "1fr" : "0fr",
        }}
      >
        <div class="overflow-hidden">
          <div class="bg-paper border-line border-b pt-[env(safe-area-inset-top)] shadow-sm shadow-black/10">
            <div class="mx-auto max-w-3xl px-4 sm:px-6">
              <button
                type="button"
                class="flex w-full cursor-pointer items-center justify-between gap-3 py-2.5"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
              >
                <span class="meta-label font-display">Ingredients</span>
                <ChevronDownIcon
                  class={`text-ink-soft size-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? "" : "-rotate-90"
                  }`}
                />
              </button>
              <div
                class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div class="overflow-hidden">
                  <div
                    ref={contentRef}
                    class="pinned-ingredients max-h-[38dvh] overflow-y-auto overscroll-contain pb-3"
                    data-more-below={hasMoreBelow ? "" : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
