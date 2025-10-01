// components/AnalysisIndividualNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled, { keyframes, css } from "styled-components";
import { Analysis } from "../../versionNodes/utils/VersionInterfaces";
import {
  LoaderCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Settings,
  AlertTriangle,
  PlayCircle,
  RotateCcw,
  FileText,
  Calculator,
  AudioLines,
  Flame
} from "lucide-react";

export const AnalysisIndividualNode: React.FC<NodeProps> = ({ data }) => {
  // We know this is safe because we control what data is passed
  const analysis = data as unknown as Analysis & { onAnimateNode?: () => void };
  const nodeStatus = analysis.status;

  const getStatusIcon = () => {
    switch (analysis.status) {
      case "running":
        return <LoaderCircle size={14} className="spin" />;
      case "completed":
        return <CheckCircle size={14} />;
      case "failed":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("thermal")) return <Flame size={16} />;
    if (
      type.includes("modal") ||
      type.includes("frequency") ||
      type.includes("harmonic")
    )
      return <AudioLines size={16} />;
    if (
      type.includes("stress") ||
      type.includes("deformation") ||
      type.includes("safety") ||
      type.includes("buckling")
    )
      return <Settings size={16} />;
    return <BarChart3 size={16} />;
  };

  const failedRequirements =
    analysis.requirements?.filter((r) => r.status === "fail") || [];
  const passedRequirements =
    analysis.requirements?.filter((r) => r.status === "pass") || [];

  return (
    <NodeContainer
      $status={nodeStatus}
      $isActive={analysis.status === "running"}
    >
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

      {/* Header - Similar to Group Node */}
      <NodeHeader $status={nodeStatus}>
        <HeaderLeft>
          <TypeIconWrapper>{getTypeIcon(analysis.type)}</TypeIconWrapper>
          <HeaderText>
            <AnalysisName>{analysis.name}</AnalysisName>
            <AnalysisType>Analysis</AnalysisType>
          </HeaderText>
        </HeaderLeft>
        <StatusIconWrapper $status={nodeStatus}>
          {getStatusIcon()}
        </StatusIconWrapper>
      </NodeHeader>

      <Divider />

      {/* Main Content - Changes based on status */}
      <NodeBody>
        {/* PENDING STATE */}
        {nodeStatus === "pending" && (
          <PendingContent>
            <InfoSection>
              <InfoLabel>Requirements</InfoLabel>
              <InfoValue>{analysis.requirements?.length || 0} checks</InfoValue>
            </InfoSection>
            <StatusMessage>
              <Clock size={12} />
              Pending analysis
            </StatusMessage>
          </PendingContent>
        )}

        {/* {analysis.onAnimateNode && nodeStatus === "pending" && (
          <TestButton onClick={analysis.onAnimateNode}>
            Test Analysis Animation
          </TestButton>
        )} */}

        {/* RUNNING STATE */}
        {nodeStatus === "running" && (
          <RunningContent>
            <ProgressSection>
              <ProgressLabel>
                <Calculator size={10}/>
                Computing results...
              </ProgressLabel>
              <ProgressBar>
                <ProgressFill $progress={analysis.progress || 0} />
              </ProgressBar>
              <ProgressText>{analysis.progress || 0}%</ProgressText>
            </ProgressSection>
            <RunningInfo>
              <InfoRow>
                <InfoIcon>
                  <FileText size={10} />
                </InfoIcon>
                <InfoText>
                  Evaluating {analysis.requirements?.length || 0} requirements
                </InfoText>
              </InfoRow>
            </RunningInfo>
          </RunningContent>
        )}

        {/* COMPLETED STATE */}
        {nodeStatus === "completed" && (
          <CompletedContent>
            <MetricsGrid>
              <MetricCard>
                <MetricLabel>Metrics</MetricLabel>
                <MetricValue>{analysis.metrics?.length || 0}</MetricValue>
              </MetricCard>
              <MetricCard>
                <MetricLabel>Passed</MetricLabel>
                <MetricValue $status="pass">
                  {passedRequirements.length}
                </MetricValue>
              </MetricCard>
            </MetricsGrid>
            {analysis.warnings && analysis.warnings.length > 0 && (
              <WarningBadge>
                <AlertTriangle size={10} />
                {analysis.warnings.length} warning
                {analysis.warnings.length > 1 ? "s" : ""}
              </WarningBadge>
            )}
          </CompletedContent>
        )}

        {/* FAILED STATE */}
        {nodeStatus === "failed" && (
          <FailedContent>
            <FailedHeader>
              <XCircle size={12} />
              Analysis Failed
            </FailedHeader>

            {failedRequirements.length > 0 && (
              <FailedRequirements>
                <FailedReqLabel>Failed Requirements:</FailedReqLabel>
                {failedRequirements.slice(0, 2).map((req) => (
                  <FailedReqItem key={req.id}>
                    <XCircle size={8} />
                    <span>{req.name}</span>
                  </FailedReqItem>
                ))}
                {failedRequirements.length > 2 && (
                  <MoreIndicator>
                    +{failedRequirements.length - 2} more
                  </MoreIndicator>
                )}
              </FailedRequirements>
            )}

            {analysis.errors && analysis.errors.length > 0 && (
              <ErrorSummary>
                <ErrorIcon>
                  <AlertTriangle size={10} />
                </ErrorIcon>
                <ErrorText>{analysis.errors[0]}</ErrorText>
              </ErrorSummary>
            )}
          </FailedContent>
        )}
      </NodeBody>

      <Divider />

      {/* Action Buttons */}
      <ActionBar>
        {nodeStatus === "pending" && (
          <ActionButton $variant="primary" $small onClick={analysis.onAnimateNode}>
            <PlayCircle size={12} />
            Run
          </ActionButton>
        )}

        {nodeStatus === "completed" && (
          <>
            <ActionButton $variant="secondary" $small>
              <FileText size={12} />
              Details
            </ActionButton>
            <ActionButton $variant="tertiary" $small>
              <RotateCcw size={12} />
            </ActionButton>
          </>
        )}

        {nodeStatus === "failed" && (
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
        )}

        {nodeStatus === "running" && (
          <RunningIndicator>
            <LoaderCircle size={10} className="spin" />
            Running...
          </RunningIndicator>
        )}
      </ActionBar>

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

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.3); }
  50% { box-shadow: 0 0 40px rgba(var(--accent-primary-rgb), 0.6); }
