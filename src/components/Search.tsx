import { useEffect, useRef, useState } from "preact/hooks";
import { CloseIcon, SearchIcon } from "./icons";

interface RecipeResult {
  url: string;
  score: number;
  title: string;
}

const useSearch = (): [
  readonly RecipeResult[],
  string,
  (query: string) => void,
] => {
  const [query, setQuery] = useState("");
  const [searchResults, setResults] = useState<readonly RecipeResult[]>([]);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    abortController.current?.abort();
    const ctrl = new AbortController();
    abortController.current = ctrl;
    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: ctrl.signal },
        );
        const data = (await response.json()) as { results: RecipeResult[] };
        setResults(data.results);
      } catch {
        setResults([]);
      }
    };
    fetchResults();
  }, [query]);

  return [searchResults, query, setQuery];
};

export default function Search() {
  const [searchResults, query, setQuery] = useSearch();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const runSearch = debounce((e: Event) => {
    setQuery((e.target as HTMLInputElement).value);
  });

  const clear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      clear();
      return;
    }
    if (!searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      window.location.href = searchResults[highlightedIndex].url;
    }
  };

  return (
    <div class="relative">
      <div class="border-line focus-within:border-accent flex h-11 items-center gap-2.5 rounded-lg border bg-white/55 px-3.5 transition-colors focus-within:bg-white/90">
        <SearchIcon class="text-ink-soft size-4 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search recipes"
          onInput={runSearch}
          onKeyDown={handleKeyDown}
          id="search"
          autocomplete="off"
          aria-activedescendant={
            highlightedIndex >= 0 ? `result-${highlightedIndex}` : undefined
          }
          class="text-ink placeholder:text-ink-soft w-full min-w-0 grow bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            class="text-ink-soft hover:text-ink cursor-pointer transition-colors"
            onClick={clear}
          >
            <CloseIcon class="size-4" />
          </button>
        )}
      </div>

      {query && (
        <div class="border-line bg-paper absolute inset-x-0 top-full z-10 mt-2 max-h-[24rem] overflow-auto rounded-lg border p-4 shadow-lg shadow-black/5">
          {searchResults.length ? (
            <ul ref={listRef} class="space-y-2" role="listbox">
              {searchResults.map((recipe, index) => (
                <li
                  key={recipe.url}
                  id={`result-${index}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <a
                    href={recipe.url}
                    class={`text-accent underline-offset-2 hover:underline block rounded px-1.5 py-0.5 -mx-1.5 transition-colors ${index === highlightedIndex ? "bg-accent/10" : ""}`}
                  >
                    {recipe.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p class="text-ink-soft text-sm">
              No results for <strong class="text-ink">{query}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function debounce<A extends unknown[]>(
  func: (...args: A) => void,
  timeout = 250,
) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), timeout);
  };
}
