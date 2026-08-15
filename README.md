# block-text-reveal

A small, typed React text-reveal component powered by [Framer Motion](https://motion.dev/). It is designed to work directly in Next.js, including the App Router, with no Tailwind or CSS setup required.

## Install

```bash
npm install block-text-reveal framer-motion
```

React and React DOM are peer dependencies, so they should already be installed in a React or Next.js project.

## Basic usage

The simplest API is to import the component and wrap plain text with it:

```tsx
import { TextReveal } from "block-text-reveal";

export default function Page() {
  return (
    <TextReveal split="word" blockColor="#6366f1">
      Hello, motion.
    </TextReveal>
  );
}
```

The component includes its own `"use client"` directive. In the Next.js App Router, the page above can remain a server component. If you want to replay the animation from a button or another piece of state, put that interactive wrapper in a client component and change `replayKey`:

```tsx
"use client";

import { useState } from "react";
import { TextReveal } from "block-text-reveal";

export function AnimatedHeading() {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <>
      <TextReveal
        split="word"
        direction="bottom-to-top"
        stagger={0.1}
        style={{ fontSize: "4rem", fontWeight: 800 }}
        replayKey={replayKey}
      >
        Build things that move.
      </TextReveal>

      <button onClick={() => setReplayKey((key) => key + 1)}>Replay</button>
    </>
  );
}
```

The `text` prop is also supported when children are inconvenient:

```tsx
<TextReveal text="NEXT.JS + MOTION" split="char" />
```

## Props

| Prop             | Type                                                                       | Default                                    | Description                                                      |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `children`       | `ReactNode`                                                                | —                                          | Plain text to reveal. This is the recommended API.               |
| `text`           | `string`                                                                   | —                                          | Alternative to `children`; `children` wins if both are provided. |
| `split`          | `"full" \| "word" \| "char" \| "line"`                                     | `"full"`                                   | Unit used for staggering.                                        |
| `direction`      | `"left-to-right" \| "right-to-left" \| "top-to-bottom" \| "bottom-to-top"` | `"left-to-right"`                          | Direction of the coloured wipe.                                  |
| `stagger`        | `number`                                                                   | `0.08`                                     | Delay in seconds between split units.                            |
| `duration`       | `number`                                                                   | `0.55`                                     | Wipe duration in seconds.                                        |
| `textOffset`     | `number`                                                                   | `8`                                        | Initial vertical offset of the text entrance in pixels.          |
| `spring`         | `TextRevealSpring`                                                         | `{ stiffness: 140, damping: 14, mass: 1 }` | Framer Motion spring settings.                                   |
| `blockColor`     | `string`                                                                   | `"#6366f1"`                                | Wipe rectangle colour.                                           |
| `textColor`      | `string`                                                                   | `"currentColor"`                           | Text colour.                                                     |
| `textClassName`  | `string`                                                                   | —                                          | Class for each animated text span.                               |
| `blockClassName` | `string`                                                                   | —                                          | Class for each wipe span.                                        |
| `textStyle`      | `CSSProperties`                                                            | —                                          | Inline style for each text span.                                 |
| `blockStyle`     | `CSSProperties`                                                            | —                                          | Inline style for each wipe span.                                 |
| `replayKey`      | `string \| number`                                                         | —                                          | Change this value to replay the same animation.                  |

All normal span attributes, including `className`, `style`, `aria-*`, and event handlers, are forwarded to the outer wrapper.

## Modes

- `full`: one reveal block over the entire string.
- `word`: reveals words in sequence while preserving whitespace.
- `char`: reveals Unicode code points in sequence.
- `line`: reveals each newline-delimited line in sequence.

The package intentionally does not require Tailwind. Use `className` or `style` for typography and layout:

```tsx
<TextReveal
  split="line"
  className="font-display text-6xl tracking-tight"
  blockColor="black"
>
  Crafting interfaces{`\n`}with precision.
</TextReveal>
```

Plain text is the supported content shape. Nested markup inside `children` is ignored rather than partially animated, which keeps the animation and accessibility tree predictable.