`;

const progressAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
`;

// Styled Components
const NodeContainer = styled.div<{
  $status: string;
  $isActive?: boolean;
}>`
  position: relative;
  background: ${(props) => {
    switch (props.$status) {
      case "completed":
        return "linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)";
      case "failed":
        return "var(--bg-tertiary)";
      case "running":
        return "var(--bg-tertiary)";
      default:
        return "var(--bg-secondary)";
    }
  }};
  border: 2px solid
    ${(props) => {
      switch (props.$status) {
        case "completed":
          return "var(--success)";
        case "failed":
          return "var(--error)";
        case "running":
          return "var(--accent-primary)";
        default:
          return "var(--border-outline)";
      }
    }};
  border-radius: 12px;
  min-width: 220px;
  max-width: 250px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: all 0.3s ease;

  ${(props) =>
    props.$isActive &&
    css`
      border-image-repeat
    `}

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

const ActivePulse = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 2px solid var(--accent-primary);
  animation: ${pulseRing} 2s ease-out infinite;
  pointer-events: none;
`;

const NodeHeader = styled.div<{ $status: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: ${(props) => {
    switch (props.$status) {
      case "completed":
        return "rgba(16, 185, 129, 0.1)";
      case "failed":
        return "rgba(239, 68, 68, 0.1)";
      case "running":
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

const StatusIconWrapper = styled.div<{ $status: string }>`
  color: ${(props) => {
    switch (props.$status) {
      case "completed":
        return "var(--success)";
      case "failed":
        return "var(--error)";
      case "running":
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
  min-height: 80px;
`;

// Pending State
const PendingContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border-bg);
`;

const InfoLabel = styled.span`
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 11px;
  color: var(--text-primary);
  font-weight: 600;
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
`;

// Running State
const RunningContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProgressLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-primary);
`;

const ProgressBar = styled.div`
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: linear-gradient(
    90deg,
    var(--accent-primary) 0%,
    var(--accent-secondary) 100%
  );
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: ${progressAnimation} 1.5s ease-in-out infinite;
  }
`;

const ProgressText = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
`;

const RunningInfo = styled.div`
  padding: 6px 10px;
  background: rgba(var(--accent-primary-rgb), 0.05);
  border-radius: 6px;
  border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoIcon = styled.div`
  color: var(--accent-primary);
  display: flex;
  align-items: center;
`;

const InfoText = styled.span`
  font-size: 10px;
  color: var(--text-primary);
  font-weight: 500;
`;

// Completed State
const CompletedContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const MetricCard = styled.div`
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const MetricValue = styled.div<{ $status?: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => {
    switch (props.$status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--text-primary)";
    }
  }};
`;

const WarningBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(var(--accent-primary-rgb), 0.1);
  border: 1px solid var(--accent-primary);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-primary);
`;

// Failed State
const FailedContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FailedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--error);
  padding: 6px 8px;
  background: rgba(var(--error-rgb), 0.1);
  border-radius: 6px;
`;

const FailedRequirements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--error);
  border-radius: 6px;
`;

const FailedReqLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
`;

const FailedReqItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--error);
  font-weight: 500;

  svg {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const MoreIndicator = styled.div`
  font-size: 9px;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 2px;
`;

const ErrorSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(var(--error-rgb), 0.05);
  border-radius: 6px;
`;

const ErrorIcon = styled.div`
  color: var(--error);
  flex-shrink: 0;
`;

const ErrorText = styled.div`
  font-size: 9px;
  color: var(--error);
  line-height: 1.3;
  font-weight: 500;
`;

// Action Bar
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

// Add this styled component at the bottom with the others
const TestButton = styled.button`
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
