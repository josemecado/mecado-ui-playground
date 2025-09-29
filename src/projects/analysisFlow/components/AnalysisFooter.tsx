// components/AnalysisDetailsFooter.tsx
import React from "react";
import styled from "styled-components";
import { Analysis } from "../../versionNodes/utils/VersionInterfaces";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  Activity,
  FileText,
  Settings,
  X
} from "lucide-react";

interface AnalysisDetailsFooterProps {
  analysis: Analysis | null;
  onClose: () => void;
}

export const AnalysisDetailsFooter: React.FC<AnalysisDetailsFooterProps> = ({
  analysis,
  onClose
}) => {
  if (!analysis) return null;

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'failed': return <XCircle size={14} />;
      case 'running': return <Activity size={14} className="spin" />;
      default: return <Clock size={14} />;
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not executed';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <FooterContainer>
      <FooterHeader>
        <HeaderLeft>
          <Title>Analysis Details</Title>
          <AnalysisName>{analysis.name}</AnalysisName>
        </HeaderLeft>
        <CloseButton onClick={onClose}>
          <X size={16} />
        </CloseButton>
      </FooterHeader>

      <FooterContent>
        <MainSection>
          <InfoGrid>
            <InfoCard>
              <InfoLabel>Status</InfoLabel>
              <InfoValue $status={analysis.status}>
                {getStatusIcon(analysis.status)}
                <span>{analysis.status}</span>
              </InfoValue>
            </InfoCard>

            <InfoCard>
              <InfoLabel>Type</InfoLabel>
              <InfoValue>
                <Settings size={12} />
                <span>{analysis.type}</span>
              </InfoValue>
            </InfoCard>

            <InfoCard>
              <InfoLabel>Duration</InfoLabel>
              <InfoValue>
                <Clock size={12} />
                <span>{formatDuration(analysis.duration)}</span>
              </InfoValue>
            </InfoCard>

            <InfoCard>
              <InfoLabel>Executed</InfoLabel>
              <InfoValue>
                <span>{formatDate(analysis.executedAt)}</span>
              </InfoValue>
            </InfoCard>
          </InfoGrid>

          {analysis.progress !== undefined && (
            <ProgressSection>
              <ProgressLabel>Progress</ProgressLabel>
              <ProgressBarContainer>
                <ProgressBar $progress={analysis.progress} />
                <ProgressText>{analysis.progress}%</ProgressText>
              </ProgressBarContainer>
            </ProgressSection>
          )}

          {analysis.metrics && analysis.metrics.length > 0 && (
            <MetricsSection>
              <SectionTitle>
                <FileText size={14} />
                Results Metrics
              </SectionTitle>
              <MetricsList>
                {analysis.metrics.slice(0, 3).map((metric, index) => (
                  <MetricItem key={index}>
                    <MetricName>{metric.title}</MetricName>
                    <MetricValue>
                      {metric.values && metric.values[0] 
                        ? `${metric.values[0].value.toExponential(2)} ${metric.values[0].unit || ''}`
                        : 'N/A'
                      }
                    </MetricValue>
                  </MetricItem>
                ))}
              </MetricsList>
            </MetricsSection>
          )}
        </MainSection>

        <ActionsSection>
          {analysis.errors && analysis.errors.length > 0 && (
            <ErrorSection>
              <ErrorHeader>
                <AlertTriangle size={14} />
                <span>Errors ({analysis.errors.length})</span>
              </ErrorHeader>
              <ErrorList>
                {analysis.errors.map((error, index) => (
                  <ErrorItem key={index}>
                    <ChevronRight size={12} />
                    <span>{error}</span>
                  </ErrorItem>
                ))}
              </ErrorList>
            </ErrorSection>
          )}

          {analysis.warnings && analysis.warnings.length > 0 && (
            <WarningSection>
              <WarningHeader>
                <AlertTriangle size={14} />
                <span>Warnings ({analysis.warnings.length})</span>
              </WarningHeader>
              <WarningList>
                {analysis.warnings.map((warning, index) => (
                  <WarningItem key={index}>
                    <ChevronRight size={12} />
                    <span>{warning}</span>
                  </WarningItem>
                ))}
              </WarningList>
            </WarningSection>
          )}

          <ActionButtons>
            <ActionButton $variant="primary" disabled={analysis.status === 'running'}>
              <Settings size={14} />
              Configure
            </ActionButton>
            <ActionButton $variant="secondary" disabled={analysis.status === 'running'}>
              <Activity size={14} />
              {analysis.status === 'failed' ? 'Retry' : 'Re-run'}
            </ActionButton>
            <ActionButton $variant="tertiary">
              <FileText size={14} />
              View Logs
            </ActionButton>
          </ActionButtons>
        </ActionsSection>
      </FooterContent>
    </FooterContainer>
  );
};

// Styled Components
const FooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-top: 2px solid var(--border-bg);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const FooterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnalysisName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--primary-alternate);
  }
`;

const FooterContent = styled.div`
  display: flex;
  padding: 16px 20px;
  gap: 20px;
  max-height: 280px;
  overflow-y: auto;

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
  }
`;

const MainSection = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const InfoCard = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  padding: 10px;
`;

const InfoLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 6px;
`;

const InfoValue = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => {
    switch(props.$status) {
      case 'completed': return 'var(--success)';
      case 'failed': return 'var(--error)';
      case 'running': return 'var(--accent-primary)';
      default: return 'var(--text-primary)';
    }
  }};

  svg {
    opacity: 0.8;
  }
`;

const ProgressSection = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  padding: 12px;
`;

const ProgressLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  flex: 1;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: var(--accent-primary);
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const MetricsSection = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  padding: 12px;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MetricItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
`;

const MetricName = styled.div`
  font-size: 11px;
  color: var(--text-muted);
`;

const MetricValue = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ActionsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ErrorSection = styled.div`
  background: rgba(var(--error-rgb), 0.1);
  border: 1px solid var(--error);
  border-radius: 8px;
  padding: 10px;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--error);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ErrorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ErrorItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 10px;
  color: var(--error);
  line-height: 1.4;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const WarningSection = styled.div`
  background: rgba(var(--accent-primary-rgb), 0.1);
  border: 1px solid var(--accent-primary);
  border-radius: 8px;
  padding: 10px;
`;

const WarningHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--accent-primary);
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const WarningList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WarningItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 10px;
  color: var(--accent-primary);
  line-height: 1.4;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'tertiary' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  ${props => {
    switch(props.$variant) {
      case 'primary':
        return `
          background: var(--accent-primary);
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background: var(--hover-primary);
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-outline);
          
          &:hover:not(:disabled) {
            background: var(--hover-bg);
            border-color: var(--primary-alternate);
            transform: translateY(-1px);
          }
        `;
      case 'tertiary':
        return `
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-bg);
          
          &:hover:not(:disabled) {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border-color: var(--border-outline);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    opacity: 0.8;
  }
`;