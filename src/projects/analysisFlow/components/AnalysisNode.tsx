// components/AnalysisIndividualNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled, { keyframes } from "styled-components";
import {
  Analysis,
  CurrentStepInfo,
} from "../../versionNodes/utils/VersionInterfaces";
import {
  LoaderCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  AudioLines,
  Flame,
  PlayCircle,
  RotateCcw,
  FileText,
} from "lucide-react";
import { NodeUIState, deriveNodeUIState } from "./analysis/analysisNodeState";
import {
  IdleContent,
  RunningPrimaryContent,
  RunningSecondaryContent,
  WaitingWithSharedContent,
  CompletedContent,
  FailedContent,
} from "./analysis/AnalysisNodeContent";

export const AnalysisIndividualNode: React.FC<NodeProps> = ({ data }) => {
  const analysis = data as unknown as Analysis & {
    onAnimateNode?: () => void;
    isGhostNode?: boolean;
    ghostGroupName?: string;
    currentStepInfo?: CurrentStepInfo | null;
  };

  const uiState = deriveNodeUIState(analysis, analysis.currentStepInfo || null);
  const isGhost = analysis.isGhostNode || false;

  const getStatusIcon = () => {
    switch (uiState) {
      case NodeUIState.RUNNING_PRIMARY:
      case NodeUIState.RUNNING_SECONDARY:
        return <LoaderCircle size={14} className="spin" />;
      case NodeUIState.COMPLETED:
        return <CheckCircle size={14} />;
      case NodeUIState.FAILED:
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("thermal")) return <Flame size={16} />;
    if (type.includes("modal") || type.includes("frequency") || type.includes("harmonic"))
      return <AudioLines size={16} />;
    if (type.includes("stress") || type.includes("deformation") || 
        type.includes("safety") || type.includes("buckling"))
      return <Settings size={16} />;
    return <BarChart3 size={16} />;
  };

  const getActionButtons = () => {
    switch (uiState) {
      case NodeUIState.IDLE:
      case NodeUIState.WAITING_WITH_SHARED:
        return (
          <ActionButton $variant="primary" $small onClick={analysis.onAnimateNode}>
            <PlayCircle size={12} />
            Run
          </ActionButton>
        );
      case NodeUIState.COMPLETED:
        return (
          <>
            <ActionButton $variant="secondary" $small>
              <FileText size={12} />
              Details
            </ActionButton>
            <ActionButton $variant="tertiary" $small>
              <RotateCcw size={12} />
            </ActionButton>
          </>
        );
      case NodeUIState.FAILED:
        return (
          <>
            <ActionButton $variant="primary" $small>
              <RotateCcw size={12} />
              Retry
            </ActionButton>
            <ActionButton $variant="tertiary" $small>
              <FileText size={12} />
              Logs
            </ActionButton>
          </>
        );
      case NodeUIState.RUNNING_PRIMARY:
      case NodeUIState.RUNNING_SECONDARY:
        return (
          <RunningIndicator>
            <LoaderCircle size={10} className="spin" />
            Running...
          </RunningIndicator>
        );
    }
  };

  return (
    <NodeContainer $uiState={uiState} $isGhost={isGhost}>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "var(--primary-alternate)",
          border: "2px solid var(--bg-primary)",
          width: 10,
          height: 10,
          left: -5,
        }}
      />

      {/* Header */}
      <NodeHeader $uiState={uiState}>
        <HeaderLeft>
          <TypeIconWrapper>{getTypeIcon(analysis.type)}</TypeIconWrapper>
          <HeaderText>
            <AnalysisName>{analysis.name}</AnalysisName>
            <AnalysisType>
              {isGhost && analysis.ghostGroupName
                ? `From ${analysis.ghostGroupName}`
                : isGhost
                ? "From Other Group"
                : "Analysis"}
            </AnalysisType>
          </HeaderText>
        </HeaderLeft>
        <StatusIconWrapper $uiState={uiState}>{getStatusIcon()}</StatusIconWrapper>
      </NodeHeader>

      <Divider />

      {/* Main Content - Much cleaner! */}
      <NodeBody>
        {uiState === NodeUIState.IDLE && <IdleContent analysis={analysis} />}
        {uiState === NodeUIState.RUNNING_PRIMARY && <RunningPrimaryContent analysis={analysis} />}
        {uiState === NodeUIState.RUNNING_SECONDARY && (
          <RunningSecondaryContent analysis={analysis} currentStepInfo={analysis.currentStepInfo} />
        )}
        {uiState === NodeUIState.WAITING_WITH_SHARED && <WaitingWithSharedContent analysis={analysis} />}
        {uiState === NodeUIState.COMPLETED && <CompletedContent analysis={analysis} />}
        {uiState === NodeUIState.FAILED && <FailedContent analysis={analysis} />}
      </NodeBody>

      <Divider />

      {/* Action Buttons */}
      <ActionBar>{getActionButtons()}</ActionBar>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "var(--primary-alternate)",
          border: "2px solid var(--bg-primary)",
          width: 10,
          height: 10,
          right: -5,
        }}
      />
    </NodeContainer>
  );
};

