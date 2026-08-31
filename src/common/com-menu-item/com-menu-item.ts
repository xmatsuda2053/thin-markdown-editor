import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
  nothing,
} from "lit";
import "@common/com-svg-icon/com-svg-icon";

// Lit Extensions (Decorators & Directives)
import { customElement, property, state, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Components
import "@common/com-svg-icon/com-svg-icon";
import "@common/com-menu-container/com-menu-container";

// Utils
import { emit } from "@utils/EventUtils";

// Type
import { Variant } from "@/type/Variant";

// Const
import { DEFAULT_SUBMENU_WIDTH } from "@common/const";

// Styles
import styles from "./com-menu-item.lit.scss?inline";

/**
 * メニュー項目要素
 *
 * @export
 * @class ComMenuItem
 * @extends {LitElement}
 */
@customElement("com-menu-item")
export class ComMenuItem extends LitElement {
  /**
   * サブメニューの開閉状態
   *
   * @private
   * @type {boolean}
   * @memberof ComMenuItem
   */
  @state() private _isOpen: boolean = false;

  /**
   * サブメニューを左側に展開するかどうか
   *
   * @private
   * @type {boolean}
   * @memberof ComMenuItem
   */
  @state() private _isSubmenuAlignLeft: boolean = false;

  /**
   * サブメニューの有無
   *
   * @private
   * @type {boolean}
   * @memberof ComMenuItem
   */
  @state() private _hasSubMenu: boolean = false;

  /**
   * アイコン名
   *
   * @type {string}
   * @memberof ComMenuItem
   */
  @property({ type: String }) icon: string = "circle-regular-full";

  /**
   * 要素の種類
   *
   * @type {Variant}
   * @memberof ComMenuItem
   */
  @property({ type: String }) variant: Variant = "none";

  /**
   * サブメニュー要素
   *
   * @type {HTMLDivElement}
   * @memberof ComMenuItem
   */
  @query(".submenu") submenu!: HTMLDivElement;

  /**
   * サブメニューコンテナ要素
   *
   * @type {LitElement}
   * @memberof ComMenuItem
   */
  @query("com-menu-container") subMenuContainer!: LitElement;

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------
  /**
   * スタイル
   *
   * @static
   * @memberof ComMenuItem
   */
  static styles = [unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントが DOM に接続されたとき、リスナーを登録する
   *
   * @memberof ComMenuItem
   */
  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this._handleOutsideClick);
    window.addEventListener("resize", this._handleResize);
  }

  /**
   * コンポーネントが DOM から切断されたとき、リスナーを解除する
   *
   * @memberof ComMenuItem
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
   * @memberof ComMenuItem
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
   * @memberof ComMenuItem
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
   * @memberof ComMenuItem
   */
  private _handleResize = (): void => {
    if (this._isOpen) {
      this._adjustPosition();
    }
  };

  /**
   * サブメニューの表示位置（左右）を自動調整する
   *
   * @private
   * @memberof ComMenuItem
   */
  private async _adjustPosition(): Promise<void> {
    if (!this.submenu || !this.subMenuContainer) return;

    await this.subMenuContainer.updateComplete;

    requestAnimationFrame(() => {
      const submenuRect = this.submenu.getBoundingClientRect();
      const containerRect = this.subMenuContainer.getBoundingClientRect();
      const menuWidth =
        this.subMenuContainer.offsetWidth ||
        containerRect.width ||
        DEFAULT_SUBMENU_WIDTH;
      const viewportWidth =
        document.documentElement.clientWidth || window.innerWidth;

      // 右側に展開した際に画面右端をはみ出す場合は左側に展開する
      const isOverflowingRight = submenuRect.right + menuWidth > viewportWidth;
      this._isSubmenuAlignLeft = isOverflowingRight;
    });
  }

  // ------------------------------
  // Rendering
  // ------------------------------

  /**
   * レンダリング
   *
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof ComMenuItem
   */
  render(): HTMLTemplateResult | typeof nothing {
    const containerClasses = {
      container: true,
      [this.variant]: true,
    };
    const submenuClasses = {
      submenu: true,
      hidden: !this._hasSubMenu,
      "align-left": this._isSubmenuAlignLeft,
    };

    return html` <div
      class=${classMap(containerClasses)}
      @click=${this._handleItemClick}
      @close-menu=${this._handleCloseMenu}
    >
      <div class="icon">
        <com-svg-icon name=${this.icon}></com-svg-icon>
      </div>
      <div class="label"><slot></slot></div>
      <div class=${classMap(submenuClasses)}>
        <com-svg-icon
          name="angle-right-solid-full"
          @click=${this._handleTriggerClick}
          @mouseover=${this._handleMouseOver}
        ></com-svg-icon>
        <com-menu-container
          .isOpen=${this._isOpen}
          @click=${this._handleSubmenuContentClick}
        >
          <slot name="submenu" @slotchange=${this._handleSlotChange}></slot>
        </com-menu-container>
      </div>
    </div>`;
  }

  /**
   * アイテムのクリックイベントを発行する。
   *
   * @private
   * @param {MouseEvent} event
   * @memberof ComMenuItem
   */
  private _handleItemClick(event: MouseEvent): void {
    event.stopPropagation();
    this._isOpen = false;
    emit(this, "click-menu-item");
    emit(this, "close-menu");
  }

  /**
   * サブメニューを閉じる。
   *
   * @private
   * @memberof ComMenu
   */
  private _handleCloseMenu(): void {
    this._isOpen = false;
  }

  /**
   * トリガー（矢印アイコン）をクリックしてサブメニューの開閉を切り替える
   *
   * @private
   * @param {MouseEvent} event
   * @memberof ComMenuItem
   */
  private _handleTriggerClick(event: MouseEvent): void {
    event.stopPropagation();
    this._isOpen = !this._isOpen;
  }

  /**
   * トリガーにマウスオーバーするとサブメニューを開く。
   *
   * @private
   * @param {MouseEvent} event
   * @memberof ComMenuItem
   */
  private _handleMouseOver(event: MouseEvent): void {
    event.stopPropagation();
    this._isOpen = true;
  }

  /**
   * サブメニューコンテンツ内のクリックが親メニューに伝播しないよう止める
   *
   * @private
   * @param {MouseEvent} event
   * @memberof ComMenuItem
   */
  private _handleSubmenuContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  /**
   * サブメニューのスロット変更を検知し、メニュー表示の有無を制御する。
   *
   * @private
   * @param {Event} e
   * @memberof ComMenuItem
   */
  private _handleSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    // 空白文字以外のテキストノードまたは要素ノードが存在するかチェック
    const assignedNodes = slot
      .assignedNodes({ flatten: true })
      .filter((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) return true;
        if (node.nodeType === Node.TEXT_NODE)
          return node.textContent?.trim() !== "";
        return false;
      });

    this._hasSubMenu = assignedNodes.length > 0;
  }
}
