// components/analysis/AnalysisNodeContent.tsx
import React from "react";
import styled, { keyframes } from "styled-components";
import {
  LoaderCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  GitBranch,
  AlertTriangle,
  Activity,
  Calculator,
} from "lucide-react";
import { Analysis, AnalysisStep, CurrentStepInfo } from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { getCurrentStepForNode } from "./analysisNodeState";

interface ContentProps {
  analysis: Analysis;
  currentStepInfo?: CurrentStepInfo | null;
}

// IDLE STATE - Simple pending
export const IdleContent: React.FC<ContentProps> = ({ analysis }) => (
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
);

// RUNNING_PRIMARY STATE - This analysis is actively running
export const RunningPrimaryContent: React.FC<ContentProps> = ({ analysis }) => (
  <RunningContent>
    {analysis.steps && analysis.steps.length > 0 ? (
      <SteppedProgressSection>
        <CurrentStepLabel>
          <ActivityIndicator>
            <LoaderCircle size={10} className="spin" />
          </ActivityIndicator>
          {analysis.steps[analysis.currentStepIndex || 0]?.name || "Processing..."}
        </CurrentStepLabel>

        <StepsFlow>
          {analysis.steps.map((step, index) => (
            <RenderStep
              key={step.id}
              step={step}
              index={index}
              isLast={index === analysis.steps!.length - 1}
              currentStepIndex={analysis.currentStepIndex || 0}
            />
          ))}
        </StepsFlow>
      </SteppedProgressSection>
    ) : (
      <SimpleProgressBar analysis={analysis} />
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
);

// RUNNING_SECONDARY STATE - Participating in a shared step
export const RunningSecondaryContent: React.FC<ContentProps> = ({ analysis, currentStepInfo }) => {
  const activeStep = getCurrentStepForNode(analysis, currentStepInfo || null);
  
  return (
    <SharedStepContent>
      <SharedStepLabel>
        <ActivityIndicator>
          <LoaderCircle size={10} className="spin" />
        </ActivityIndicator>
        Shared Preprocessing Active
      </SharedStepLabel>

      {analysis.steps && (
        <StepsFlow>
          {analysis.steps.map((step, index) => {
            const isCurrentSharedStep = !!(activeStep && index === activeStep.stepIndex);
            const isCompleted = analysis.sharedStepsCompleted?.includes(index) || 
                               step.status === "completed";
            
            return (
              <StepFlowItem key={step.id} $isLast={index === analysis.steps!.length - 1}>
                <StepNode
                  $isCompleted={!!isCompleted}
                  $isActive={isCurrentSharedStep}
                  $isPending={!isCompleted && !isCurrentSharedStep}
                  $isShared={isCurrentSharedStep}
                >
                  {isCompleted ? (
                    <CheckMark>✓</CheckMark>
                  ) : isCurrentSharedStep ? (
                    <ActivityIndicator>
                      <LoaderCircle size={8} className="spin" />
                    </ActivityIndicator>
                  ) : (
                    <StepNumber>{index + 1}</StepNumber>
                  )}
                </StepNode>

                <StepContent>
                  <StepFlowLabel
                    $isCompleted={!!isCompleted}
                    $isActive={isCurrentSharedStep}
                    $isPending={!isCompleted && !isCurrentSharedStep}
                    $isShared={isCurrentSharedStep}
                  >
                    {step.name}
                    {isCurrentSharedStep && <SharedBadge>(Shared)</SharedBadge>}
                  </StepFlowLabel>
                  {isCurrentSharedStep && activeStep && (
                    <MiniProgressBar>
                      <MiniProgressFill $progress={activeStep.stepProgress} $isShared={true} />
                    </MiniProgressBar>
                  )}
                </StepContent>

                {index < analysis.steps!.length - 1 && (
                  <StepConnector
                    $isCompleted={!!isCompleted}
                    $isActive={false}
                  />
                )}
              </StepFlowItem>
            );
          })}
        </StepsFlow>
      )}

      <SharedInfo>
        <InfoIcon>
          <GitBranch size={10} />
        </InfoIcon>
        <InfoText>Preprocessing shared with other analyses</InfoText>
      </SharedInfo>
    </SharedStepContent>
  );
};

// WAITING_WITH_SHARED STATE
export const WaitingWithSharedContent: React.FC<ContentProps> = ({ analysis }) => (
  <PendingWithCompletedStepsContent>
    <SharedStepLabel>
      <CheckCircle size={10} />
      Shared Steps Completed
    </SharedStepLabel>

    {analysis.steps && (
      <StepsFlow>
        {analysis.steps.map((step, index) => {
          const isCompletedViaSharing = analysis.sharedStepsCompleted?.includes(index);
          const isLast = index === analysis.steps!.length - 1;

          return (
            <StepFlowItem key={step.id} $isLast={isLast}>
              <StepNode
                $isCompleted={!!isCompletedViaSharing}
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
                  $isCompleted={!!isCompletedViaSharing}
                  $isActive={false}
                  $isPending={!isCompletedViaSharing}
                >
                  {step.name}
                  {isCompletedViaSharing && <SharedBadge>(Shared)</SharedBadge>}
                </StepFlowLabel>
              </StepContent>

              {!isLast && (
                <StepConnector
                  $isCompleted={!!isCompletedViaSharing}
                  $isActive={false}
                />
              )}
            </StepFlowItem>
          );
        })}
      </StepsFlow>
    )}

    <SharedInfo>
      <InfoIcon>
        <GitBranch size={10} />
      </InfoIcon>
      <InfoText>
        Waiting to run - {analysis.sharedStepsCompleted?.length || 0} step
        {(analysis.sharedStepsCompleted?.length || 0) > 1 ? "s" : ""} completed via sharing
      </InfoText>
    </SharedInfo>
  </PendingWithCompletedStepsContent>
);

// COMPLETED STATE
export const CompletedContent: React.FC<ContentProps> = ({ analysis }) => {
  const passedRequirements = analysis.requirements?.filter((r) => r.status === "pass") || [];
  
  return (
    <CompletedContentContainer>
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Metrics</MetricLabel>
          <MetricValue>{analysis.metrics?.length || 0}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>Passed</MetricLabel>
          <MetricValue $status="pass">{passedRequirements.length}</MetricValue>
        </MetricCard>
      </MetricsGrid>

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
          {analysis.warnings.length} warning{analysis.warnings.length > 1 ? "s" : ""}
        </WarningBadge>
      )}
    </CompletedContentContainer>
  );
};

