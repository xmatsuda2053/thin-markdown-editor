// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
  nothing,
} from "lit";
import { unsafeStatic, withStatic } from "lit/static-html.js";
import { marked } from "marked";

// Lit Extensions
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Third-party UI & Elements
import "@github/markdown-toolbar-element";

// Components
import "@/common/com-svg-button/com-svg-button";
import "@/common/com-menu/com-menu";
import "@/common/com-menu-item/com-menu-item";

// Utils
import { emit } from "./utils/EventUtils";

// Styles (Shadow DOM internal styles)
import githubMarkdownStyles from "github-markdown-css/github-markdown-light.css?inline";
import commonStyles from "@/common/_variables/_host.scss?inline";
import styles from "./thin-markdown-editor.lit.scss?inline";

// Parameters
interface ToolbarButton {
  tag: string;
  icon: string;
  label: string;
}
const toolbarButtons: ToolbarButton[] = [
  { tag: "md-header", icon: "heading-solid-full", label: "Header" },
  { tag: "md-bold", icon: "bold-solid-full", label: "Bold" },
  { tag: "md-quote", icon: "bars-staggered-solid-full", label: "Quote" },
  { tag: "md-code", icon: "code-solid-full", label: "Code" },
  { tag: "md-link", icon: "link-solid-full", label: "Link" },
  {
    tag: "md-unordered-list",
    icon: "list-ul-solid-full",
    label: "Unordered List",
  },
  { tag: "md-ordered-list", icon: "list-ol-solid-full", label: "Ordered List" },
  { tag: "md-task-list", icon: "list-check-solid-full", label: "Task List" },
];

/**
 * Markdown Editor
 *
 * @export
 * @class ThinMarkdownEditor
 * @extends {LitElement}
 */
@customElement("thin-markdown-editor")
export class ThinMarkdownEditor extends LitElement {
  /**
   * Markdownソースコード
   *
   * @type {string}
   * @memberof ThinMarkdownEditor
   */
  @property({ type: String, reflect: true })
  value: string = "";

  /**
   * Radius不要の設定
   *
   * @type {boolean}
   * @memberof ThinMarkdownEditor
   */
  @property({ type: Boolean, attribute: "un-radius" })
  unRadius: boolean = false;

  /**
   * 編集モードの制御
   *
   * @private
   * @type {boolean}
   * @memberof ThinMarkdownEditor
   */
  @state()
  isEditMode: boolean = false;

  /**
   * プレビュー用HTMLコード
   *
   * @type {string}
   * @memberof ThinMarkdownEditor
   */
  @state()
  previewHtml: string = "";

  /**
   * エディタ要素
   *
   * @type {HTMLTextAreaElement}
   * @memberof ThinMarkdownEditor
   */
  @query("#markdown-editor")
  markdownEditor!: HTMLTextAreaElement;

  // -------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------

  /**
   * Shadow DOM 内部のスタイルシートを適用
   *
   * @static
   * @memberof ThinMarkdownEditor
   */
  static styles = [
    unsafeCSS(styles),
    unsafeCSS(githubMarkdownStyles),
    unsafeCSS(commonStyles),
  ];

  /**
   * Markdownレンダリング用部品の準備
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private mdRenderer = new marked.Renderer();

  // -------------------------------------------------------------
  // LifeCycle
  // -------------------------------------------------------------

  /**
   * Creates an instance of ThinMarkdownEditor.
   * @memberof ThinMarkdownEditor
   */
  constructor() {
    super();
  }

