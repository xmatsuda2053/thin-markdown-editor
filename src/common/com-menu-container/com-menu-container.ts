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
import styles from "./com-menu-container.lit.scss?inline";

/**
 * メニューコンテナ要素
 *
 * @export
 * @class ComMenuContainer
 * @extends {LitElement}
 */
@customElement("com-menu-container")
export class ComMenuContainer extends LitElement {
  /**
   * メニュー開閉
   *
   * @type {boolean}
   * @memberof ComMenuContainer
   */
  @property({ type: Boolean }) isOpen: boolean = false;

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  /**
   * スタイル
   *
   * @static
   * @memberof ComMenuContainer
   */
  static styles = [unsafeCSS(styles)];

  // ------------------------------
  // Rendering
  // ------------------------------

  /**
   * レンダリング
   *
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof ComMenuContainer
   */
  render(): HTMLTemplateResult | typeof nothing {
    const menuClasses = {
      container: true,
      open: this.isOpen,
    };

    return html`<div
      class=${classMap(menuClasses)}
      @close-menu=${this._handleCloseMenu}
    >
      <div class="contents">
        <slot></slot>
      </div>
    </div>`;
  }

  /**
   * メニューを閉じる。
   *
   * @private
   * @memberof ComMenu
   */
  private _handleCloseMenu(): void {
    this.isOpen = false;
  }
}
