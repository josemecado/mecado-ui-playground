import React, { useRef, useState } from "react";
import styled from "styled-components";
import { X, ExternalLink } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  tomorrow,
  tomorrowNight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useTheme } from "../../../../utilities/ThemeContext";
import { Copy, Check, Hammer } from "lucide-react";
import { MathJax, MathJaxContext } from "better-react-mathjax";

export type ToolCallBubbleProps = {
  /** Main title */
  title: string;
  /** Tool content - main rich content to display (text, math, etc) */
  toolContent: React.ReactNode;
  /** Debug content - typically JSON data for debugging */
  debugContent?: React.ReactNode;
  /** Callback when copying debug content */
  onCopy?: () => void;
  /** Whether to enable LaTeX rendering */
  enableLatex?: boolean;
  /** Links to display */
  links?: Array<{ url: string; label?: string }>;
};

// Helper function to parse and render content with links
const parseContentWithLinks = (content: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <InlineLink
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
        >
          {part}
        </InlineLink>
      );
    }
    return part;
  });
};

// Helper to truncate content for preview
const truncateContent = (
  content: React.ReactNode,
  maxLength = 150
): React.ReactNode => {
  if (typeof content === "string") {
    if (content.length > maxLength) {
      return content.substring(0, maxLength) + "...";
    }
    return content;
  }
  return content;
};

export default function ToolCallBubble({
  title,
  toolContent,
  debugContent,
  onCopy,
  enableLatex = false,
  links,
}: ToolCallBubbleProps) {
  const [showToolModal, setShowToolModal] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  // MathJax configuration
  const mathJaxConfig = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ],
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ],
    },
  };

