// components/AnimationDebugPanel.tsx
import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { CurrentStepInfo } from "../../nodeVisuals/versionNodes/utils/VersionInterfaces";

import {
  Activity,
  GitBranch,
  Pause,
  Zap,
  CheckCircle,
  LoaderCircle,
  Logs,
} from "lucide-react";

interface AnimationDebugPanelProps {
  currentStepInfo: CurrentStepInfo | null;
  currentAnalysisId: string | null;
  currentGroupId: string | null;
  isRunning: boolean;
}

export const AnimationDebugPanel: React.FC<AnimationDebugPanelProps> = ({
  currentStepInfo,
  currentAnalysisId,
  currentGroupId,
  isRunning,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <DebugContainer>
      <PanelHeader
        $isRunning={isRunning}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <HeaderLeft>
          <IconWrapper $isRunning={isRunning}>
            {isRunning ? <LoaderCircle size={16} /> : <Logs size={16} />}
          </IconWrapper>
          <HeaderContent>
            <PanelTitle>Debug Window</PanelTitle>
            <StatusText $active={isRunning}>
              Current Group: <span>{currentGroupId || "Not Running"}</span>
            </StatusText>
          </HeaderContent>
        </HeaderLeft>
        <HeaderRight>
          <StatusPulse $active={isRunning} />
        </HeaderRight>
      </PanelHeader>

      {isExpanded && (
        <>
          <Divider />

          <PanelBody>
            {/* Active Step Section */}
            {currentStepInfo && (
              <Section>
                <SectionHeader>
                  <SectionIcon>
                    <Zap size={10} />
                  </SectionIcon>
                  <SectionTitle>Analysis:</SectionTitle>
                  <InfoValue $hasValue={!!currentAnalysisId}>
                    {currentAnalysisId || "None active"}
                  </InfoValue>
                </SectionHeader>

                <StepCard>
                  <ActiveSectionTitleContainer>
                    <StepName>{currentStepInfo.stepName}</StepName>

                    <StepBadge>
                      (Step {currentStepInfo.stepIndex + 1})
                    </StepBadge>
                  </ActiveSectionTitleContainer>

                  <ProgressSection>
                    <ProgressBar>
                      <ProgressFill
                        $progress={currentStepInfo.progress}
                        $animated={currentStepInfo.status === "running"}
                      />
                    </ProgressBar>
                    <ProgressLabel>
                      {Math.round(currentStepInfo.progress)}%
                    </ProgressLabel>
                  </ProgressSection>

                  <StepDetails>
                    <DetailRow>
                      <DetailIcon>
                        <Activity size={8} />
                      </DetailIcon>
                      <DetailLabel>Primary:</DetailLabel>
                      <DetailValue $primary>
                        {currentStepInfo.primaryAnalysisId}
                      </DetailValue>
                    </DetailRow>

                    <DetailRow>
                      <DetailIcon>
                        <CheckCircle size={8} />
                      </DetailIcon>
                      <DetailLabel>Status:</DetailLabel>
                      <StatusBadge $status={currentStepInfo.status}>
                        {currentStepInfo.status}
                      </StatusBadge>
                    </DetailRow>
                  </StepDetails>

                  {currentStepInfo.isSharedStep &&
                    currentStepInfo.sharedWithAnalysisIds.length > 0 && (
                      <SharedSection>
                        <SharedHeader>
                          <SharedIcon>
                            <GitBranch size={10} />
                          </SharedIcon>
                          <SharedTitle>
                            Shared Processing (
                            {currentStepInfo.sharedWithAnalysisIds.length})
                          </SharedTitle>
                        </SharedHeader>

                        <SharedList>
                          {currentStepInfo.sharedWithAnalysisIds.map((id) => (
                            <SharedItem key={id}>
                              <SharedDot />
                              <SharedId>{id}</SharedId>
                            </SharedItem>
                          ))}
                        </SharedList>
                      </SharedSection>
                    )}
                </StepCard>
              </Section>
            )}

            {/* Empty States */}
            {!currentStepInfo && isRunning && (
              <EmptyCard>
                <EmptyIcon>
                  <Activity size={16} className="spin" />
                </EmptyIcon>
                <EmptyText>Transitioning between steps...</EmptyText>
              </EmptyCard>
            )}

            {!currentStepInfo && !isRunning && (
              <EmptyCard>
                <EmptyIcon>
                  <Pause size={16} />
                </EmptyIcon>
                <EmptyText>No active animation</EmptyText>
                <EmptySubtext>Run analyses to see live updates</EmptySubtext>
              </EmptyCard>
            )}
          </PanelBody>
        </>
      )}
    </DebugContainer>
  );
};

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;

