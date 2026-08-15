"use client";

import { motion } from "framer-motion";
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useMemo,
  type CSSProperties,
  type ReactElement,
  type ReactNode
} from "react";

import { isWhitespace, splitText } from "./split";
import type {
  TextRevealDirection,
  TextRevealProps,
  TextRevealSpring
} from "./types";

const DEFAULT_SPRING: Required<
  Pick<TextRevealSpring, "stiffness" | "damping" | "mass">
> = {
  stiffness: 140,
  damping: 14,
  mass: 1
};

const WIPE_EASE = [0.77, 0, 0.175, 1] as const;

interface WipeConfig {
  vertical: boolean;
  origin: readonly [number, number, number, number];
}

function getWipeConfig(direction: TextRevealDirection): WipeConfig {
  switch (direction) {
    case "right-to-left":
      return { vertical: false, origin: [1, 1, 0, 0] };
    case "top-to-bottom":
      return { vertical: true, origin: [0, 0, 1, 1] };
    case "bottom-to-top":
      return { vertical: true, origin: [1, 1, 0, 0] };
    case "left-to-right":
    default:
      return { vertical: false, origin: [0, 0, 1, 1] };
  }
}

function textFromChildren(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement(child)) {
        return textFromChildren(child.props.children);
      }

      return "";
    })
    .join("");
}

function singleRootElement(children: ReactNode): ReactElement | undefined {
  const childArray = Children.toArray(children);
  const child = childArray.length === 1 ? childArray[0] : undefined;

  return isValidElement(child) && child.type !== Fragment ? child : undefined;
}

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

interface RevealUnitProps {
  value: string;
  delay: number;
  line: boolean;
  wipe: WipeConfig;
  duration: number;
  textOffset: number;
  spring: Required<Pick<TextRevealSpring, "stiffness" | "damping" | "mass">> &
    Pick<TextRevealSpring, "restSpeed" | "restDelta">;
  textColor: string;
  blockColor: string;
  textClassName?: string;
  blockClassName?: string;
  textStyle?: CSSProperties;
  blockStyle?: CSSProperties;
}

function RevealUnit({
  value,
  delay,
  line,
  wipe,
  duration,
  textOffset,
  spring,
  textColor,
  blockColor,
  textClassName,
  blockClassName,
  textStyle,
  blockStyle
}: RevealUnitProps) {
  if (isWhitespace(value)) {
    return (
      <span
        style={{
          whiteSpace: "pre",
          display: line ? "block" : "inline"
        }}
      >
        {value}
      </span>
    );
  }

  const textInitial = { opacity: 0, y: textOffset };
  const textAnimate = { opacity: 1, y: 0 };

  const blockInitial = wipe.vertical
    ? { scaleX: 1, scaleY: 0, originX: 0.5, originY: wipe.origin[0] }
    : { scaleX: 0, scaleY: 1, originX: wipe.origin[0], originY: 0.5 };

  const blockAnimate = wipe.vertical
    ? {
        scaleX: 1,
        scaleY: [0, 1, 1, 0],
        originX: 0.5,
        originY: [...wipe.origin]
      }
    : {
        scaleX: [0, 1, 1, 0],
        scaleY: 1,
        originX: [...wipe.origin],
        originY: 0.5
      };

  const unitStyle: CSSProperties = {
    position: "relative",
    display: line ? "block" : "inline-block",
    overflow: "hidden",
    whiteSpace: "pre",
    verticalAlign: "baseline"
  };

  return (
    <span style={unitStyle}>
      <motion.span
        initial={textInitial}
        animate={textAnimate}
        transition={{
          delay: delay + duration * 0.48,
          type: "spring",
          stiffness: spring.stiffness,
          damping: spring.damping,
          mass: spring.mass,
          ...(spring.restSpeed === undefined
            ? {}
            : { restSpeed: spring.restSpeed }),
          ...(spring.restDelta === undefined
            ? {}
            : { restDelta: spring.restDelta })
        }}
        className={textClassName}
        style={{ color: textColor, ...textStyle }}
      >
        {value || "\u00a0"}
      </motion.span>

      <motion.span
        aria-hidden="true"
        initial={blockInitial}
        animate={blockAnimate}
        transition={{
          delay,
          duration,
          ease: WIPE_EASE,
          times: [0, 0.45, 0.55, 1]
        }}
        className={blockClassName}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          display: "block",
          pointerEvents: "none",
          backgroundColor: blockColor,
          ...blockStyle
        }}
      />
    </span>
  );
}

