import { describe, expect, it } from "vitest";

import { isWhitespace, splitText } from "../src/split";

describe("splitText", () => {
  it("keeps full text together", () => {
    expect(splitText("hello world", "full")).toEqual(["hello world"]);
  });

  it("keeps whitespace when splitting words", () => {
    expect(splitText("hello  world", "word")).toEqual([
      "hello",
      "  ",
      "world"
    ]);
  });

  it("splits Unicode text into code points", () => {
    expect(splitText("A🚀B", "char")).toEqual(["A", "🚀", "B"]);
  });

  it("splits lines and preserves empty lines", () => {
    expect(splitText("one\n\ntwo", "line")).toEqual(["one", "", "two"]);
  });
});

describe("isWhitespace", () => {
  it("recognizes whitespace-only units", () => {
    expect(isWhitespace(" \n")).toBe(true);
    expect(isWhitespace("word")).toBe(false);
    expect(isWhitespace("")).toBe(false);
  });
});
