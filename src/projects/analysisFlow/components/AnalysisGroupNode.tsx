// components/AnalysisGroupNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled from "styled-components";
import { AnalysisGroup } from "../../versionNodes/utils/VersionInterfaces";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Layers
} from "lucide-react";

export const AnalysisGroupNode: React.FC<NodeProps> = ({ data }) => {
  const group = data.group as AnalysisGroup;
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'passed': return <CheckCircle size={16} />;
      case 'failed': return <XCircle size={16} />;
      case 'running': return <Activity size={16} className="spin" />;
      case 'partial': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const completedCount = group.analyses.filter(
    a => a.status === 'completed' || a.status === 'failed'
  ).length;
  const totalCount = group.analyses.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <GroupContainer $status={group.status}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <GroupHeader>
        <IconWrapper>
          <Layers size={18} />
        </IconWrapper>
        <HeaderContent>
          <GroupTitle>{group.name}</GroupTitle>
          <GroupSubtitle>Analysis Group</GroupSubtitle>
        </HeaderContent>
        <StatusIcon $status={group.status}>
          {getStatusIcon(group.status)}
        </StatusIcon>
      </GroupHeader>

      <Divider />

      <GroupBody>
        <MetricRow>
          <MetricCard>
            <MetricLabel>Progress</MetricLabel>
            <MetricValue>{completedCount}/{totalCount}</MetricValue>
            <MiniProgressBar>
              <MiniProgressFill $percentage={progressPercentage} $status={group.status} />
            </MiniProgressBar>
          </MetricCard>
          
          {group.requirements && (
            <MetricCard>
              <MetricLabel>Requirements</MetricLabel>
              <MetricValue>
                {group.requirements.filter(r => r.status === 'pass').length}/
                {group.requirements.length}
              </MetricValue>
              <RequirementStatus $hasFailed={
                group.requirements.some(r => r.status === 'fail')
              }>
                {group.requirements.every(r => r.status === 'pass') ? 'All Pass' : 'Some Failed'}
              </RequirementStatus>
            </MetricCard>
          )}
        </MetricRow>

        <StatusSection>
          <StatusLabel>Status</StatusLabel>
          <StatusBadge $status={group.status}>
            {group.status.toUpperCase()}
          </StatusBadge>
        </StatusSection>
      </GroupBody>

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </GroupContainer>
  );
};

// Styled Components
const GroupContainer = styled.div<{ $status: string }>`
  background: var(--bg-secondary);
  border: 2px solid ${props => {
    switch(props.$status) {
      case 'passed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      case 'running': return 'var(--accent-primary)';
      case 'partial': return 'var(--accent-primary)';
      default: return 'var(--border-outline)';
    }
  }};
  border-radius: 16px;
  padding: 0;
  min-width: 300px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 15px 40px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--primary-alternate);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverted);
  margin-right: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const GroupTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
`;

const GroupSubtitle = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 2px;
`;

const StatusIcon = styled.div<{ $status: string }>`
  color: ${props => {
    switch(props.$status) {
      case 'passed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      case 'running': return 'var(--accent-primary)';
      case 'partial': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  }};
  opacity: 0.9;
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-outline);
`;

const GroupBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const MetricCard = styled.div`
  padding: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  backdrop-filter: blur(5px);
`;

const MetricLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const MiniProgressBar = styled.div`
  height: 4px;
  background: var(--bg-primary);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const MiniProgressFill = styled.div<{ $percentage: number; $status: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(90deg,
    ${props => {
      switch(props.$status) {
        case 'passed': return 'var(--success)';
        case 'failed': return 'var(--error)';
        case 'running': return 'var(--accent-primary)';
        default: return 'var(--primary-alternate)';
      }
    }} 0%,
    ${props => {
      switch(props.$status) {
        case 'passed': return '#10b981';
        case 'failed': return '#dc2626';
        case 'running': return 'var(--accent-secondary)';
        default: return 'var(--primary-action)';
      }
    }} 100%
  );
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const RequirementStatus = styled.div<{ $hasFailed: boolean }>`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.$hasFailed ? 'var(--error)' : 'var(--success)'};
  margin-top: 2px;
`;

const StatusSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid var(--border-bg);
`;

const StatusLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: ${props => {
    switch(props.$status) {
      case 'passed': return 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)';
      case 'failed': return 'linear-gradient(135deg, var(--error) 0%, #dc2626 100%)';
      case 'running': return 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)';
      case 'partial': return 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)';
      default: return 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)';
    }
  }};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;