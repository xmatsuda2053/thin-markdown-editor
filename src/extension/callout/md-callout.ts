// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Type
import { Variant } from "@/type/Variant";

// Styles
import styles from "./md-callout.lit.scss?inline";

/**
 * アイコン要素
 *
 * @export
 * @class MdCallout
 * @extends {LitElement}
 */
@customElement("md-callout")
export class MdCallout extends LitElement {
  /**
   * コールアウトの種別
   *
   * @type {Variant}
   * @memberof MdCallout
   */
  @property({ type: String }) variant: Variant = "brand";

  /**
   * スタイル
   *
   * @static
   * @memberof MdCallout
   */
  static styles = [unsafeCSS(styles)];

  // ------------------------------
  // Rendering
  // ------------------------------

  /**
   * レンダリング
   *
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof MdCallout
   */
  render(): HTMLTemplateResult | typeof nothing {
    const calloutClasses = {
      callout: true,
      [this.variant]: true,
    };

    return html`<div class=${classMap(calloutClasses)}>
      <div class="icon">
        <slot name="icon"></slot>
      </div>
      <div class="text">
        <slot></slot>
      </div>
    </div>`;
  }
}
