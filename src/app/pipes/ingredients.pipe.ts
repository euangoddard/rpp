import { Pipe, PipeTransform, Renderer2 } from '@angular/core';

@Pipe({
  name: 'ingredients',
})
export class IngredientsPipe implements PipeTransform {
  constructor(private readonly renderer: Renderer2) {}

  transform(ingredients: string): string {
    const ingredientsLines = ingredients.trim().split(/[\r\n]+/);
    const elements: HTMLElement[] = [];
    let currentListElement: HTMLElement | null = null;
    for (const ingredientLine of ingredientsLines) {
      if (ingredientLine.startsWith('|')) {
        if (currentListElement) {
          elements.push(currentListElement);
        }
        const headerElement = this.renderer.createElement('h4');
        headerElement.textContent = ingredientLine.replace(/^\|/, '');
        elements.push(headerElement);
      } else {
        if (!currentListElement) {
          currentListElement = this.renderer.createElement('ul');
        }
        const itemElement = this.renderer.createElement('li');
        itemElement.textContent = ingredientLine;
        currentListElement!.appendChild(itemElement);
      }
    }
    if (currentListElement) {
      elements.push(currentListElement);
    }

    return elements.map((e) => e.outerHTML).join('\n');
  }
}
