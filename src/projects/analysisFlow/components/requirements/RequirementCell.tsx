// components/RequirementCell.tsx
import React from "react";
import styled from "styled-components";
import { Requirement } from "../../../versionNodes/utils/VersionInterfaces";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface RequirementCellProps {
  requirement: Requirement;
  analysisName?: string;
}

export const RequirementCell: React.FC<RequirementCellProps> = ({
  requirement,
  analysisName,
}) => {
  const getStatusIcon = () => {
    switch (requirement.status) {
      case "pass":
        return <CheckCircle size={14} />;
      case "fail":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusColor = () => {
    switch (requirement.status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  };

  return (
    <CellContainer $status={requirement.status}>
      <CellHeader>
        <StatusIcon $color={getStatusColor()}>
          {getStatusIcon()}
        </StatusIcon>
        <HeaderContent>
          <RequirementName>{requirement.name}</RequirementName>
          {analysisName && (
            <AnalysisLabel>{analysisName}</AnalysisLabel>
          )}
        </HeaderContent>
      </CellHeader>
      
      <EvaluationRow>
        {requirement.currentValue !== undefined ? (
          <>
            <ValueDisplay $color="var(--text-primary)">
              {requirement.currentValue.toFixed(2)} {requirement.unit}
            </ValueDisplay>
            <Comparator>{requirement.comparator}</Comparator>
            <ValueDisplay $color={getStatusColor()}>
              {requirement.targetValue.toFixed(2)} {requirement.unit}
            </ValueDisplay>
          </>
        ) : (
          <PendingText>
            Target: {requirement.comparator} {requirement.targetValue.toFixed(2)} {requirement.unit}
          </PendingText>
        )}
      </EvaluationRow>
    </CellContainer>
  );
};

// Styled Components
const CellContainer = styled.div<{ $status?: string }>`
  padding: 8px;
  background: ${props => {
    switch(props.$status) {
      case 'pass': return 'rgba(16, 185, 129, 0.05)';
      case 'fail': return 'rgba(239, 68, 68, 0.05)';
      default: return 'var(--bg-tertiary)';
    }
  }};
  border: 1px solid ${props => {
    switch(props.$status) {
      case 'pass': return 'var(--success)';
      case 'fail': return 'var(--error)';
      default: return 'var(--border-outline)';
    }
  }};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      switch(props.$status) {
        case 'pass': return 'rgba(16, 185, 129, 0.08)';
        case 'fail': return 'rgba(239, 68, 68, 0.08)';
        default: return 'var(--hover-bg)';
      }
    }};
  }
`;

const CellHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIcon = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  color: ${props => props.$color};
  flex-shrink: 0;
`;

const RequirementName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
  flex: 1;
`;

const EvaluationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 11px;
`;

const ValueDisplay = styled.span<{ $color: string }>`
  font-weight: 600;
  color: ${props => props.$color};
  font-family: 'Courier New', monospace;
`;

const Comparator = styled.span`
  color: var(--text-muted);
  font-weight: 500;
  padding: 0 2px;
`;

const PendingText = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
`;

const PriorityBadge = styled.div<{ $priority: string }>`
  align-self: flex-start;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.$priority) {
      case 'critical': return 'rgba(239, 68, 68, 0.1)';
      case 'important': return 'rgba(99, 102, 241, 0.1)';
      default: return 'var(--bg-secondary)';
    }
  }};
  color: ${props => {
    switch(props.$priority) {
      case 'critical': return 'var(--error)';
      case 'important': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  }};
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const AnalysisLabel = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;