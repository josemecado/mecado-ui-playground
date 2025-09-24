// ui/VersionFlowControls.tsx
import React from "react";
import styled from "styled-components";
import { RefreshCw, Link2, Command, Upload, FolderOpen, X } from "lucide-react";
import { UseNodeSelectionReturn } from "../hooks/useNodeSelection";
import { UseAIGenerationReturn } from "../hooks/useAIGeneration";

// ===== STYLED COMPONENTS =====

// Top Left Controls
const TopLeftContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
`;

const KeyboardHint = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  padding: 8px;
  font-size: 12px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SelectionInfo = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: var(--text-primary);
`;

const SelectionItem = styled.div<{ $isSource?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-bg);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
`;

const SelectionBadge = styled.div<{ $isSource?: boolean }>`
  background: ${(props) =>
    props.$isSource ? "var(--accent-primary)" : "var(--primary-action)"};
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const SelectionVersion = styled.div`
  font-weight: 600;
  color: var(--text-muted);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent-primary);
  color: white;
  border: 1px solid var(--primary-action);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:enabled {
    opacity: 0.7;
    transform: translateY(-1px);
  }

  &:active:enabled {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ExploreButton = styled(ActionButton)`
  background: var(--primary-action);
  border-color: var(--primary-action);
`;

// Top Right Controls
const TopRightContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SortButton = styled.button`
  padding: 10px 16px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-action);
  }
`;

// Bottom Left Controls
const BottomLeftContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RefreshButton = styled.button`
  padding: 10px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

  &:hover:enabled {
    background: var(--bg-tertiary);
    border-color: var(--primary-action);

    svg {
      transform: rotate(180deg);
    }
  }

  &:active:enabled {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }
`;

// Mini Selector Wrapper
const MiniSelectorContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: 600px;
  width: auto;
`;

// Success Notification
const SuccessNotificationContainer = styled.div`
  position: absolute;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  background: var(--success-bg);
  color: var(--success-text);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  border: 1px solid var(--success-border);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

// ===== COMPONENT INTERFACES =====

interface TopLeftControlsProps {
  selection: UseNodeSelectionReturn;
  aiGeneration: UseAIGenerationReturn;
  onExplore: () => void;
  onGeometryLink: () => void;
}

interface TopRightControlsProps {
  onSort: () => void;
  onClearSort: () => void;
  hasSortConfig: boolean;
}

interface BottomLeftControlsProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

interface MiniSelectorWrapperProps {
  children: React.ReactNode;
}

interface SuccessNotificationProps {
  children: React.ReactNode;
}

// ===== COMPONENT IMPLEMENTATIONS =====

export const TopLeftControls: React.FC<TopLeftControlsProps> = ({
  selection,
  aiGeneration,
  onExplore,
  onGeometryLink,
}) => {
  return (
    <TopLeftContainer>
      <KeyboardHint>
        <Command />
        Ctrl+Click to select multiple nodes
      </KeyboardHint>

      {/* AI Control Panel - if there's an active generation */}
      {aiGeneration.activeNodeStage && (
        <SelectionInfo>
          <div style={{ fontWeight: 600, marginBottom: 8, color: "var(--accent-primary)" }}>
            AI Generation Progress
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Active Node:</span>
              <strong>{aiGeneration.activeNodeId?.toUpperCase()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Stage:</span>
              <strong>{aiGeneration.activeNodeStage.stage}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Progress:</span>
              <span>{aiGeneration.activeNodeStage.stageIndex + 1}/5</span>
            </div>
            {aiGeneration.queueInfo && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Queue:</span>
                <span>{aiGeneration.queueInfo.current}/{aiGeneration.queueInfo.total} ({aiGeneration.queueInfo.remaining} remaining)</span>
              </div>
            )}
          </div>
          <div style={{ 
            fontSize: 11, 
            color: "var(--text-muted)",
            fontStyle: "italic",
            textAlign: "center"
          }}>
            Stages progress automatically
          </div>
        </SelectionInfo>
      )}

      {/* Selection Info */}
      {selection.hasSelection && (
        <>
          <SelectionInfo>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Selected Versions ({selection.selectedNodeIds.length}/2)
            </div>
            {selection.selectedVersionsInfo.map((versionInfo) => (
              <SelectionItem
                key={versionInfo.id}
                $isSource={versionInfo.isSource}
              >
                <SelectionBadge $isSource={versionInfo.isSource}>
                  {versionInfo.isSource ? "Source" : "Target"}
                </SelectionBadge>
                <SelectionVersion>{versionInfo.title}</SelectionVersion>
              </SelectionItem>
            ))}
          </SelectionInfo>

          {/* Action Buttons */}
          {selection.canGeometryLink && (
            <ActionButton onClick={onGeometryLink}>
              <Link2 />
              Transfer Analysis
            </ActionButton>
          )}

          <ExploreButton
            onClick={onExplore}
            disabled={!selection.canExplore}
            title={"Explore possible geometry variations"}
          >
            Explore Paths
          </ExploreButton>
        </>
      )}
    </TopLeftContainer>
  );
};

export const TopRightControls: React.FC<TopRightControlsProps> = ({
  onSort,
  onClearSort,
  hasSortConfig,
}) => {
  return (
    <TopRightContainer>
      <SortButton onClick={onSort}>
        Sort by Metric
      </SortButton>
      {hasSortConfig && (
        <SortButton onClick={onClearSort}>Clear Sort</SortButton>
      )}
    </TopRightContainer>
  );
};

export const BottomLeftControls: React.FC<BottomLeftControlsProps> = ({
  onRefresh,
  isRefreshing,
}) => {
  return (
    <BottomLeftContainer>
      <RefreshButton
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Refresh geometry for all versions"
      >
        <RefreshCw
          style={{
            animation: isRefreshing ? "spin 1s linear infinite" : "none",
          }}
        />
        {isRefreshing ? "Refreshing..." : "Refresh Geometry"}
      </RefreshButton>
    </BottomLeftContainer>
  );
};

export const MiniSelectorWrapper: React.FC<MiniSelectorWrapperProps> = ({
  children,
}) => {
  return <MiniSelectorContainer>{children}</MiniSelectorContainer>;
};

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  children,
}) => {
  return <SuccessNotificationContainer>{children}</SuccessNotificationContainer>;
};