import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, state, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Components
import "@common/com-menu-container/com-menu-container";

// Const
import { DEFAULT_SUBMENU_WIDTH } from "@common/const";

// Styles
import styles from "./com-menu.lit.scss?inline";

/**
 * メニュー要素
 *
 * @export
 * @class ComMenu
 * @extends {LitElement}
 */
@customElement("com-menu")
export class ComMenu extends LitElement {
  /**
   * メニューの開閉状態
   *
   * @private
   * @type {boolean}
   * @memberof ComMenu
   */
  @state() private _isOpen: boolean = false;

  /**
   * メニューを右揃えで表示するかどうか
   *
   * @private
   * @type {boolean}
   * @memberof ComMenu
   */
  @state() private _isAlignRight: boolean = false;

  /**
   * ルート要素
   *
   * @type {HTMLElement}
   * @memberof ComMenu
   */
  @query(".container") container!: HTMLElement;

  /**
   * メニュー内容
   *
   * @type {HTMLElement}
   * @memberof ComMenu
   */
  @query(".menu-content") menuContent!: HTMLElement;

  /**
   * メニューコンテナ
   *
   * @type {LitElement}
   * @memberof ComMenu
   */
  @query("com-menu-container") menuContainer!: LitElement;

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  /**
   * スタイル
   *
   * @static
   * @memberof ComMenu
   */
  static styles = [unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントが DOM に接続されたとき、リスナーを登録する
   *
   * @memberof ComMenu
   */
  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this._handleOutsideClick);
    window.addEventListener("resize", this._handleResize);
  }

  /**
   * コンポーネントが DOM から切断されたとき、リスナーを解除する
   *
   * @memberof ComMenu
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleOutsideClick);
    window.removeEventListener("resize", this._handleResize);
  }

  /**
   * プロパティ変更後の更新処理
   *
   * @param {PropertyValues} changedProperties
   * @memberof ComMenu
   */
  override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has("_isOpen") && this._isOpen) {
      this._adjustPosition();
    }
  }

  /**
   * コンポーネント外のクリックを検知してメニューを閉じる
   * Shadow DOM 境界を越えて正しく判定するため composedPath() を使用する
   *
   * @private
   * @memberof ComMenu
   */
  private _handleOutsideClick = (event: MouseEvent): void => {
    if (!this._isOpen) return;
    const path = event.composedPath();
    if (!path.includes(this)) {
      this._isOpen = false;
    }
  };

  /**
   * ウィンドウリサイズ時に位置を再計算する
   *
   * @private
   * @memberof ComMenu
   */
  private _handleResize = (): void => {
    if (this._isOpen) {
      this._adjustPosition();
    }
  };

  /**
   * メニューの表示位置（左右揃え）を自動調整する
   *
   * @private
   * @memberof ComMenu
   */
  private async _adjustPosition(): Promise<void> {
    if (!this.container || !this.menuContent) return;

    if (this.menuContainer) {
      await this.menuContainer.updateComplete;
    }

    requestAnimationFrame(() => {
      const containerRect = this.container.getBoundingClientRect();
      const menuContentRect = this.menuContent.getBoundingClientRect();
      const menuWidth =
        this.menuContent.offsetWidth ||
        menuContentRect.width ||
        this.menuContainer?.offsetWidth ||
        DEFAULT_SUBMENU_WIDTH;
      const viewportWidth =
        document.documentElement.clientWidth || window.innerWidth;

      // 左揃えで表示した際に画面右端をはみ出す場合は右揃えにする
      this._isAlignRight = containerRect.left + menuWidth > viewportWidth;
    });
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * レンダリング
   *
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof ComMenu
   */
  render(): HTMLTemplateResult | typeof nothing {
    const menuClasses = {
      "menu-content": true,
      open: this._isOpen,
      "align-right": this._isAlignRight,
    };
    return html`<div class="container" @close-menu=${this._handleCloseMenu}>
      <slot name="trigger" @click=${this._handleTriggerClick}></slot>
      <div class=${classMap(menuClasses)}>
        <com-menu-container .isOpen=${this._isOpen}>
          <slot name="item"></slot>
        </com-menu-container>
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
    this._isOpen = false;
  }

  /**
   * トリガーをクリックしてメニューの開閉を切り替える
   *
   * @private
   * @memberof ComMenu
   */
  private _handleTriggerClick(): void {
    this._isOpen = !this._isOpen;
  }
}
