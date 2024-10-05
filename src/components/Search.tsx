import { useState, useEffect } from "preact/hooks";
import * as styles from "./Search.module.css";
import classnames from "classnames";

interface RecipeResult {
  url: string;
  score: number;
  title: string;
}

const useSearch = (): [
  readonly RecipeResult[],
  string,
  (query: string) => void
] => {
  const [query, setQuery] = useState("");
  const [searchResults, setResults] = useState<readonly RecipeResult[]>([]);
  const [abortController, setAbortController] = useState(new AbortController());

  useEffect(() => {
    if (!query?.trim()) {
      return;
    }
    abortController.abort();
    const ctrl = new AbortController();
    setAbortController(ctrl);
    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/.netlify/functions/search?q=${encodeURIComponent(query)}`,
          {
            signal: ctrl.signal,
          }
        );
        setResults((await response.json())["results"]);
      } catch (e) {
        setResults([]);
      }
    };
    fetchResults();
  }, [query]);

  return [searchResults, query, setQuery];
};

export default function Search() {
  const [isActive, setActive] = useState(false);
  const [searchResults, query, setQuery] = useSearch();

  const runSearch = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div
      class={classnames({
        [styles.search]: true,
        [styles.searchActive]: isActive,
      })}
    >
      <i class="material-icons">search</i>
      <input
        type="text"
        placeholder="Search recipes"
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onKeyup={debounce(runSearch)}
        onInput={debounce(runSearch)}
        id="search"
        autocomplete="off"
        class={styles.searchInput}
      />

      {query ? (
        <div class={styles.searchResults}>
          <header class={styles.searchResultsHeader}>
            <h2>
              Search results for <strong>{query}</strong>
            </h2>
            <span class={styles.spacer}></span>
            <button
              type="button"
              class={styles.closeResults}
              onClick={() => setQuery("")}
            >
              <i class="material-icons">close</i>
            </button>
          </header>
          {searchResults.length ? (
            <ul>
              {searchResults.map((recipe) => (
                <li>
                  <a href={recipe.url}>{recipe.title}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              There are no results for <strong>{query}</strong>
            </p>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

function debounce(func: Function, timeout = 250) {
  let timer: NodeJS.Timeout;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
