from json import load as load_json, dump as save_json

with open('./raw.json') as json_file:
    data = load_json(json_file)

categories = {}
for item in data:
    if (item['model'] == "recipesplus.category"):
        categories[item['pk']] = item['fields']['title']

recipes = []
recipes_raw = (i for i in data if i['model'] == 'recipesplus.recipe')
for recipe_raw in recipes_raw:
    fields = recipe_raw['fields']
    recipe = {
      'id': str(recipe_raw['pk']),
      'title': fields['title'],
      'serves': fields['serves'],
      'slug': fields['slug'],
      'lastUpdatedDate': fields["last_updated_date"],
      'ingredients': fields['raw_ingredients'],
      'creationDate': fields['creation_date'],
      'method': fields['method'],
      'categories': [categories[c] for c in fields['categories']],
    }
    recipes.append(recipe)

with open('./recipes.json', 'w') as json_file:
    save_json({"recipes": recipes}, json_file)
