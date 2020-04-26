import { Pipe, PipeTransform, Renderer2 } from '@angular/core';

@Pipe({
  name: 'method'
})
export class MethodPipe implements PipeTransform {

  constructor(private readonly renderer: Renderer2) {
  }

  transform(method: string): string {
    const methodLines = method.trim().split(/[\r\n]+/);
    const listElement = this.renderer.createElement('ol');
    for (const methodLine of methodLines) {
      const itemElement = this.renderer.createElement('li');
      itemElement.textContent = methodLine;
      listElement.appendChild(itemElement);
    }
    return listElement.outerHTML;
  }

}
