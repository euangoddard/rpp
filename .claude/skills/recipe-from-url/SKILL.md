---
name: recipe-from-url
description: Fetch a recipe from a web page and add it to this site as a markdown file in src/content/recipes/. Use whenever the user pastes a recipe URL, or asks to "add this recipe", "import a recipe", "grab this recipe from BBC Good Food / Guardian / NYT / a blog", or otherwise wants a web recipe turned into a recipe++ markdown file.
---

# Add a recipe from a web page

Turn a recipe web page into one markdown file in `src/content/recipes/`, matching
the conventions of the 345 recipes already there.

## 1. Fetch the page

Use `WebFetch` on the URL, asking for the full recipe: title, description,
servings, prep/cook times, every ingredient with quantities (including any
sub-groups such as "for the sauce"), and every method step in full.

If `WebFetch` returns a paywall, a cookie wall, or an obviously truncated
recipe, fall back to the raw HTML and read the structured data — almost every
recipe site embeds schema.org JSON-LD, which is the most reliable source:

```bash
curl -sL --compressed -A 'Mozilla/5.0' '<URL>' \
  | grep -o '<script type="application/ld+json">.*\?</script>' \
  | head -5
```

Or dump the HTML to the scratchpad and grep it there if the one-liner is
awkward. In the JSON-LD look for the `Recipe` node: `name`, `description`,
`recipeYield`, `prepTime`/`cookTime` (ISO 8601 durations like `PT1H20M`),
`recipeIngredient`, and `recipeInstructions`.

**Never invent content.** If the page genuinely cannot be fetched, say so and
ask the user to paste the recipe text rather than writing a recipe from memory.

## 2. Pick the filename and slug

The filename (minus `.md`) and the `slug` frontmatter **must be identical** —
the URL comes from the filename and the search index is keyed on the slug.

Slug = the title, lowercased, kebab-cased, ASCII only, `&` → `and`, accents
stripped, punctuation dropped. `Ixta's Butter Bean Gratin` →
`ixtas-butter-bean-gratin`.

Check for a collision first, and check the recipe isn't already here under
another name:

```bash
ls src/content/recipes/ | grep -i '<keyword>'
```

If the slug exists, ask the user whether to overwrite or to distinguish it
(e.g. `chicken-curry-thai`). Never silently overwrite an existing recipe.

## 3. Choose tags

Tags drive `/categories`, so **reuse existing tags** — a near-duplicate like
`Dessert` instead of `Desserts` creates an orphan category page. List what is
already in use before choosing:

```bash
grep -h -A20 '^tags:' src/content/recipes/*.md \
  | grep -E '^\s+- ' | sed 's/^\s*- //' | sort | uniq -c | sort -rn
```

The common ones are: Vegetarian, Desserts, Chicken, Baking, Pork, Beef, Soup,
Roasts, Salad, Accompaniments, Fish, Vegetables, Pasta, Lamb, Turkey, Vegan,
Starters, Curry, Sausages, Leftovers, Risotto, Pies, Bread, BBQ, Seafood,
Quiches, Crumble, Biscuits.

Pick 1–3: the main protein or the fact it's vegetarian/vegan, plus the course
or method. Only propose a brand-new tag if nothing fits, and say so in your
summary so the user can veto it.

## 4. Write the file

```markdown
---
title: American Pancakes
slug: "american-pancakes"
serves: 4
tags:
  - Breakfast
  - Vegetarian
source: https://www.bbcgoodfood.com/recipes/american-style-pancakes
---

One or two sentences of intro from the page, if it has one worth keeping.

## Ingredients

- 200g self-raising flour
- 1½ tsp baking powder
- 3 large eggs

### To serve

- maple syrup

## Method

1. Mix the flour, baking powder, sugar and a pinch of salt in a large bowl.
1. Create a well in the centre, then add the eggs, melted butter and milk.
```

Rules that matter:

- **Frontmatter fields** are exactly those in `src/content.config.ts`:
  `title`, `slug` (both required), `serves` (required, string or number),
  `tags`, and the optional `prep`, `cook`, `source`. Nothing else — an unknown
  key fails the collection schema at build time.
- **`slug` is quoted**, as in the bulk of the collection.
- **`serves`** is a bare number where possible (`4`), otherwise a range
  (`4-6`) or whatever the page says (`12`, `8-10`). Convert
  "Makes 16 squares" → `16`. If the page gives no yield, ask the user rather
  than guessing.
- **`prep` / `cook`** only if the page states them, formatted like `20 min`,
  `1 hr and 50 min`. Most recipes here omit them.
- **`source`** is the URL you fetched. Include it — this is an imported recipe.
- **Only `## Ingredients` and `## Method`** as top-level headings, in that
  order. Ingredient sub-groups are `### For the sauce`, `### To serve`, etc.
- **Method steps all start with `1.`** — markdown renumbers them. Do not write
  `2.`, `3.`. Each step is one line, no hard wrapping.
- Keep steps complete: full sentences, times and temperatures included. Don't
  compress a five-sentence step into a clause.
- **Strip the site's filler**: ad copy, "jump to recipe", nutrition tables,
  "you will need" affiliate kit lists, per-step images, reader comments.

## 5. House style

British English and metric, because that is how the rest of the collection
reads. Translate an American source as you go:

- Volumes → weights where the page gives them; otherwise keep cups but keep it
  unambiguous (`240ml`, `1 cup (125g)`).
- °F → °C, rounded to a sensible oven mark: `350°F` → `180°C`
  (add `160°C fan` if the source distinguishes).
- Spelling and names: cilantro → coriander, eggplant → aubergine, zucchini →
  courgette, scallion → spring onion, all-purpose flour → plain flour,
  heavy cream → double cream, broiler → grill, skillet → frying pan.
- Fractions as `½ ¾ ¼ ⅓` characters, not `1/2`.
- `tsp`, `tbsp`, `g`, `ml`, `min` — lowercase, no full stops.
- Ingredient lines are lowercase unless they start with a proper noun, and
  carry the prep with them (`onions 2 large, finely sliced` and
  `2 large onions, finely sliced` are both used in the collection — follow the
  source's own shape rather than rewriting every line).

## 6. Verify

```bash
npx prettier --check src/content/recipes/<slug>.md
```

Fix with `--write` if it complains. The whole collection is prettier-clean and
should stay that way. Prettier preserves `1.`-only ordered lists, so this is
safe.

The search index (`worker/search-data.json`) is gitignored and rebuilt by
`npm run index-recipes`, which runs automatically before `dev` and `build` — no
need to run it by hand.

Finish by telling the user the new path, the URL it will live at
(`/recipes/<slug>`), and the tags you chose.
