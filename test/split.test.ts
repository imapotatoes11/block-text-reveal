import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { isWhitespace, splitText } from "../src/split";
import { TextReveal } from "../src/TextReveal";

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

describe("TextReveal", () => {
  it("renders and preserves nested JSX", () => {
    const markup = renderToStaticMarkup(
      createElement(
        TextReveal,
        { split: "word", className: "reveal-root" },
        createElement(
          "h1",
          { className: "heading" },
          "( ",
          createElement("span", { className: "font-mono" }, "404"),
          " )"
        )
      )
    );

    expect(markup).toContain('<h1 class="heading reveal-root">');
    expect(markup).toContain('<span class="font-mono">');
    expect(markup).toContain("404");
    expect(markup).not.toContain("<span><h1");
  });
});
