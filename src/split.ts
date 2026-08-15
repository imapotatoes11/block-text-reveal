import type { TextRevealSplitMode } from "./types";

/**
 * Splits text using the same modes supported by TextReveal.
 * Whitespace is kept in word and character modes so the rendered text keeps
 * its original spacing.
 */
export function splitText(
  text: string,
  mode: TextRevealSplitMode = "full"
): string[] {
  if (mode === "full") {
    return [text];
  }

  if (mode === "word") {
    return text.match(/\s+|[^\s]+/g) ?? [];
  }

  if (mode === "char") {
    return Array.from(text);
  }

  return text.split(/\r?\n/);
}

export function isWhitespace(value: string): boolean {
  return value.length > 0 && /^\s+$/.test(value);
}
