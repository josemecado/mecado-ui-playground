// StreamingTextBubblePlayground.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { StreamingTextBubble } from "./StreamingTextBubble";
import NavigationMenuItem from "../../projects/projectChatWindow/SideMenuBar/NavigationMenuItem";
import { Home } from "lucide-react";

/* ----------------------------
   StreamingTextBubble (inline)
   ---------------------------- */

/* ----------------------------
   Standalone Playground Demo
   ---------------------------- */

const SAMPLE =
  "Hey there! This is a sample AI response streaming into the bubble—two words at a time—to mimic a real-time typing effect. You can click the bubble to skip to the end.";

const FAST_SAMPLE =
  "I can tell that no Ansys applications are connected based on the system context information provided to me at the top of our conversation. In the system context, there's a specific section that indicates the connection status. Pretty soon after I started working on this book I realized that the title was sort of a taunt to myself. Say everything? Saying everything is a writer’s dream. It’s what you think you’ll get to do when you write a book. Get it all between covers! Then you learn that a book ends up feeling really short. And you never get to say more than a fraction of what you want";

const StreamingTextBubblePlayground: React.FC = () => {
  const [text, setText] = useState(SAMPLE);
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <Page>
      <Panel>
        <Controls>
          <button
            type="button"
            onClick={() => {
              setText(SAMPLE);
              setIsStreaming(true);
            }}
          >
            Stream sample
          </button>
          <button
            type="button"
            onClick={() => {
              setText(FAST_SAMPLE);
              setIsStreaming(true);
            }}
          >
            Stream (chars, fast)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsStreaming(false);
              setText("");
            }}
          >
            Reset
          </button>
        </Controls>
{/* 
        <StreamingTextBubble
          text={text}
          isStreaming={isStreaming}
          wordsPerChunk={2}
          delayBetweenChunks={120}
          allowSkipOnClick
          onStreamingComplete={() => setIsStreaming(false)}
        /> */}

        {/* Fast char-mode example */}
        {text === FAST_SAMPLE && (
          <StreamingTextBubble
            text={text}
            isStreaming={isStreaming}
            mode="chars"
            charsPerChunk={4}
            delayBetweenChunks={20}
            allowSkipOnClick
            onStreamingComplete={() => setIsStreaming(false)}
          />
        )}

        {text === FAST_SAMPLE && (
          <StreamingTextBubble
            text={text}
            isStreaming={isStreaming}
            mode="chars"
            charsPerChunk={2}
            delayBetweenChunks={40}
            allowSkipOnClick
            onStreamingComplete={() => setIsStreaming(false)}
          />
        )}

          <NavigationMenuItem
            icon={<Home />}
            text="Geometry"
            isActive={true}
            isCollapsed={false}
            disabled={false}
            tooltip={"No geometry available for this version"}
            onClick={() => {
         
            }}
          />

          <NavigationMenuItem
            icon={<Home />}
            text="Geometry"
            isActive={true}
            isCollapsed={false}
            disabled={true}
            tooltip={"No geometry available for this version"}
            onClick={() => {
         
            }}
          />
      </Panel>
    </Page>
  );
};

export default StreamingTextBubblePlayground;

/* ----------------------------
   Styles
   ---------------------------- */

const Page = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: start center;
  background: var(--bg-primary); /* slate-900 */
  padding: 32px 16px;
`;

const Panel = styled.div`
  width: 100%;
  max-width: 900px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  button {
    padding: 8px 12px;
    border: none;
    border-radius: 10px;
    background: #3b82f6;
    color: white;
    font-size: 14px;
    cursor: pointer;
  }
  button:hover {
    background: #2563eb;
  }
`;