  /**
   * Renderの直前に実行し、valueの値が空の場合はエディタモードに強制的に切り替
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ThinMarkdownEditor
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has("value")) {
      this.previewHtml = marked.parse(this.value || "", {
        renderer: this.mdRenderer,
      }) as string;
    }

    if (!this.value) {
      this.isEditMode = true;
    }
  }

  /**
   * コンポーネント外から注入されたMarkdown初期値をエディタに登録
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ThinMarkdownEditor
   */
  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if (this.isEditMode && this.markdownEditor) {
      this.markdownEditor.value = this.value;
    }
  }

  /**
   * 画面更新後、MarkdownをHTMLにレンダリング
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ThinMarkdownEditor
   */
  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    if (_changedProperties.has("isEditMode")) {
      if (this.isEditMode) {
        this._adjustTextareaHeight();
      }
    }
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * ThinMarkdownEditor本体をレンダリング
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  protected render(): HTMLTemplateResult {
    const containerClasses = {
      container: true,
      "un-radius": this.unRadius,
    };

    return html`<div class=${classMap(containerClasses)}>
      <div class="sticky">
        <header>
          <div class="tabs">
            <!-- タブ-->
            ${this._headerTabsRender()}
          </div>
          <div class="toolbar">
            <!--描画モードメニュー-->
            ${this._viewerMenuRender()}
            <!-- エディタのツールバー-->
            ${this._editorToolbarRender()}
          </div>
        </header>
      </div>
      <main>
        <!--ビュアー-->
        ${this._viewerRender()}
        <!--エディタ-->
        ${this._editorRender()}
      </main>
    </div>`;
  }

  // ------------------------------
  // Header Tabs
  // ------------------------------

  /**
   * ヘッダーのタブをレンダリング
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ThinMarkdownEditor
   */
  private _headerTabsRender = (): HTMLTemplateResult => {
    const editorClasses = {
      active: this.isEditMode,
    };
    const previewerClasses = {
      active: !this.isEditMode,
    };

    return html`<com-svg-button
        icon="html5-brands-solid-full"
        class=${classMap(previewerClasses)}
        title="Viewer"
        @click=${this._handleChangePreviewMode}
      ></com-svg-button>
      <com-svg-button
        icon="markdown-brands-solid-full"
        class=${classMap(editorClasses)}
        title="Editor"
        @click=${this._handleChangeEditorMode}
      ></com-svg-button>`;
  };

  /**
   * 表示モードに切り替え
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleChangePreviewMode = () => {
    this.isEditMode = false;
    emit(this, "md-mode-change-preview");
  };

  /**
   * 編集モードに切り替え
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleChangeEditorMode = () => {
    this.isEditMode = true;
    emit(this, "md-mode-change-edit");
  };

  // ------------------------------
  // ViewerMenu
  // ------------------------------
  private _viewerMenuRender = (): HTMLTemplateResult | typeof nothing => {
    if (this.isEditMode) return nothing;

    return html` <com-svg-button
      icon="clipboard-solid-full"
      title="Clipboard"
    ></com-svg-button>`;
  };

  // ------------------------------
  // Editor Toolbar
  // ------------------------------

  /**
   * エディタのツールバーをレンダリング
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _editorToolbarRender = (): HTMLTemplateResult | typeof nothing => {
    if (!this.isEditMode) return nothing;

    return html` <markdown-toolbar for="markdown-editor" class="toolbar-root">
        ${toolbarButtons.map((b) => {
          const tag = unsafeStatic(b.tag);
          return withStatic(html)`
          <${tag}>
            <com-svg-button icon=${b.icon} title=${b.label}></com-svg-button>
          </${tag}>
        `;
        })}
      </markdown-toolbar>
      ${this._extensionsMenuRender()}`;
  };

  // ------------------------------
  // Extensions
  // ------------------------------
  /**
   * 拡張機能メニューをレンダリング
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionsMenuRender = (): HTMLTemplateResult | typeof nothing => {
    return html`<com-menu>
      <com-svg-button
        icon="ellipsis-solid-full"
        slot="trigger"
        title="Extension"
      ></com-svg-button>
      <!--Callout-->
      ${this._extensionCalloutRender()}
      <!--Color-->
      ${this._extensionColorRender()}
      <!--Table-->
      ${this._extensionTableRender()}
      <!--CopyLine-->
      ${this._extensionCopyLineRender()}
      <!--CopyBlock-->
      ${this._extensionCopyBlockRender()}
      <!--TimeStamp-->
      ${this._extensionTimeStampRender()}
    </com-menu>`;
  };

  // ------------------------------
  // Callout
  // ------------------------------

  /**
   * コールアウト機能の呼び出しを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionCalloutRender = (): HTMLTemplateResult => {
    return html` <com-menu-item slot="item" icon="sign-hanging-solid-full">
      Callout
      <com-menu-item
        variant="brand"
        slot="submenu"
        icon="circle-info-solid-full"
      >
        Information
      </com-menu-item>
      <com-menu-item
        variant="success"
        slot="submenu"
        icon="circle-check-solid-full"
      >
        Check
      </com-menu-item>
      <com-menu-item variant="neutral" slot="submenu" icon="gear-solid-full">
        Setting
      </com-menu-item>
      <com-menu-item
        variant="warning"
        slot="submenu"
        icon="triangle-exclamation-solid-full"
      >
        Warning
      </com-menu-item>
      <com-menu-item
        variant="danger"
        slot="submenu"
        icon="circle-exclamation-solid-full"
      >
        Alert
      </com-menu-item>
    </com-menu-item>`;
  };

  // ------------------------------
  // Color
  // ------------------------------

  /**
   * カラー設定機能の呼び出しを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionColorRender = (): HTMLTemplateResult => {
    return html` <com-menu-item slot="item" icon="palette-solid-full">
      Color
    </com-menu-item>`;
  };

  // ------------------------------
  // Table
  // ------------------------------

  /**
   * テーブル機能の呼び出しを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionTableRender = (): HTMLTemplateResult => {
    return html`<com-menu-item slot="item" icon="table-solid-full">
      Table
    </com-menu-item>`;
  };

  // ------------------------------
  // CopyLine
  // ------------------------------

  /**
   * １行コピー機能の呼び出しを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionCopyLineRender = (): HTMLTemplateResult => {
    return html` <com-menu-item slot="item" icon="grip-lines-solid-full">
      CopyLine
    </com-menu-item>`;
  };

  // ------------------------------
  // CopyBlock
  // ------------------------------

  /**
   * 範囲コピー機能の呼び出しを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionCopyBlockRender = (): HTMLTemplateResult => {
    return html` <com-menu-item slot="item" icon="xmarks-lines-solid-full">
      CopyBlock
    </com-menu-item>`;
  };

  // ------------------------------
  // TimeStamp
  // ------------------------------

  /**
   * タイムスタンプ機能の呼び出しを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _extensionTimeStampRender = (): HTMLTemplateResult => {
    return html` <com-menu-item slot="item" icon="clock-solid-full">
      TimeStamp
    </com-menu-item>`;
  };

  // ------------------------------
  // Viewer
  // ------------------------------

  /**
   * ビュアーを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _viewerRender = (): HTMLTemplateResult | typeof nothing => {
    if (this.isEditMode) return nothing;

    return html`<div
      class="markdown-body"
      .innerHTML=${this.previewHtml}
    ></div>`;
  };

  // ------------------------------
  // Editor
  // ------------------------------
  /**
   * エディタを描画
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _editorRender = (): HTMLTemplateResult | typeof nothing => {
    if (!this.isEditMode) return nothing;
    return html` <textarea
      id="markdown-editor"
      resize="auto"
      .value=${this.value}
      @input="${this._handleTextareaInput}"
      @keyup="${this._handleMarkdownKeyup}"
    ></textarea>`;
  };

  /**
   * 入力内容に合わせてテキストエリアの高さを変更
   *
   * @private
   * @param {Event} e
   * @memberof ThinMarkdownEditor
   */
  private _handleTextareaInput = (e: Event): void => {
    e.stopPropagation();
    this._adjustTextareaHeight();
    this._fetchMarkdown();
  };

  /**
   * 入力内容に応じてエディタの高さを自動調整
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _adjustTextareaHeight = (): void => {
    this.markdownEditor.style.height = "auto";
    this.markdownEditor.style.height = `${this.markdownEditor.scrollHeight}px`;
  };

  /**
   * Markdown入力内容を取得
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _fetchMarkdown = () => {
    // 入力したMarkdownを読み込み
    this.value = this.markdownEditor.value ?? "";

    if (!this.value) return;

    // 1行目の見出し行レベル1の値をinputイベントで渡す
    const firstLine = this.value.split(/\r?\n/)[0]?.trim() ?? "";
    if (!firstLine.startsWith("# ")) return "";

    const match = firstLine.match(/^#\s+(.+)$/);
    const header1 = match ? match[1] : "";
    emit(this, "input", { detail: { header1: header1 } });
  };

  /**
   * 最終行でのキーアップイベントを検知
   *
   * @private
   * @param {KeyboardEvent} e
   * @memberof ThinMarkdownEditor
   */
  private _handleMarkdownKeyup = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      if (this.markdownEditor) {
        const value = this.markdownEditor.value;
        const selectionStart = this.markdownEditor.selectionStart;
        const isLastLine = !value.slice(selectionStart).includes("\n");
        if (isLastLine) {
          emit(this, "keyup-enter-last-line");
        }
      }
    }
  };
}
