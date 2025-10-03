// components/AnalysisIndividualNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled, { keyframes, css } from "styled-components";
import {
  Analysis,
  AnalysisStep,
} from "../../versionNodes/utils/VersionInterfaces";
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
  Flame,
  Cpu,
  GitBranch,
  Activity,
} from "lucide-react";

export const AnalysisIndividualNode: React.FC<NodeProps> = ({ data }) => {
  const analysis = data as unknown as Analysis & {
    onAnimateNode?: () => void;
    isGhostNode?: boolean;
  };
  
  console.log(`🎨 RENDER ${analysis.id}:`, {
    status: analysis.status,
    sharedStepRunning: analysis.sharedStepRunning,
    currentStepIndex: analysis.currentStepIndex,
  });
  const nodeStatus = analysis.status;
  const isSharedStepRunning = analysis.sharedStepRunning || false;
  const isGhost = analysis.isGhostNode || false; // NEW

  const getStatusIcon = () => {
    if (isSharedStepRunning) {
      return <LoaderCircle size={14} className="spin" />;
    }
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
      $isSharedStepRunning={isSharedStepRunning} // ← ADD THIS LINE
      $isGhost={isGhost}
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
      <NodeHeader $status={nodeStatus}>
        <HeaderLeft>
          <TypeIconWrapper>{getTypeIcon(analysis.type)}</TypeIconWrapper>
          <HeaderText>
            <AnalysisName>{analysis.name}</AnalysisName>
            <AnalysisType>
              {isGhost ? "From Other Group" : "Analysis"}
            </AnalysisType>
          </HeaderText>
        </HeaderLeft>
        <StatusIconWrapper $status={nodeStatus}>
          {getStatusIcon()}
        </StatusIconWrapper>
      </NodeHeader>

      <Divider />

      {/* Main Content */}
      <NodeBody>
        {/* ============================================
      PENDING STATES (status === "pending")
      ============================================ */}

        {/* PENDING STATE 1: Actively participating in shared step */}
        {nodeStatus === "pending" && isSharedStepRunning && analysis.steps && (
          <SharedStepContent>
            <SharedStepLabel>
              <ActivityIndicator>
                <LoaderCircle size={10} className="spin" />
              </ActivityIndicator>
              Shared Preprocessing Active
            </SharedStepLabel>

            <StepsFlow>
              {analysis.steps.map((step, index) => {
                const isCompleted = step.status === "completed";
                const isActive = step.status === "running";
                const isPending = step.status === "pending";
                const isLast = index === analysis.steps!.length - 1;

                return (
                  <StepFlowItem key={step.id} $isLast={isLast}>
                    <StepNode
                      $isCompleted={isCompleted}
                      $isActive={isActive}
                      $isPending={isPending}
                      $isShared={index === 0 && isActive}
                    >
                      {isCompleted ? (
                        <CheckMark>✓</CheckMark>
                      ) : isActive ? (
                        <ActivityIndicator>
                          <LoaderCircle size={8} className="spin" />
                        </ActivityIndicator>
                      ) : (
                        <StepNumber>{index + 1}</StepNumber>
                      )}
                    </StepNode>

                    <StepContent>
                      <StepFlowLabel
                        $isCompleted={isCompleted}
                        $isActive={isActive}
                        $isPending={isPending}
                        $isShared={index === 0 && isActive}
                      >
                        {step.name}
                        {index === 0 && isActive && (
                          <SharedBadge>(Shared)</SharedBadge>
                        )}
                      </StepFlowLabel>
                      {isActive && step.progress !== undefined && (
                        <MiniProgressBar>
                          <MiniProgressFill
                            $progress={step.progress}
                            $isShared={true}
                          />
                        </MiniProgressBar>
                      )}
                    </StepContent>

                    {!isLast && (
                      <StepConnector
                        $isCompleted={isCompleted}
                        $isActive={
                          index === (analysis.currentStepIndex || 0) - 1
                        }
                      />
                    )}
                  </StepFlowItem>
                );
              })}
            </StepsFlow>

            <SharedInfo>
              <InfoIcon>
                <GitBranch size={10} />
              </InfoIcon>
              <InfoText>Preprocessing shared with other analyses</InfoText>
            </SharedInfo>
          </SharedStepContent>
        )}

        {/* PENDING STATE 2: Has completed shared steps, waiting to run */}
        {nodeStatus === "pending" &&
          !isSharedStepRunning &&
          analysis.sharedStepsCompleted &&
          analysis.sharedStepsCompleted.length > 0 &&
          analysis.steps && (
            <PendingWithCompletedStepsContent>
              <SharedStepLabel>
                <CheckCircle size={10} />
                Shared Steps Completed
              </SharedStepLabel>

              <StepsFlow>
                {analysis.steps.map((step, index) => {
                  const isCompletedViaSharing = Boolean(
                    analysis.sharedStepsCompleted?.includes(index)
                  );
                  const isLast = index === analysis.steps!.length - 1;

                  return (
                    <StepFlowItem key={step.id} $isLast={isLast}>
                      <StepNode
                        $isCompleted={isCompletedViaSharing}
                        $isActive={false}
                        $isPending={!isCompletedViaSharing}
                      >
                        {isCompletedViaSharing ? (
                          <CheckMark>✓</CheckMark>
                        ) : (
                          <StepNumber>{index + 1}</StepNumber>
                        )}
                      </StepNode>

                      <StepContent>
                        <StepFlowLabel
                          $isCompleted={isCompletedViaSharing}
                          $isActive={false}
                          $isPending={!isCompletedViaSharing}
                        >
                          {step.name}
                          {isCompletedViaSharing && (
                            <SharedBadge>(Shared)</SharedBadge>
                          )}
                        </StepFlowLabel>
                      </StepContent>

                      {!isLast && (
                        <StepConnector
                          $isCompleted={isCompletedViaSharing}
                          $isActive={false}
                        />
                      )}
                    </StepFlowItem>
                  );
                })}
              </StepsFlow>

              <SharedInfo>
                <InfoIcon>
                  <GitBranch size={10} />
                </InfoIcon>
                <InfoText>
                  Waiting to run - {analysis.sharedStepsCompleted.length} step
                  {analysis.sharedStepsCompleted.length > 1 ? "s" : ""}{" "}
                  completed via sharing
                </InfoText>
              </SharedInfo>
            </PendingWithCompletedStepsContent>
          )}

        {/* PENDING STATE 3: Regular pending (no shared activity, no completed steps) */}
        {nodeStatus === "pending" &&
          !isSharedStepRunning &&
          (!analysis.sharedStepsCompleted ||
            analysis.sharedStepsCompleted.length === 0) && (
            <PendingContent>
              <InfoSection>
                <InfoLabel>Requirements</InfoLabel>
                <InfoValue>
                  {analysis.requirements?.length || 0} checks
                </InfoValue>
              </InfoSection>
              <StatusMessage>
                <Clock size={12} />
                Pending analysis
              </StatusMessage>
            </PendingContent>
          )}

        {/* ============================================
      RUNNING STATES (status === "running")
      ============================================ */}

        {/* RUNNING STATE: Show step-by-step progress */}
        {/* Note: We handle both regular running and running with shared step participation the same way */}
        {/* The sharedStepRunning flag just adds a visual indicator on the first step */}
        {nodeStatus === "running" && (
          <RunningContent>
            {analysis.steps && analysis.steps.length > 0 ? (
              <SteppedProgressSection>
                <CurrentStepLabel $isShared={isSharedStepRunning}>
                  <ActivityIndicator>
                    <LoaderCircle size={10} className="spin" />
                  </ActivityIndicator>
                  {analysis.steps[analysis.currentStepIndex || 0]?.name ||
                    "Processing..."}
                  {isSharedStepRunning && analysis.currentStepIndex === 0 && (
                    <SharedBadge>(Shared)</SharedBadge>
                  )}
                </CurrentStepLabel>

                <StepsFlow>
                  {analysis.steps.map((step, index) => {
                    const isCompleted = step.status === "completed";
                    const isActive = step.status === "running";
                    const isPending = step.status === "pending";
                    const isLast = index === analysis.steps!.length - 1;
                    const isSharedStep =
                      isSharedStepRunning && index === 0 && isActive;

                    return (
                      <StepFlowItem key={step.id} $isLast={isLast}>
                        <StepNode
                          $isCompleted={isCompleted}
                          $isActive={isActive}
                          $isPending={isPending}
                          $isShared={isSharedStep}
                        >
                          {isCompleted ? (
                            <CheckMark>✓</CheckMark>
                          ) : isActive ? (
                            <ActivityIndicator>
                              <LoaderCircle size={8} className="spin" />
                            </ActivityIndicator>
                          ) : (
                            <StepNumber>{index + 1}</StepNumber>
                          )}
                        </StepNode>

                        <StepContent>
                          <StepFlowLabel
                            $isCompleted={isCompleted}
                            $isActive={isActive}
                            $isPending={isPending}
                            $isShared={isSharedStep}
                          >
                            {step.name}
                            {isSharedStep && (
                              <SharedBadge>(Shared)</SharedBadge>
                            )}
                          </StepFlowLabel>
                          {isActive && step.progress !== undefined && (
                            <MiniProgressBar>
                              <MiniProgressFill
                                $progress={step.progress}
                                $isShared={isSharedStep}
                              />
                            </MiniProgressBar>
                          )}
                        </StepContent>

                        {!isLast && (
                          <StepConnector
                            $isCompleted={isCompleted}
                            $isActive={
                              index === (analysis.currentStepIndex || 0) - 1
                            }
                          />
                        )}
                      </StepFlowItem>
                    );
                  })}
                </StepsFlow>
              </SteppedProgressSection>
            ) : (
              // Fallback: If no steps defined, show simple progress bar
              <ProgressSection>
                <ProgressLabel>
                  <Calculator size={10} />
                  Computing results...
                </ProgressLabel>
                <ProgressBar>
                  <ProgressFill $progress={analysis.progress || 0} />
                </ProgressBar>
                <ProgressText>{analysis.progress || 0}%</ProgressText>
              </ProgressSection>
            )}

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

            {/* Show completed steps summary */}
            {analysis.steps && (
              <CompletedSteps>
                {analysis.steps.map((step) => (
                  <CompletedStep key={step.id}>
                    <CheckCircle size={8} />
                    {step.name}
                  </CompletedStep>
                ))}
              </CompletedSteps>
            )}

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
          <ActionButton
            $variant="primary"
            $small
            onClick={analysis.onAnimateNode}
          >
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

// Helper component for empty circle
const Circle: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;

const progressAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;

// Styled Components (keeping all existing ones and adding new ones for steps)
const NodeContainer = styled.div<{
  $status: string;
  $isActive?: boolean;
  $isSharedStepRunning?: boolean;
  $isGhost?: boolean; // NEW
}>`
  position: relative;
  background: ${(props) => {
    if (props.$isSharedStepRunning) return "var(--bg-tertiary)";
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
      if (props.$isGhost) return "var(--accent-secondary)"; // Different border for ghosts

      if (props.$isSharedStepRunning) return "var(--accent-secondary)";
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
  min-width: 260px;
  max-width: 280px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$isSharedStepRunning
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

// New styled components for vertical step flow (matching AIStepFlowPanel style)
const SteppedProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CurrentStepLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-primary);
  padding: 6px 8px;
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-radius: 6px;
  border: 1px solid rgba(var(--accent-primary-rgb), 0.2);
`;

const StepsFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  padding: 4px 0;
`;

const StepFlowItem = styled.div<{ $isLast: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  position: relative;
  min-height: ${(props) => (props.$isLast ? "20px" : "32px")};
`;

const StepNode = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
  $isPending: boolean;
  $isShared?: boolean;
}>`
  width: 14px;
  height: 14px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 600;
  flex-shrink: 0;
  z-index: 2;
  position: relative;
  margin-top: 2px;

  background: ${(props) => {
    if (props.$isShared) return "var(--accent-secondary)";
    if (props.$isCompleted) return "var(--success)";
    if (props.$isActive) return "var(--accent-primary)";
    return "var(--bg-tertiary)";
  }};

  color: ${(props) => {
    if (props.$isCompleted || props.$isActive || props.$isShared)
      return "white";
    return "var(--text-muted)";
  }};

  border: 1.5px solid
    ${(props) => {
      if (props.$isShared) return "var(--accent-secondary)";
      if (props.$isCompleted) return "var(--success)";
      if (props.$isActive) return "var(--accent-primary)";
      return "var(--border-outline)";
    }};

  transition: all 0.3s ease;
`;

const ActivityIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const CheckMark = styled.div`
  font-size: 8px;
  font-weight: bold;
  line-height: 1;
`;

const StepNumber = styled.div`
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 1px;
`;

const StepFlowLabel = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
  $isPending: boolean;
  $isShared?: boolean; // Already optional
}>`
  font-size: 10px;
  font-weight: ${(props) =>
    props.$isActive || props.$isShared ? "600" : "500"};
  color: ${(props) => {
    if (props.$isShared) return "var(--accent-secondary)";
    if (props.$isCompleted) return "var(--text-primary)";
    if (props.$isActive) return "var(--accent-primary)";
    return "var(--text-muted)";
  }};
  line-height: 1.3;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const StepConnector = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
}>`
  position: absolute;
  left: 6px;
  top: 18px;
  width: 2px;
  height: 14px;
  background: ${(props) => {
    if (props.$isCompleted) return "var(--success)";
    if (props.$isActive) return "var(--accent-primary)";
    return "var(--border-outline)";
  }};
  transition: background 0.3s ease;
  z-index: 1;
`;

const MiniProgressBar = styled.div`
  height: 3px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  margin-right: 8px;
`;

const MiniProgressFill = styled.div<{ $progress: number; $isShared?: boolean }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: ${(props) =>
    props.$isShared ? "var(--accent-secondary)" : "var(--accent-primary)"};
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 4px
    ${(props) =>
      props.$isShared
        ? "rgba(var(--accent-secondary-rgb), 0.4)"
        : "rgba(var(--accent-primary-rgb), 0.4)"};
`;

const CompletedSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(var(--success-rgb), 0.05);
  border-radius: 6px;
  margin-top: 4px;
`;

const CompletedStep = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: var(--success);
  font-weight: 500;

  svg {
    flex-shrink: 0;
  }
`;

// Keep all the existing styled components
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
  min-height: 100px;
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

// Running State (keeping fallback components)
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

// Add these styled components after the existing ones

const SharedStepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SharedStepLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-secondary);
  padding: 6px 8px;
  background: rgba(var(--accent-secondary-rgb), 0.1);
  border-radius: 6px;
  border: 1px solid rgba(var(--accent-secondary-rgb), 0.2);
`;

const SharedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  font-size: 8px;
  font-weight: 600;
  color: var(--accent-secondary);
  padding: 2px 4px;
  background: rgba(var(--accent-secondary-rgb), 0.15);
  border-radius: 3px;
`;

const SharedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(var(--accent-secondary-rgb), 0.05);
  border-radius: 6px;
  border: 1px solid rgba(var(--accent-secondary-rgb), 0.2);
`;

const PendingWithCompletedStepsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