const renderContent = (content: React.ReactNode, isPreview = false) => {
  const processedContent = isPreview ? truncateContent(content) : content;

  if (enableLatex) {
    return (
      <MathJaxContext config={mathJaxConfig}>
        <MathJax>{processedContent}</MathJax>
      </MathJaxContext>
    );
  }

  if (typeof processedContent === "string") {
    return parseContentWithLinks(processedContent);
  }

  return processedContent;
};

  return (
    <>
      <Container>
        <Header>
          <Left>
            <AppMeta>
              <AppName>Vulcan</AppName>
              <AppPill>Tool</AppPill>
            </AppMeta>
          </Left>
          {debugContent && (
            // In the Header section, update the SmallActionButton:
<SmallActionButton
  onClick={(e) => {
    e.stopPropagation();
    setShowToolModal(false); // Close tool modal if open
    setShowDebugModal(true);
  }}
>
  <span>Debug</span>
</SmallActionButton>
            
          )}
        </Header>

        <LabelRow>
          <Title>{title}:</Title>
        </LabelRow>

        {/* Body shows preview of toolContent */}
        <Body
          onClick={() => {
            if (!showDebugModal) {
              setShowToolModal(true);
            }
          }}
        >
          <Content>
            <PreviewContent>{renderContent(toolContent, true)}</PreviewContent>
            <ClickHint>Click to view full content</ClickHint>
          </Content>
        </Body>

        {/* Display links if provided */}
        {links && links.length > 0 && (
          <LinksContainer>
            {links.map((link, index) => (
              <LinkButton
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
                    <span>{link.label || "Link"}</span>
              </LinkButton>
            ))}
          </LinksContainer>
        )}
      </Container>

      {/* Tool Content Modal - Shows the main rich content */}
      {showToolModal && (
        <ModalOverlay
            onClick={(e) => {
      if (e.target === e.currentTarget) setShowToolModal(false);
    }}
        >
          <ToolModal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{title}</ModalTitle>
              <CloseButton onClick={() => setShowToolModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <ToolModalContent>{renderContent(toolContent)}</ToolModalContent>

              {/* Display links in modal if provided */}
              {links && links.length > 0 && (
                <ModalLinksSection>
                  <LinksSectionTitle>Related Links:</LinksSectionTitle>
                  <ModalLinksContainer>
                    {links.map((link, index) => (
                      <ModalLink
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                         <ExternalLink size={14} />
                        <span>{link.label || "Link"}</span>
                      </ModalLink>
                    ))}
                  </ModalLinksContainer>
                </ModalLinksSection>
              )}
            </ModalBody>
          </ToolModal>
        </ModalOverlay>
      )}

      {/* Debug Modal - Shows JSON/debug data */}
      {showDebugModal && debugContent && (
        <ModalOverlay
            onClick={(e) => {
      // Only close if the original click started on the overlay itself
      if (e.target === e.currentTarget) setShowDebugModal(false);
    }}
        >
          <DebugModal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Debug: {title}</ModalTitle>
              <CloseButton onClick={() => setShowDebugModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <DebugModalBody>
              <SubtitleContainer>
                <ModalSubtitle>Debug Logs:</ModalSubtitle>
                <SmallActionButton
                  onClick={() => {
                    onCopy?.();
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </SmallActionButton>
              </SubtitleContainer>

              <SyntaxHighlighter
                language="json"
                style={theme === "dark" ? tomorrowNight : tomorrow}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  maxHeight: "60vh",
                  overflow: "auto",
                }}
                wrapLines
                wrapLongLines
              >
                {typeof debugContent === "string"
                  ? debugContent
                  : JSON.stringify(debugContent, null, 2)}
              </SyntaxHighlighter>
            </DebugModalBody>
          </DebugModal>
        </ModalOverlay>
      )}
    </>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AppMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AppName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.1px;
`;

const AppPill = styled.span`
  font-size: 10px;
  letter-spacing: 0.5px;
  border-radius: 6px;
  padding: 3px 4px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid rgba(148, 163, 184, 0.25);
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 0 8px;
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.3px;
`;

const Body = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 12px;
  background: var(--bg-tertiary);
  padding: 12px;
  border: 1px solid var(--border-bg);
  border-left: 3px solid var(--primary-action);
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;

  &:hover {
    background: var(--hover-bg);
  }
`;

const Content = styled.div`
  line-height: 1.45;
  font-size: 15px;
  width: 100%;
`;

const PreviewContent = styled.div`
  color: var(--text-primary);
  font-style: normal;
  line-height: 1.5;
  max-height: 100px;
  overflow: hidden;
  position: relative;

  /* Fade out effect for long content */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    pointer-events: none;
  }
`;

const ClickHint = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
`;

const LinksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 13px;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  span {
    line-height: 1;
  }
`;

const InlineLink = styled.a`
  color: var(--primary-action);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    text-decoration-thickness: 2px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ToolModal = styled.div`
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const DebugModal = styled(ToolModal)`
  /* Inherits all styles from ToolModal */
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-bg);
  background: var(--bg-secondary);
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: var(--bg-tertiary);
`;

const DebugModalBody = styled(ModalBody)`
  padding: 12px;
`;

const ToolModalContent = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);

  /* Style for mathematical content */
  .MathJax {
    margin: 8px 0;
  }

  /* Style for paragraphs */
  p {
    margin: 12px 0;
  }

  /* Style for lists */
  ul,
  ol {
    margin: 12px 0;
    padding-left: 24px;
  }

  li {
    margin: 4px 0;
  }
`;

const SubtitleContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ModalSubtitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const SmallActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 12px;
  background: var(--bg-secondary);
  color: var(--text-muted);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 0.15s ease, background 0.15s ease;

  &:hover {
    background: var(--hover-bg);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  span {
    line-height: 1;
  }
`;

const ModalLinksSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-bg);
`;

const LinksSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0 0 12px 0;
`;

const ModalLinksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModalLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 13px;
  background: var(--bg-secondary);
  color: var(--primary-action);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    transform: translateY(-1px);
  }

  span {
    line-height: 1;
  }
`;
