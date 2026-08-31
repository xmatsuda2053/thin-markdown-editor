// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Styles
import styles from "./com-svg-icon.lit.scss?inline";

// Icon
import { icons } from "@assets/icons";

/**
 * アイコン要素
 *
 * @export
 * @class ComSvgIcon
 * @extends {LitElement}
 */
@customElement("com-svg-icon")
export class ComSvgIcon extends LitElement {
  /**
   * スタイル
   *
   * @static
   * @memberof ComSvgIcon
   */
  static styles = [unsafeCSS(styles)];

  /**
   * アイコン名
   *
   * @memberof ComSvgIcon
   */
  @property({ type: String }) name = "";

  // ------------------------------
  // Rendering
  // ------------------------------

  /**
   * レンダリング
   *
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof ComSvgIcon
   */
  render(): HTMLTemplateResult | typeof nothing {
    const svgString = icons[this.name];
    if (!svgString) {
      console.warn(`[com-svg-icon] Icon "${this.name}" not found.`);
      return nothing;
    }

    return html`<span class="container">${unsafeSVG(svgString)}</span>`;
  }
}
