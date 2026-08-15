import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type TextRevealSplitMode = "full" | "word" | "char" | "line";

export type TextRevealDirection =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top";

export interface TextRevealSpring {
  stiffness?: number;
  damping?: number;
  mass?: number;
  restSpeed?: number;
  restDelta?: number;
}

export interface TextRevealProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Text to reveal. `children` takes precedence when both are provided. */
  text?: string;
  /** Text content to reveal. Plain text and numbers are supported. */
  children?: ReactNode;
  /** How the text is split before each unit is revealed. */
  split?: TextRevealSplitMode;
  /** Direction of the coloured wipe. */
  direction?: TextRevealDirection;
  /** Delay, in seconds, between each split unit. */
  stagger?: number;
  /** Duration, in seconds, of each coloured wipe. */
  duration?: number;
  /** Vertical offset, in pixels, used by the text entrance animation. */
  textOffset?: number;
  /** Framer Motion spring settings for the text entrance. */
  spring?: TextRevealSpring;
  /** Colour of the reveal rectangle. */
  blockColor?: string;
  /** Colour of the revealed text. Defaults to `currentColor`. */
  textColor?: string;
  /** Class applied to each animated text span. */
  textClassName?: string;
  /** Class applied to each animated wipe span. */
  blockClassName?: string;
  /** Inline styles applied to each animated text span. */
  textStyle?: CSSProperties;
  /** Inline styles applied to each animated wipe span. */
  blockStyle?: CSSProperties;
  /** Change this value to replay the animation without remounting the parent. */
  replayKey?: string | number;
}
