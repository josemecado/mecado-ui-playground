// components/AnalysisIndividualNode.tsx
import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled, { keyframes, css } from "styled-components";
import { Analysis } from "../../versionNodes/utils/VersionInterfaces";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  BarChart3,
  Settings,
  AlertTriangle
} from "lucide-react";

interface AnalysisNodeData extends Analysis {
  isActive?: boolean;
  isCompleted?: boolean;
  isFailed?: boolean;
}

export const AnalysisIndividualNode: React.FC<NodeProps> = ({ data }) => {
  const analysis = data as AnalysisNodeData;
  
  const getStatusIcon = () => {
    if (analysis.isActive) return <Activity size={14} className="spin" />;
    if (analysis.isCompleted) return <CheckCircle size={14} />;
    if (analysis.isFailed) return <XCircle size={14} />;
    
    switch(analysis.status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'failed': return <XCircle size={14} />;
      case 'running': return <Activity size={14} className="spin" />;
      default: return <Clock size={14} />;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('thermal')) return <Zap size={16} />;
    if (type.includes('modal')) return <Activity size={16} />;
    if (type.includes('stress') || type.includes('structural')) return <Settings size={16} />;
    return <BarChart3 size={16} />;
  };

  const getNodeStatus = () => {
    if (analysis.isActive) return 'running';
    if (analysis.isCompleted) return 'completed';
    if (analysis.isFailed) return 'failed';
    return analysis.status;
  };

  return (
    <NodeContainer 
      $status={getNodeStatus()}
      $isActive={analysis.isActive}
      $isCompleted={analysis.isCompleted}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ 
          background: 'var(--primary-alternate)',
          border: '2px solid var(--bg-primary)',
          width: 10,
          height: 10,
          left: -5
        }} 
      />
      
      {analysis.isActive && <ActivePulse />}
      
      <NodeHeader>
        <TypeIconWrapper $type={analysis.type}>
          {getTypeIcon(analysis.type)}
        </TypeIconWrapper>
        <StatusIconWrapper $status={getNodeStatus()}>
          {getStatusIcon()}
        </StatusIconWrapper>
      </NodeHeader>

      <NodeBody>
        <AnalysisName>{analysis.name}</AnalysisName>
        <AnalysisType>{analysis.type}</AnalysisType>
        
        {analysis.isActive && (
          <ActiveIndicator>
            <LoadingBar />
            <StatusText>ANALYZING...</StatusText>
          </ActiveIndicator>
        )}

        {analysis.isCompleted && analysis.metrics && analysis.metrics.length > 0 && (
          <CompletedIndicator>
            <MetricBadge>
              <BarChart3 size={10} />
              {analysis.metrics.length} metrics
            </MetricBadge>
          </CompletedIndicator>
        )}

        {analysis.isFailed && (
          <FailedIndicator>
            <AlertTriangle size={12} />
            <span>Analysis Failed</span>
          </FailedIndicator>
        )}

        {!analysis.isActive && !analysis.isCompleted && !analysis.isFailed && (
          <PendingIndicator>
            <Clock size={10} />
            <span>Pending</span>
          </PendingIndicator>
        )}
      </NodeBody>

      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ 
          background: 'var(--primary-alternate)',
          border: '2px solid var(--bg-primary)',
          width: 10,
          height: 10,
          right: -5
        }} 
      />
    </NodeContainer>
  );
};

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.3); }
  50% { box-shadow: 0 0 40px rgba(var(--accent-primary-rgb), 0.6); }
`;

const loadingAnimation = keyframes`
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
`;

const pulseRing = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

// Styled Components
const NodeContainer = styled.div<{ 
  $status: string; 
  $isActive?: boolean;
  $isCompleted?: boolean;
}>`
  position: relative;
  background: ${props => {
    if (props.$isActive) {
      return 'var(--bg-tertiary)';
    }
    if (props.$isCompleted) {
      return 'linear-gradient(135deg, var(--success) 0%, #10b981 100%)';
    }
    return 'var(--bg-secondary)';
  }};
  border: ${props => {
    if (props.$isActive) return '2px solid var(--border-outline)';
    if (props.$isCompleted) return '2px solid var(--border-bg)';
    switch(props.$status) {
      case 'failed': return '2px solid var(--error)';
      default: return '1px solid var(--border-outline)';
    }
  }};
  border-radius: 12px;
  padding: 12px;
  min-width: 180px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isActive 
    ? '0 8px 24px rgba(var(--accent-primary-rgb), 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  
  ${props => props.$isActive && css`
    animation: ${pulse} 2s ease-in-out infinite, ${glow} 2s ease-in-out infinite;
    transform: scale(1.05);
  `}

  &:hover {
    transform: ${props => props.$isActive ? 'scale(1.05)' : 'translateY(-2px)'};
    box-shadow: ${props => props.$isActive 
      ? '0 12px 32px rgba(var(--accent-primary-rgb), 0.4)' 
      : '0 8px 20px rgba(0, 0, 0, 0.15)'};
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

const NodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const TypeIconWrapper = styled.div<{ $type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
`;

const StatusIconWrapper = styled.div<{ $status: string }>`
  color: ${props => {
    switch(props.$status) {
      case 'completed': return 'white';
      case 'failed': return 'var(--error)';
      case 'running': return 'white';
      default: return 'var(--text-muted)';
    }
  }};
`;

const NodeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AnalysisName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
`;

const AnalysisType = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.8;
`;

const ActiveIndicator = styled.div`
  margin-top: 8px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(10px);
`;

const LoadingBar = styled.div`
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: white;
    border-radius: 2px;
    animation: ${loadingAnimation} 2s ease-in-out infinite;
  }
`;

const StatusText = styled.div`
  font-size: 9px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.8px;
  text-align: center;
`;

const CompletedIndicator = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 4px;
`;

const MetricBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  color: white;
`;

const FailedIndicator = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--error);
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  background: rgba(var(--error-rgb), 0.1);
  border-radius: 6px;
`;

const PendingIndicator = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 500;
`;