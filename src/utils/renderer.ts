import { HtmlElementI } from '../models';

export class Renderer {
  private _container: Element;

  constructor(container?: Element | string) {
    if (container && container instanceof Element) {
      this.container = container;
    } else if (container && typeof container === 'string') {
      this.container = document.querySelector(container);
    } else {
      this.container = document.querySelector('body');
    }
  }

  /**
   * Getter container
   * @return {Element}
   */
  public get container(): Element {
    return this._container;
  }

  /**
   * Setter container
   * @param {Element} value
   */
  public set container(value: Element) {
    this._container = value;
  }

  /**
   * Append a child element to the (specified) container
   * @param {Element|string} child element or element tag name to be created to append to the container
   * @param {Element} container another container than the main container
   */
  public appendChild(child: Element | string, container?: Element): void {
    container = container ? container : this.container;
    let element: Element = child instanceof Element ? child : document.createElement(child);
    container.appendChild(element);
  }

  /**
   * Clear all (specified) container content
   * @param container another container than the main container
   */
  public clearContent(container?: Element): void {
    container = container ? container : this.container;
    while (container.firstChild) {
      container.firstChild.remove();
    }
  }

  /**
   * Create an Html Element from a [HtmlElementI] structure definition object
   * @param {HtmlElementI} element structure definition of the element to be created
   */
  public renderEl(element: HtmlElementI): Element {
    let el: Element = document.createElement(element.tagName);
    if (element.id) {
      el.setAttribute('id', element.id);
    }
    if (element.classes) {
      el.setAttribute('class', element.classes);
    }
    if (element.attributes) {
      element.attributes.forEach(attribute => {
        el.setAttribute(attribute.name, attribute.value);
      });
    }
    if (element.children) {
      element.children.forEach(child => {
        el.appendChild(this.renderEl(child));
      });
    }
    if (element.innerHtml) {
      el.innerHTML = element.innerHtml;
    }
    return el;
  }
}
