import React, { useState, useEffect } from "react";
import styled from "styled-components";

import {
  RefreshCw
} from "lucide-react";

// Replace the RedactedPanel styled component and add this new component
type AIGenStage =
  | "Creating Variation"
  | "Pre-processing"
  | "FEA Setup"
  | "Solving"
  | "Results";

interface AIStepFlowPanelProps {
  currentStage: AIGenStage;
  currentStageIndex: number;
}

export const AIStepFlowPanel: React.FC<AIStepFlowPanelProps> = ({
  currentStage,
  currentStageIndex,
}) => {
  const stages: AIGenStage[] = [
    "Creating Variation",
    "Pre-processing",
    "FEA Setup",
    "Solving",
    "Results"
  ];

  return (
    <StepFlowContainer>
      <StepFlowHeader>
        <StepFlowTitle>AI Generation Pipeline</StepFlowTitle>
      </StepFlowHeader>
      
      <StepsContainer>
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isActive = index === currentStageIndex;
          const isPending = index > currentStageIndex;
          
          return (
            <StepItem key={stage} $isLast={index === stages.length - 1}>
              <StepNode 
                $isCompleted={isCompleted}
                $isActive={isActive}
                $isPending={isPending}
              >
                {isCompleted ? (
                  <CheckIcon size={12} />
                ) : isActive ? (
                  <ActivityIndicator>
                    <RefreshCw size={10} className="spin" />
                  </ActivityIndicator>
                ) : (
                  <StepNumber>{index + 1}</StepNumber>
                )}
              </StepNode>
              
              <StepContent>
                <StepLabel 
                  $isCompleted={isCompleted}
                  $isActive={isActive}
                  $isPending={isPending}
                >
                  {stage}
                </StepLabel>
              </StepContent>
              
              {index < stages.length - 1 && (
                <StepConnector 
                  $isCompleted={index < currentStageIndex}
                  $isActive={index === currentStageIndex - 1}
                />
              )}
            </StepItem>
          );
        })}
      </StepsContainer>
      
      <StatusBadgeContainer>
        <AIStatusBadgeInPanel>
          <RefreshCw className="spin" size={12} />
          <span>{currentStage}</span>
        </AIStatusBadgeInPanel>
      </StatusBadgeContainer>
    </StepFlowContainer>
  );
};

// Styled Components
const StepFlowContainer = styled.div`
  flex: 1 1 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-bg);
  gap: 16px;
`;

const StepFlowHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StepFlowTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StepsContainer = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
`;

const StepItem = styled.div<{ $isLast: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  min-height: ${props => props.$isLast ? '32px' : '40px'};
`;

const StepNode = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean; 
  $isPending: boolean;
}>`
  width: 16px;
  height: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
  z-index: 2;
  position: relative;
  
  background: ${props => {
    if (props.$isCompleted) return '#22c55e';
    if (props.$isActive) return 'var(--accent-primary)';
    return 'var(--bg-tertiary)';
  }};
  
  color: ${props => {
    if (props.$isCompleted || props.$isActive) return 'white';
    return 'var(--text-muted)';
  }};
  
  border: 2px solid ${props => {
    if (props.$isCompleted) return '#22c55e';
    if (props.$isActive) return 'var(--accent-primary)';
    return 'var(--border-bg)';
  }};
  
  transition: all 0.3s ease;
`;

const ActivityIndicator = styled.div`
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const CheckIcon = styled.div`
  &::before {
    content: "✓";
    font-size: 12px;
    font-weight: bold;
  }
`;

const StepNumber = styled.div`
  font-size: 10px;
  font-weight: 600;
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
`;

const StepLabel = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
  $isPending: boolean;
}>`
  font-size: 11px;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  color: ${props => {
    if (props.$isCompleted) return 'var(--text-primary)';
    if (props.$isActive) return 'var(--accent-primary)';
    return 'var(--text-muted)';
  }};
  
  line-height: 1.3;
  transition: color 0.3s ease;
`;

const StepConnector = styled.div<{
  $isCompleted: boolean;
  $isActive: boolean;
}>`
  position: absolute;
  left: 11px;
  top: 24px;
  width: 2px;
  height: 16px;
  background: ${props => {
    if (props.$isCompleted) return '#22c55e';
    if (props.$isActive) return 'var(--accent-primary)';
    return 'var(--border-bg)';
  }};
  transition: background 0.3s ease;
  z-index: 1;
`;

const StatusBadgeContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px solid var(--border-bg);
`;

const AIStatusBadgeInPanel = styled.div`
  background: var(--accent-primary);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-bg);
  
  .spin {
    animation: spin 0.9s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;