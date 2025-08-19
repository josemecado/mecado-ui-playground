import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";

type StreamMode = "words" | "chars";

interface StreamingTextBubbleProps {
  text: string;
  isStreaming?: boolean;
  wordsPerChunk?: number;      // used when mode="words"
  charsPerChunk?: number;      // used when mode="chars"
  delayBetweenChunks?: number; // ms
  startDelay?: number;         // ms before streaming starts
  mode?: StreamMode;           // "words" | "chars"
  showCursor?: boolean;
  allowSkipOnClick?: boolean;
  onStreamingComplete?: () => void;
  className?: string;
}

export const StreamingTextBubble: React.FC<StreamingTextBubbleProps> = ({
  text,
  isStreaming = true,
  wordsPerChunk = 2,
  charsPerChunk = 2,
  delayBetweenChunks = 100,
  startDelay = 0,
  mode = "words",
  showCursor = true,
  allowSkipOnClick = true,
  onStreamingComplete,
  className,
}) => {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  const tokens = useMemo<string[]>(() => {
    if (!text) return [];
    if (mode === "chars") return Array.from(text);
    return text.match(/\S+\s*/g) ?? [text]; // words + trailing whitespace
  }, [text, mode]);

  const chunkSize =
    mode === "chars" ? Math.max(1, charsPerChunk) : Math.max(1, wordsPerChunk);

  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = () => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    startTimerRef.current = null;
    intervalRef.current = null;
  };

  const finish = () => {
    clearTimers();
    setDisplayed(text);
    setIndex(tokens.length);
    if (!complete) {
      setComplete(true);
      onStreamingComplete?.();
    }
  };

  useEffect(() => {
    clearTimers();

    if (!isStreaming || !text) {
      setDisplayed(text || "");
      setIndex(tokens.length);
      setComplete(true);
      return;
    }

    setDisplayed("");
    setIndex(0);
    setComplete(false);

    startTimerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setIndex((prev) => {
          const next = Math.min(prev + chunkSize, tokens.length);
          if (next >= tokens.length) {
            finish();
            return next;
          }
          setDisplayed(tokens.slice(0, next).join(""));
          return next;
        });
      }, delayBetweenChunks);
    }, Math.max(0, startDelay));

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isStreaming, mode, chunkSize, delayBetweenChunks, startDelay]);

  useEffect(() => {
    if (complete && displayed !== text) setDisplayed(text);
  }, [complete, displayed, text]);

  const handleClick = () => {
    if (allowSkipOnClick && isStreaming && !complete) finish();
  };

  return (
    <BubbleContainer className={className}>
      <BubbleContent
        role="status"
        aria-live="polite"
        aria-busy={isStreaming && !complete}
        onClick={handleClick}
        $clickable={allowSkipOnClick && isStreaming && !complete}
      >
        {displayed}
        {showCursor && isStreaming && !complete && <Cursor aria-hidden />}
      </BubbleContent>
    </BubbleContainer>
  );
};

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const BubbleContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 12px 0;
`;

const BubbleContent = styled.div<{ $clickable?: boolean }>`
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70ch;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  position: relative;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  user-select: text;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: currentColor;
  margin-left: 2px;
  animation: ${blink} 1s steps(1, end) infinite;
  vertical-align: -0.1em;
`;
