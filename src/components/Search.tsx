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
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = debounce((e: Event) => {
    setQuery((e.target as HTMLInputElement).value);
  });

  const clear = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div class="relative" onKeyDown={(e) => e.key === "Escape" && clear()}>
      <div class="border-line focus-within:border-accent flex h-11 items-center gap-2.5 rounded-lg border bg-white/55 px-3.5 transition-colors focus-within:bg-white/90">
        <SearchIcon class="text-ink-soft size-4 shrink-0" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search recipes"
          onInput={runSearch}
          id="search"
          autocomplete="off"
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
            <ul class="space-y-2">
              {searchResults.map((recipe) => (
                <li key={recipe.url}>
                  <a
                    href={recipe.url}
                    class="text-accent underline-offset-2 hover:underline"
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