// Styled Components
const DebugContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 25px;
  width: 340px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  backdrop-filter: blur(10px);
  background: rgba(var(--bg-secondary-rgb), 0.98);
  overflow: hidden;
`;

const PanelHeader = styled.div<{ $isRunning: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div<{ $isRunning: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${(props) =>
    props.$isRunning ? "var(--accent-primary)" : "var(--primary-alternate)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.$isRunning ? "white" : "var(--text-inverted)")};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  svg {
    ${(props) =>
      props.$isRunning &&
      css`
        animation: spin 2s linear infinite;
      `}
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

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
`;

const StatusText = styled.div<{ $active: boolean }>`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--text-muted);

  span {
    color: ${(props) =>
      props.$active
        ? "var(--text-primary)"
        : "var(--text-muted)"}; /* This targets the span */
    font-weight: 700;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusPulse = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.$active ? "var(--success)" : "var(--text-muted)"};
  ${(props) =>
    props.$active &&
    css`
      animation: ${pulse} 1.5s ease-in-out infinite;
    `}
`;

const ExpandButton = styled.div`
  color: var(--text-muted);
  transition: transform 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-outline);
`;

const PanelBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 420px;
  overflow-y: auto;
  background-color: var(--bg-secondary);
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary-alternate);
    border-radius: 3px;
    &:hover {
      background: var(--text-muted);
    }
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  flex: 1;
`;

const StepBadge = styled.div`
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 700;
`;

// Info Cards
const ActiveSectionTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const InfoValue = styled.span<{ $hasValue: boolean }>`
  font-size: 11px;
  color: ${(props) =>
    props.$hasValue ? "var(--text-primary)" : "var(--text-muted)"};
  font-weight: 600;
  ${(props) =>
    !props.$hasValue &&
    css`
      font-style: italic;
      font-weight: 400;
    `}
`;

// Step Card
const StepCard = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StepName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.2px;
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 20px;
  background: var(--bg-primary);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div<{ $progress: number; $animated?: boolean }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: linear-gradient(
    90deg,
    var(--accent-primary),
    var(--accent-secondary)
  );
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

const ProgressLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 35px;
`;

const StepDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
`;

const DetailIcon = styled.div`
  color: var(--text-muted);
`;

const DetailLabel = styled.span`
  color: var(--text-muted);
  min-width: 50px;
`;

const DetailValue = styled.span<{ $primary?: boolean }>`
  color: var(--text-primary);
  font-weight: 600;
  font-size: 10px;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 9px;
  text-transform: uppercase;
  background: ${(props) =>
    props.$status === "running"
      ? "var(--accent-primary)"
      : "var(--bg-tertiary)"};
  color: ${(props) =>
    props.$status === "running" ? "white" : "var(--success)"};
`;

// Shared Section
const SharedSection = styled.div`
  padding: 10px;
  background: rgba(var(--accent-secondary-rgb), 0.05);
  border: 1px solid rgba(var(--accent-secondary-rgb), 0.2);
  border-radius: 6px;
`;

const SharedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
`;

const SharedIcon = styled.div`
  color: var(--accent-secondary);
`;

const SharedTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-secondary);
`;

const SharedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SharedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
`;

const SharedDot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-secondary);
`;

const SharedId = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: var(--text-primary);
`;

// Empty States
const EmptyCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 10px;
`;

const EmptyIcon = styled.div`
  color: var(--text-muted);

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

const EmptyText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const EmptySubtext = styled.div`
  font-size: 10px;
  color: var(--text-muted);
`;
