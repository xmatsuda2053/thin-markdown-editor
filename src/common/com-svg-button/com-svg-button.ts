// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import "@/common/com-svg-icon/com-svg-icon";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Styles
import styles from "./com-svg-button.lit.scss?inline";

/**
 * ボタン要素
 *
 * @export
 * @class ComSvgButton
 * @extends {LitElement}
 */
@customElement("com-svg-button")
export class ComSvgButton extends LitElement {
  /**
   * スタイル
   *
   * @static
   * @memberof ComSvgButton
   */
  static styles = [unsafeCSS(styles)];

  /**
   * アイコン名
   *
   * @memberof ComSvgButton
   */
  @property({ type: String }) icon = "";

  /**
   * ボタンサイズ
   *
   * @type {("s" | "m" | "l")}
   * @memberof ComSvgButton
   */
  @property({ type: String }) size: "s" | "m" | "l" = "m";

  // ------------------------------
  // Rendering
  // ------------------------------

  /**
   * レンダリング
   *
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof ComSvgButton
   */
  render(): HTMLTemplateResult | typeof nothing {
    const classes = {
      "svg-button": true,
      [`size-${this.size}`]: true,
    };
    return html`<span class=${classMap(classes)}>
      <com-svg-icon name=${this.icon}></com-svg-icon>
    </span>`;
  }
}
