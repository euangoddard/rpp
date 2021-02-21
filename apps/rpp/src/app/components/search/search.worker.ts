/// <reference lib="webworker" />

import * as lunr from 'lunr';
import { Index, QueryParseError } from 'lunr';
import { Recipes } from '../../models/recipe';
import { SearchWorkerInstruction } from './search.models';

let searchIndex: Index;

addEventListener('message', ({ data }) => {
  switch (data.instruction as SearchWorkerInstruction) {
    case SearchWorkerInstruction.Index:
      buildIndex(data.recipes);
      break;
    case SearchWorkerInstruction.Query:
      runQuery(data.query);
  }
});

function buildIndex(recipes: Recipes): void {
  searchIndex = lunr(function () {
    this.field('title', { boost: 10 });
    this.field('ingredients', { boost: 3 });
    this.field('method', { boost: 2 });
    this.field('categories', { boost: 1 });
    for (const recipe of recipes) {
      this.add(recipe);
    }
  });
}

function runQuery(query: string): void {
  let results: Index.Result[] = [];
  if (query) {
    const startsWithQuery = query.split(' ', 1)[0] + '*';

    try {
      results = searchIndex.search(`${query} ${startsWithQuery}`);
    } catch (error) {
      if (error instanceof QueryParseError) {
        results = [];
      } else {
        throw error;
      }
    }
  }

  postMessage({ instruction: SearchWorkerInstruction.QueryResults, results });
}