/**
 * Reveals text, including text inside nested JSX, with a directional coloured
 * wipe and a spring-based text entrance. It is a client component internally,
 * so it can be imported from a Next.js App Router server component without
 * adding `"use client"` there.
 */
export function TextReveal({
  text,
  children,
  split = "full",
  direction = "left-to-right",
  stagger = 0.08,
  duration = 0.55,
  textOffset = 8,
  spring,
  blockColor = "#6366f1",
  textColor = "currentColor",
  textClassName,
  blockClassName,
  textStyle,
  blockStyle,
  replayKey,
  className,
  style,
  ...rest
}: TextRevealProps) {
  const content =
    children !== undefined ? textFromChildren(children) : text ?? "";
  const wipe = useMemo(() => getWipeConfig(direction), [direction]);
  const safeStagger = clampNonNegative(stagger);
  const safeDuration = clampNonNegative(duration);
  const safeTextOffset = Number.isFinite(textOffset) ? textOffset : 8;
  const resolvedSpring = {
    ...DEFAULT_SPRING,
    ...spring
  };

  // Text and mode changes should replay naturally. Consumers can additionally
  // change replayKey when they want to replay the same text and configuration.
  const animationKey = replayKey ?? `${content}\u0000${split}\u0000${direction}`;

  let animatedUnitIndex = 0;
  let textNodeIndex = 0;

  const renderTextNode = (value: string): ReactNode => {
    const textNodeKey = textNodeIndex++;

    return splitText(value, split).map((unit, index) => {
      const whitespace = isWhitespace(unit);
      const delay =
        whitespace || split === "full"
          ? 0
          : animatedUnitIndex++ * safeStagger;

      return (
        <RevealUnit
          key={`${textNodeKey}-${index}-${unit}`}
          value={unit}
          delay={delay}
          line={split === "line"}
          wipe={wipe}
          duration={safeDuration}
          textOffset={safeTextOffset}
          spring={resolvedSpring}
          textColor={textColor}
          blockColor={blockColor}
          textClassName={textClassName}
          blockClassName={blockClassName}
          textStyle={textStyle}
          blockStyle={blockStyle}
        />
      );
    });
  };

  const renderChildren = (nestedChildren: ReactNode): ReactNode =>
    Children.map(nestedChildren, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        return renderTextNode(String(child));
      }

      if (!isValidElement(child)) {
        return child;
      }

      if (child.type === Fragment) {
        return (
          <Fragment key={child.key}>{renderChildren(child.props.children)}</Fragment>
        );
      }

      return cloneElement(child, {
        children: renderChildren(child.props.children)
      });
    });

  const rootElement =
    children !== undefined ? singleRootElement(children) : undefined;
  const renderedContent = renderChildren(
    rootElement ? rootElement.props.children : children !== undefined ? children : text
  );

  if (rootElement) {
    const rootClassName = [rootElement.props.className, className]
      .filter(Boolean)
      .join(" ");
    const rootStyle =
      rootElement.props.style || style
        ? { ...rootElement.props.style, ...style }
        : undefined;

    return cloneElement(rootElement, {
      ...rest,
      key: animationKey,
      className: rootClassName || undefined,
      style: rootStyle,
      children: renderedContent
    });
  }

  return (
    <span
      key={animationKey}
      className={className}
      style={{
        display: "inline-block",
        whiteSpace: split === "line" ? "normal" : "pre-wrap",
        ...style
      }}
      {...rest}
    >
      {renderedContent}
    </span>
  );
}
