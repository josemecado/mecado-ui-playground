// components/AnalysisGroupNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled, { keyframes, css } from "styled-components";
import { AnalysisGroup } from "../../versionNodes/utils/VersionInterfaces";
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  AlertTriangle,
  ChevronRight,
  Settings,
  BarChart3,
  Flame,
  AudioLines,
  FileChartColumn,
} from "lucide-react";

export const AnalysisGroupNode: React.FC<NodeProps> = ({ data }) => {
  const group = data.group as AnalysisGroup;

  const getStatusIcon = () => {
    switch (group.status) {
      case "passed":
        return <CheckCircle size={14} />;
      case "failed":
        return <XCircle size={14} />;
      case "running":
        return <Activity size={14} className="spin" />;
      case "partial":
        return <AlertTriangle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    if (type.includes("thermal")) return <Flame size={12} />;
    if (
      type.includes("modal") ||
      type.includes("frequency") ||
      type.includes("harmonic")
    )
      return <AudioLines size={12} />;
    if (
      type.includes("stress") ||
      type.includes("deformation") ||
      type.includes("safety")
    )
      return <Settings size={12} />;
    return <BarChart3 size={12} />;
  };

  // Calculate statistics
  const completedAnalyses = group.analyses.filter(
    (a) => a.status === "completed"
  );
  const failedAnalyses = group.analyses.filter((a) => a.status === "failed");
  const runningAnalysis = group.analyses.find((a) => a.status === "running");
  const pendingCount = group.analyses.filter(
    (a) => a.status === "pending"
  ).length;

  const totalCount = group.analyses.length;
  const completedCount = completedAnalyses.length + failedAnalyses.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Get failed requirements from failed analyses
  const failedRequirements = failedAnalyses.flatMap((analysis) =>
    (analysis.requirements || []).filter((req) => req.status === "fail")
  );

  return (
    <NodeContainer
      $status={group.status}
      $isActive={group.status === "running"}
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

      {/* Header */}
      <NodeHeader $status={group.status}>
        <HeaderLeft>
          <GroupIconWrapper>
            <FileChartColumn size={16} />
          </GroupIconWrapper>
          <HeaderText>
            <GroupName>{group.name}</GroupName>
            <GroupType>Analysis Pipeline</GroupType>
          </HeaderText>
        </HeaderLeft>
        <StatusIconWrapper $status={group.status}>
          {getStatusIcon()}
        </StatusIconWrapper>
      </NodeHeader>

      <Divider />

      {/* Body */}
      <NodeBody>
        {/* Progress Overview */}
        <ProgressSection>
          <ProgressHeader>
            <ProgressLabel>Overall Progress</ProgressLabel>
            <ProgressText>
              {completedCount}/{totalCount} Complete
            </ProgressText>
          </ProgressHeader>
          <ProgressBar>
            <ProgressFill
              $percentage={progressPercentage}
              $status={group.status}
              $animated={group.status === "running"}
            />
          </ProgressBar>
        </ProgressSection>
        {/* Status-specific content */}
        {group.status === "running" && runningAnalysis && (
          <RunningSection>
            <RunningLabel>
              <Activity size={10} className="spin" />
              Currently Running
            </RunningLabel>
            <RunningAnalysis>
              {getAnalysisTypeIcon(runningAnalysis.type)}
              <span>{runningAnalysis.name}</span>
              {runningAnalysis.steps &&
                runningAnalysis.currentStepIndex !== undefined && (
                  <StepIndicator>
                    •{" "}
                    {runningAnalysis.steps[runningAnalysis.currentStepIndex]
                      ?.name || "Processing"}
                  </StepIndicator>
                )}
            </RunningAnalysis>
            {runningAnalysis.steps &&
              runningAnalysis.currentStepIndex !== undefined && (
                <StepProgressBar>
                  <StepProgressFill
                    $progress={
                      runningAnalysis.steps[runningAnalysis.currentStepIndex]
                        ?.progress || 0
                    }
                  />
                </StepProgressBar>
              )}
          </RunningSection>
        )}

        {/* Analysis Breakdown */}
        <AnalysisBreakdown>
          <BreakdownHeader>Analysis Breakdown</BreakdownHeader>
          <AnalysisList>
            {group.analyses.slice(0, 3).map((analysis) => (
              <AnalysisItem key={analysis.id} $status={analysis.status}>
                <AnalysisIcon>
                  {getAnalysisTypeIcon(analysis.type)}
                </AnalysisIcon>
                <AnalysisName>{analysis.name}</AnalysisName>
                <AnalysisStatus $status={analysis.status}>
                  {analysis.status === "completed" && <CheckCircle size={10} />}
                  {analysis.status === "failed" && <XCircle size={10} />}
                  {analysis.status === "running" && (
                    <Activity size={10} className="spin" />
                  )}
                  {analysis.status === "pending" && <Clock size={10} />}
                </AnalysisStatus>
              </AnalysisItem>
            ))}
            {group.analyses.length > 3 && (
              <MoreIndicator>
                +{group.analyses.length - 3} more analyses
              </MoreIndicator>
            )}
          </AnalysisList>
        </AnalysisBreakdown>

        {/* Failed/Partial State Details */}
        {(group.status === "failed" || group.status === "partial") &&
          failedAnalyses.length > 0 && (
            <FailedSection>
              <FailedHeader>
                <AlertTriangle size={12} />
                Failed Analyses ({failedAnalyses.length})
              </FailedHeader>
              {failedAnalyses.map((analysis) => (
                <FailedAnalysisCard key={analysis.id}>
                  <FailedAnalysisName>
                    <XCircle size={10} />
                    {analysis.name}
                  </FailedAnalysisName>
                  {analysis.requirements && (
                    <FailedRequirements>
                      {analysis.requirements
                        .filter((r) => r.status === "fail")
                        .slice(0, 2)
                        .map((req) => (
                          <RequirementItem key={req.id}>
                            <ChevronRight size={8} />
                            <span>{req.name}</span>
                          </RequirementItem>
                        ))}
                    </FailedRequirements>
                  )}
                </FailedAnalysisCard>
              ))}
            </FailedSection>
          )}

        {/* Summary Stats */}
        {group.status === "passed" && (
          <SuccessMessage>
            <CheckCircle size={12} />
            All analyses completed successfully
          </SuccessMessage>
        )}

        {pendingCount > 0 && group.status === "pending" && (
          <PendingMessage>
            <Clock size={12} />
            {pendingCount} analyses ready to run
          </PendingMessage>
        )}
      </NodeBody>

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

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;

// Styled Components
const NodeContainer = styled.div<{ $status: string; $isActive?: boolean }>`
  position: relative;
  background: ${(props) => {
    switch (props.$status) {
      case "passed":
        return "linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)";
      case "failed":
      case "partial":
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
        case "passed":
          return "var(--success)";
        case "failed":
          return "var(--error)";
        case "partial":
          return "var(--accent-primary)";
        case "running":
          return "var(--accent-primary)";
        default:
          return "var(--border-outline)";
      }
    }};
  border-radius: 12px;
  min-width: 280px;
  max-width: 320px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  ${(props) =>
    props.$isActive &&
    css`
      animation: ${pulse} 2s ease-in-out infinite;
      box-shadow: 0 8px 24px rgba(var(--accent-primary-rgb), 0.4);
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
      case "passed":
        return "rgba(16, 185, 129, 0.1)";
      case "failed":
        return "rgba(239, 68, 68, 0.1)";
      case "partial":
        return "rgba(var(--accent-primary-rgb), 0.1)";
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

const GroupIconWrapper = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
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

const GroupName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
`;

const GroupType = styled.div`
  font-size: 9px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StatusIconWrapper = styled.div<{ $status: string }>`
  color: ${(props) => {
    switch (props.$status) {
      case "passed":
        return "var(--success)";
      case "failed":
        return "var(--error)";
      case "partial":
        return "var(--accent-primary)";
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
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Progress Section
const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const ProgressText = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ProgressBar = styled.div`
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{
  $percentage: number;
  $status: string;
  $animated?: boolean;
}>`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: ${(props) => {
    switch (props.$status) {
      case "passed":
        return "linear-gradient(90deg, var(--success) 0%, #10b981 100%)";
      case "failed":
        return "linear-gradient(90deg, var(--error) 0%, #dc2626 100%)";
      case "partial":
        return "#f59e0b";
      default:
        return "linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)";
    }
  }};
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;

  ${(props) =>
    props.$animated &&
    css`
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
        animation: ${shimmer} 1.5s ease-in-out infinite;
      }
    `}
`;

// Analysis Breakdown
const AnalysisBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-bg);
`;

const BreakdownHeader = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AnalysisItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: ${(props) => {
    switch (props.$status) {
      case "completed":
        return "rgba(var(--success-rgb), 0.05)";
      case "failed":
        return "rgba(var(--error-rgb), 0.05)";
      case "running":
        return "rgba(var(--accent-primary-rgb), 0.05)";
      default:
        return "transparent";
    }
  }};
  border-radius: 4px;
  font-size: 10px;
`;

const AnalysisIcon = styled.div`
  color: var(--text-muted);
  display: flex;
  align-items: center;
`;

const AnalysisName = styled.div`
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
`;

const AnalysisStatus = styled.div<{ $status: string }>`
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
`;

// Failed Section
const FailedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: rgba(var(--error-rgb), 0.05);
  border: 1px solid var(--error);
  border-radius: 6px;
`;

const FailedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--error);
`;

const FailedAnalysisCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  background: var(--bg-secondary);
  border-radius: 4px;
`;

const FailedAnalysisName = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--error);
`;

const FailedRequirements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 14px;
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: var(--text-muted);

  svg {
    color: var(--error);
  }
`;

// Running Section
const RunningSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  background: rgba(var(--accent-primary-rgb), 0.05);
  border-radius: 6px;
  border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
`;

const RunningLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-primary);
`;

const RunningAnalysis = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-primary);
  font-weight: 500;
  padding-left: 16px;
`;

// Messages
const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(var(--success-rgb), 0.1);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--success);
`;

const PendingMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
`;

const MoreIndicator = styled.div`
  font-size: 9px;
  color: var(--text-muted);
  font-style: italic;
  padding: 2px 6px;
`;

const StepIndicator = styled.span`
  color: var(--accent-primary);
  font-size: 10px;
  font-weight: 500;
  margin-left: 8px;
`;

const StepProgressBar = styled.div`
  height: 3px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  margin-left: 16px;
  margin-top: 4px;
`;

const StepProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 4px rgba(var(--accent-primary-rgb), 0.4);
`;