// Styled components
const NodeContainer = styled.div<{ $uiState: NodeUIState; $isGhost?: boolean }>`
  position: relative;
  background: ${(props) => {
    if (props.$uiState === NodeUIState.RUNNING_SECONDARY) return "var(--bg-tertiary)";
    switch (props.$uiState) {
      case NodeUIState.COMPLETED:
        return "linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)";
      case NodeUIState.FAILED:
      case NodeUIState.RUNNING_PRIMARY:
        return "var(--bg-tertiary)";
      default:
        return "var(--bg-secondary)";
    }
  }};
  
  border: 2px solid ${(props) => {
    if (props.$isGhost) return "var(--accent-secondary)";
    if (props.$uiState === NodeUIState.RUNNING_SECONDARY) return "var(--accent-secondary)";
    switch (props.$uiState) {
      case NodeUIState.COMPLETED:
        return "var(--success)";
      case NodeUIState.FAILED:
        return "var(--error)";
      case NodeUIState.RUNNING_PRIMARY:
        return "var(--accent-primary)";
      default:
        return "var(--border-outline)";
    }
  }};
  
  border-radius: 12px;
  min-width: 260px;
  max-width: 280px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$uiState === NodeUIState.RUNNING_SECONDARY
      ? "0 4px 20px rgba(var(--accent-secondary-rgb), 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.1)"};
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const NodeHeader = styled.div<{ $uiState: NodeUIState }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${(props) => {
    switch (props.$uiState) {
      case NodeUIState.COMPLETED:
        return "rgba(16, 185, 129, 0.1)";
      case NodeUIState.FAILED:
        return "rgba(239, 68, 68, 0.1)";
      case NodeUIState.RUNNING_PRIMARY:
      case NodeUIState.RUNNING_SECONDARY:
        return "rgba(var(--accent-primary-rgb), 0.1)";
      default:
        return "rgba(255, 255, 255, 0.03)";
    }
  }};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const TypeIconWrapper = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--primary-alternate);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverted);
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`;

const AnalysisName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AnalysisType = styled.div`
  font-size: 9px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.3px;
`;

const StatusIconWrapper = styled.div<{ $uiState: NodeUIState }>`
  color: ${(props) => {
    switch (props.$uiState) {
      case NodeUIState.COMPLETED:
        return "var(--success)";
      case NodeUIState.FAILED:
        return "var(--error)";
      case NodeUIState.RUNNING_PRIMARY:
      case NodeUIState.RUNNING_SECONDARY:
        return "var(--accent-primary)";
      default:
        return "var(--text-muted)";
    }
  }};
  flex-shrink: 0;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-outline);
`;

const NodeBody = styled.div`
  padding: 12px;
  min-height: 100px;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid var(--border-bg);
`;

const ActionButton = styled.button<{
  $variant: "primary" | "secondary" | "tertiary";
  $small?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: ${(props) => (props.$small ? "6px 10px" : "8px 12px")};
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  border: none;

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background: var(--primary-alternate);
          color: var(--text-inverted);
          
          &:hover {
            background: var(--primary-action);
            transform: translateY(-1px);
          }
        `;
      case "secondary":
        return `
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-outline);
          
          &:hover {
            background: var(--hover-bg);
            border-color: var(--primary-alternate);
          }
        `;
      case "tertiary":
        return `
          background: var(--accent-primary);
          color: white;
          border: 1px solid var(--border-bg);
          
          &:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
          }
        `;
    }
  }}
`;

const RunningIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-primary);
  flex: 1;
`;