// FAILED STATE
export const FailedContent: React.FC<ContentProps> = ({ analysis }) => {
  const failedRequirements = analysis.requirements?.filter((r) => r.status === "fail") || [];
  
  return (
    <FailedContentContainer>
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
            <MoreIndicator>+{failedRequirements.length - 2} more</MoreIndicator>
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
    </FailedContentContainer>
  );
};

// Helper components
const RenderStep: React.FC<{
  step: AnalysisStep;
  index: number;
  isLast: boolean;
  currentStepIndex: number;
}> = ({ step, index, isLast, currentStepIndex }) => {
  const isCompleted = step.status === "completed";
  const isActive = step.status === "running";
  const isPending = step.status === "pending";

  return (
    <StepFlowItem $isLast={isLast}>
      <StepNode
        $isCompleted={isCompleted}
        $isActive={isActive}
        $isPending={isPending}
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
        >
          {step.name}
        </StepFlowLabel>
        {isActive && step.progress !== undefined && (
          <MiniProgressBar>
            <MiniProgressFill $progress={step.progress} />
          </MiniProgressBar>
        )}
      </StepContent>

      {!isLast && (
        <StepConnector
          $isCompleted={isCompleted}
          $isActive={index === currentStepIndex - 1}
        />
      )}
    </StepFlowItem>
  );
};

const SimpleProgressBar: React.FC<{ analysis: Analysis }> = ({ analysis }) => (
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
);

// [Include all the styled components from the original file here]
// I'm omitting them for brevity, but they should all be moved here


const progressAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
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
const CompletedContentContainer = styled.div`
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
const FailedContentContainer = styled.div`
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
