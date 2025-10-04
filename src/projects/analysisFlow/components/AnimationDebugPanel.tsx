// components/AnimationDebugPanel.tsx
import React from "react";
import styled from "styled-components";
import { CurrentStepInfo } from "../../versionNodes/utils/VersionInterfaces";
import { Activity, GitBranch, Play, Pause, RotateCcw, Layers } from "lucide-react";

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
  return (
    <DebugContainer>
      <Header>
        <Title>
          <Activity size={12} />
          Animation State
        </Title>
        <StatusIndicator $active={isRunning}>
          {isRunning ? <Play size={10} /> : <Pause size={10} />}
          {isRunning ? "Running" : "Idle"}
        </StatusIndicator>
      </Header>

      <Section>
        <SectionTitle>Current Context</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <Label>Group ID:</Label>
            <Value>{currentGroupId || "none"}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Analysis ID:</Label>
            <Value>{currentAnalysisId || "none"}</Value>
          </InfoItem>
        </InfoGrid>
      </Section>

      {currentStepInfo && (
        <Section>
          <SectionTitle>
            <GitBranch size={10} />
            Active Step Details
          </SectionTitle>
          
          <StepInfoCard>
            <StepHeader>
              <StepName>{currentStepInfo.stepName}</StepName>
              <StepIndex>Step {currentStepInfo.stepIndex + 1}</StepIndex>
            </StepHeader>
            
            <ProgressBar>
              <ProgressFill $progress={currentStepInfo.progress} />
              <ProgressText>{Math.round(currentStepInfo.progress)}%</ProgressText>
            </ProgressBar>

            <DetailGrid>
              <DetailItem>
                <DetailLabel>Primary Analysis:</DetailLabel>
                <DetailValue $isPrimary>
                  {currentStepInfo.primaryAnalysisId}
                </DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue>{currentStepInfo.status}</DetailValue>
              </DetailItem>

              <DetailItem>
                <DetailLabel>Shared Step:</DetailLabel>
                <DetailValue>
                  {currentStepInfo.isSharedStep ? "Yes" : "No"}
                </DetailValue>
              </DetailItem>
            </DetailGrid>

            {currentStepInfo.isSharedStep && 
             currentStepInfo.sharedWithAnalysisIds.length > 0 && (
              <SharedSection>
                <SharedHeader>
                  <Layers size={10} />
                  Shared With ({currentStepInfo.sharedWithAnalysisIds.length})
                </SharedHeader>
                <SharedList>
                  {currentStepInfo.sharedWithAnalysisIds.map((id) => (
                    <SharedAnalysis key={id}>
                      <SharedDot />
                      {id}
                    </SharedAnalysis>
                  ))}
                </SharedList>
              </SharedSection>
            )}
          </StepInfoCard>
        </Section>
      )}

      {!currentStepInfo && isRunning && (
        <EmptyState>
          <EmptyIcon>
            <RotateCcw size={16} className="spin" />
          </EmptyIcon>
          <EmptyText>Transitioning between steps...</EmptyText>
        </EmptyState>
      )}

      {!currentStepInfo && !isRunning && (
        <EmptyState>
          <EmptyText>No active animation</EmptyText>
        </EmptyState>
      )}
    </DebugContainer>
  );
};

// Styled Components
const DebugContainer = styled.div`
  position: fixed;
  top: 100px;
  right: 25px;
  width: 320px;
  max-height: 500px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
  font-size: 11px;
  
  /* Glass effect */
  backdrop-filter: blur(10px);
  background: rgba(var(--bg-secondary-rgb), 0.95);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-bg);
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 12px;
`;

const StatusIndicator = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 500;
  background: ${props => props.$active 
    ? 'rgba(var(--success-rgb), 0.1)' 
    : 'rgba(var(--text-muted-rgb), 0.1)'};
  color: ${props => props.$active ? 'var(--success)' : 'var(--text-muted)'};
  border: 1px solid ${props => props.$active 
    ? 'rgba(var(--success-rgb), 0.3)' 
    : 'transparent'};

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 4px;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Label = styled.span`
  color: var(--text-muted);
  font-size: 10px;
  min-width: 70px;
`;

const Value = styled.span`
  color: var(--text-primary);
  font-weight: 500;
  font-family: "SF Mono", Monaco, monospace;
`;

const StepInfoCard = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StepName = styled.div`
  font-weight: 600;
  color: var(--accent-primary);
  font-size: 12px;
`;

const StepIndex = styled.div`
  padding: 2px 6px;
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-radius: 4px;
  color: var(--accent-primary);
  font-size: 9px;
  font-weight: 600;
`;

const ProgressBar = styled.div`
  position: relative;
  height: 20px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 10px;
`;

const DetailGrid = styled.div`
  display: grid;
  gap: 6px;
`;

const DetailItem = styled.div`
  display: flex;
  gap: 6px;
  font-size: 10px;
`;

const DetailLabel = styled.span`
  color: var(--text-muted);
  min-width: 90px;
`;

const DetailValue = styled.span<{ $isPrimary?: boolean }>`
  color: ${props => props.$isPrimary ? 'var(--accent-primary)' : 'var(--text-primary)'};
  font-weight: ${props => props.$isPrimary ? '600' : '500'};
`;

const SharedSection = styled.div`
  padding-top: 8px;
  border-top: 1px solid var(--border-bg);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SharedHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-secondary);
  font-size: 10px;
  font-weight: 600;
`;

const SharedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 14px;
`;

const SharedAnalysis = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 10px;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const SharedDot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-secondary);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: var(--text-muted);
`;

const EmptyIcon = styled.div`
  color: var(--text-muted);
  
  .spin {
    animation: spin 1s linear infinite;
  }
`;

const EmptyText = styled.div`
  font-size: 10px;
  font-weight: 500;
`;