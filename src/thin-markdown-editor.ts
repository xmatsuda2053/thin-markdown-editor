// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
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
   * 編集モードの制御
   *
   * @private
   * @type {boolean}
   * @memberof ThinMarkdownEditor
   */
  @state() private _isEditorMode: boolean = true;

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
    return html`<div class="container">
      <div class="sticky">
        <header>
          <div class="tabs">
            <!-- タブ-->
            ${this.headerTabsRender()}
          </div>
          <div class="toolbar">
            <!-- ツールバー-->
            ${this.headerToolbarRender()}
            <!-- 拡張機能 -->
            ${this.extensionsMenuRender()}
          </div>
        </header>
      </div>
      <main>
        <textarea
          id="markdown-editor"
          resize="auto"
          @input="${this._handleTextareaInput}"
        ></textarea>
      </main>
    </div>`;
  }

  /**
   * 入力内容に合わせてテキストエリアの高さを変更
   *
   * @private
   * @param {Event} e
   * @memberof ThinMarkdownEditor
   */
  private _handleTextareaInput = (e: Event): void => {
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

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
  private headerTabsRender = (): HTMLTemplateResult => {
    const editorClasses = {
      active: this._isEditorMode,
    };
    const previewerClasses = {
      active: !this._isEditorMode,
    };

    return html`<com-svg-button
        icon="html5-brands-solid-full"
        class=${classMap(editorClasses)}
        @click=${this._handleChangeEditorMode}
      ></com-svg-button>
      <com-svg-button
        icon="markdown-brands-solid-full"
        class=${classMap(previewerClasses)}
        @click=${this._handleChangePreviewMode}
      ></com-svg-button>`;
  };

  /**
   * 編集モードに切り替え
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleChangeEditorMode = () => {
    this._isEditorMode = true;
  };

  /**
   * 表示モードに切り替え
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private _handleChangePreviewMode = () => {
    this._isEditorMode = false;
  };

  // ------------------------------
  // Header Toolbar
  // ------------------------------

  /**
   * ヘッダーのツールバーをレンダリング
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private headerToolbarRender = (): HTMLTemplateResult => {
    return html` <markdown-toolbar for="markdown-editor" class="toolbar-root">
      ${toolbarButtons.map((b) => {
        const tag = unsafeStatic(b.tag);
        return withStatic(html)`
          <${tag}>
            <com-svg-button icon=${b.icon} title=${b.label}></com-svg-button>
          </${tag}>
        `;
      })}
    </markdown-toolbar>`;
  };

  // ------------------------------
  // Extensions
  // ------------------------------

  /**
   * 拡張機能をレンダリング
   *
   * @private
   * @memberof ThinMarkdownEditor
   */
  private extensionsMenuRender = (): HTMLTemplateResult => {
    return html`<com-svg-button icon="ellipsis-solid-full"></com-svg-button>`;
  };
}
