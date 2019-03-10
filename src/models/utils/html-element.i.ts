import { HtmlAttributeI } from './html-attribute.i';

export interface HtmlElementI {
  tagName: string;
  id?: string;
  classes?: string;
  attributes?: HtmlAttributeI[];
  children?: HtmlElementI[];
  innerHtml?: string;
}
