"use client";

import { useState } from "react";
import { TextReveal } from "block-text-reveal";

export function BasicTextRevealExample() {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <main style={{ padding: 48, fontFamily: "system-ui, sans-serif" }}>
      <TextReveal
        split="word"
        stagger={0.08}
        duration={0.55}
        blockColor="#6366f1"
        textColor="currentColor"
        style={{ fontSize: "clamp(2rem, 7vw, 5rem)", fontWeight: 800 }}
        replayKey={replayKey}
      >
        Hello, motion.
      </TextReveal>

      <button
        type="button"
        onClick={() => setReplayKey((key) => key + 1)}
        style={{ display: "block", marginTop: 32 }}
      >
        Replay
      </button>
    </main>
  );
}
