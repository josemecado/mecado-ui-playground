// VersionMiniSelector.tsx
import React, { useState, useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { VersionFlowPreview } from "../views/VersionFlowPreview";

import { GitFork } from "lucide-react";

interface VersionMiniSelectorProps {
  versions: ProjectVersion[];
  activeVersionId: string;
  onVersionChange: (versionId: string) => void;
  onNewVersion?: () => void;
}

type NodeState = "active" | "parent" | "child";

export const VersionMiniSelector: React.FC<VersionMiniSelectorProps> = ({
  versions,
  activeVersionId,
  onVersionChange,
  onNewVersion,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Update the timeout delay at the top of the component
  const PREVIEW_HIDE_DELAY = 300; // Increased from 100ms to 300ms
  const PREVIEW_SHOW_DELAY = 200; // Add delay before showing

  const byId = useMemo(
    () => new Map(versions.map((v) => [v.id, v])),
    [versions]
  );
  const active = byId.get(activeVersionId) || null;

  // Build ancestor chain (oldest → … → immediate parent)
  const ancestors = useMemo(() => {
    const chain: ProjectVersion[] = [];
    let cur = active ?? null;
    while (cur?.parentVersion) {
      const p = byId.get(cur.parentVersion);
      if (!p) break;
      chain.unshift(p);
      cur = p;
    }
    return chain;
  }, [active, byId]);

  const immediateParent = ancestors.length
    ? ancestors[ancestors.length - 1]
    : null;
  const extraAncestorsCount = Math.max(
    0,
    ancestors.length - (immediateParent ? 1 : 0)
  );

  // First child (direct)
  const firstChild = useMemo(() => {
    if (!active) return null;
    const kids = versions.filter((v) => v.parentVersion === active.id);
    return kids[0] || null;
  }, [versions, active]);

  // Hover preview handlers
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(
      () => setShowPreview(true),
      PREVIEW_SHOW_DELAY
    );
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(
      () => setShowPreview(false),
      PREVIEW_HIDE_DELAY
    );
  };
  const handlePreviewMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Also update handlePreviewMouseLeave to have consistent behavior
  const handlePreviewMouseLeave = () => {
    timeoutRef.current = setTimeout(
      () => setShowPreview(false),
      PREVIEW_HIDE_DELAY
    );
  };

  // Handle version change from preview
  const handleVersionChangeFromPreview = useCallback(
    (versionId: string) => {
      // Immediately trigger the version change
      onVersionChange(versionId);

      // Keep the preview open after selection
      // This allows users to navigate through multiple versions
      // without the preview closing each time
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [onVersionChange]
  );

  return (
    <SelectorWrapper ref={containerRef}>
      <SelectorContainer
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <LogoSection>
          <GitFork size={17} />
          <VersionSelectorTitle>Versions</VersionSelectorTitle>
        </LogoSection>

        {/* [1] Summary circle */}
        {extraAncestorsCount > 0 ? (
          <SummaryCircle
            title={`${extraAncestorsCount} more parent${
              extraAncestorsCount > 1 ? "s" : ""
            }`}
            aria-label={`${extraAncestorsCount} more parent${
              extraAncestorsCount > 1 ? "s" : ""
            }`}
          >
            +{extraAncestorsCount}
          </SummaryCircle>
        ) : null}

        {/* connection to parent only if parent exists */}
        {immediateParent && extraAncestorsCount > 0 && (
          <ConnectionLine $dimmed />
        )}

        {/* [2] Direct parent (if any) */}
        {immediateParent && (
          <>
            <VersionNode
              $state="parent"
              onClick={() => onVersionChange(immediateParent.id)}
              title={immediateParent.title}
            >
              {immediateParent.id.toUpperCase()}
            </VersionNode>
            <ConnectionLine $dimmed={false} />
          </>
        )}

        {/* [3] Active (always) */}
        <VersionNode
          $state="active"
          onClick={() => onVersionChange(activeVersionId)}
          title={active?.title ?? "Active"}
        >
          {activeVersionId.toUpperCase()}
        </VersionNode>

        {/* [4] First child (if any) */}
        {firstChild && (
          <>
            <ConnectionLine $dimmed={false} />
            <VersionNode
              $state="child"
              onClick={() => onVersionChange(firstChild.id)}
              title={firstChild.title}
            >
              {firstChild.id.toUpperCase()}
            </VersionNode>
          </>
        )}

        {/* [5] Add button (always at end if provided) */}
        {onNewVersion && (
          <>
            <ConnectionLine $dimmed />
            <AddButton
              onClick={onNewVersion}
              aria-label="Create new version"
              title="Create new version"
            >
              +
            </AddButton>
          </>
        )}
      </SelectorContainer>

      {showPreview && (
        <PreviewPopup
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
        >
          <VersionFlowPreview
            versions={versions}
            height="250px"
            onVersionChange={handleVersionChangeFromPreview}
            activeVersionId={activeVersionId}
          />
        </PreviewPopup>
      )}
    </SelectorWrapper>
  );
};

/* ================== styled ================== */

const SelectorWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-bg);
  max-width: 100%;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
`;

/* Summary circle: shows "—" (No Parent) or "+N" (extra ancestors) or empty if none extra */
const SummaryCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px dashed var(--border-outline);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const PreviewPopup = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  overflow: hidden;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  border: 1px solid var(--border-bg);
  background: var(--bg-secondary);

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--border-bg);
  }
`;

const VersionNode = styled.button<{ $state: NodeState; $isArchived?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 11px;
  font-weight: 700;
  border: 1px solid var(--border-outline);
  position: relative;
  z-index: 2;
  flex-shrink: 0;

  &:active {
    transform: scale(0.95);
  }

  ${(p) => {
    switch (p.$state) {
      case "active":
        return `
          background: var(--primary-alternate);
          color: var(--text-inverted);
          opacity: 1;
          animation: pulse 0.4s ease-out;
          &:hover { 
            transform: scale(1.1); 
            box-shadow: 0 0 0 4px rgba(var(--primary-action-rgb), 0.2);
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
        `;
      case "parent":
        return `
          background: var(--bg-tertiary);
          color: var(--text-primary);
          opacity: 0.9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          &:hover { 
            transform: scale(1.1); 
            border-color: var(--accent-neutral); 
            opacity: 1;
            background: var(--primary-alternate);
            color: var(--text-inverted);
          }
        `;
      case "child":
      default:
        return `
          background: var(--bg-tertiary);
          color: var(--text-muted);
          opacity: 0.6;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          &:hover { 
            transform: scale(1.1); 
            border-color: var(--border-bg); 
            opacity: 0.9;
            background: var(--primary-alternate);
            color: var(--text-inverted);
          }
        `;
    }
  }}

  opacity: ${(p) => (p.$isArchived ? 0.5 : 1)};
`;

const ConnectionLine = styled.div<{ $dimmed: boolean }>`
  width: 20px;
  height: 2px;
  background: var(--border-outline);
  opacity: ${(p) => (p.$dimmed ? 0.35 : 0.65)};
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`;

const AddButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px dashed var(--border-outline);
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  color: var(--text-muted);
  opacity: 0.7;
  position: relative;
  z-index: 2;
  flex-shrink: 0;

  &:hover {
    background: var(--primary-alternate);
    border-color: var(--primary-action);
    border-style: solid;
    color: var(--text-inverted);
    opacity: 1;
  }
`;

const VersionSelectorTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  margin-right: 4px;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
