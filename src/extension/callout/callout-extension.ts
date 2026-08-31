import { TokenizerAndRendererExtension, Tokens } from "marked";
import { Variant } from "@/type/Variant";

/**
 * Type > Variant への変換マップ
 */
const variantMap: Record<string, string> = {
  info: "brand",
  check: "success",
  gear: "neutral",
  warn: "warning",
  alert: "danger",
};

/**
 * Variant > Type への変換マップ
 */
const typeMap: Record<string, string> = {
  brand: "info",
  success: "check",
  neutral: "gear",
  warning: "warn",
  danger: "alert",
};

/**
 * アイコン変換マップ
 */
const iconMap: Record<string, string> = {
  brand: "circle-info-solid-full",
  success: "circle-check-solid-full",
  neutral: "gear-solid-full",
  warning: "triangle-exclamation-solid-full",
  danger: "circle-exclamation-solid-full",
};

/**
 * トークンインターフェース
 */
export interface CalloutTagToken extends Tokens.Generic {
  type: "CalloutTag";
  raw: string;
  variant: string;
  icon: string;
  text: string;
  tokens?: Tokens.Generic[];
}

/**
 * marked.js用のCalloutタグ拡張機能
 */
export const calloutTagExtension: TokenizerAndRendererExtension = {
  name: "CalloutTag",
  level: "block",
  start(text: string) {
    return text.indexOf("///");
  },
  tokenizer(text: string): CalloutTagToken | undefined {
    // 構文: /// {type}\n{text}\n///
    // 行頭からのマッチングを保証するため ^ を使用し、マルチライン的な動作を期待するが、
    // blockTokenizerはブロックの開始位置からtextを渡すため、そのまま実行する。
    const match = /^(\/{3,})\s*([a-z]+)\n([\s\S]*?)\n\1(?:\n|$)/.exec(text);
    if (match) {
      const type = match[2];
      const variant = variantMap[type] || "brand";
      const icon = iconMap[variant];
      const content = match[3];

      const token: CalloutTagToken = {
        type: "CalloutTag",
        raw: match[0],
        variant: variant,
        icon: icon,
        text: content,
        tokens: [],
      };

      // ブロックレベルの解析（ネストされたMarkdownをサポート）
      token.tokens = this.lexer.blockTokens(token.text, []);

      return token;
    }
    return undefined;
  },
  renderer(token: Tokens.Generic): string {
    const t = token as CalloutTagToken;
    const icon = `<com-svg-icon name="${t.icon}" slot="icon"></com-svg-icon>`;
    // 内側のトークンをパースしてHTML化
    // this.parser.parse はブロック要素をパースする
    return `<md-callout variant="${t.variant}">${icon}${this.parser.parse(t.tokens || [])}</md-callout>`;
  },
};

/**
 * markdown用のフォーマットを適用する
 * @param textarea
 * @param variant
 */
export const formatMarkdown = (
  textarea: HTMLTextAreaElement,
  variant: Variant,
): void => {
  // 選択範囲の位置情報を取得
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const oldText = textarea.value;

  // 選択されたテキストを抽出
  const selectedText = oldText.substring(start, end);

  // 新しい文字列を作成
  const textStart = `/// ${typeMap[variant] || "info"}\n`;
  const textEnd = "\n///";
  const newText =
    oldText.substring(0, start) +
    textStart +
    selectedText +
    textEnd +
    oldText.substring(end);
  textarea.value = newText;

  // カーソル位置を選択されたテキストの末尾（textEndの直前）に設定
  const newCursorPos = start + textStart.length + selectedText.length;
  textarea.selectionStart = textarea.selectionEnd = newCursorPos;
};
