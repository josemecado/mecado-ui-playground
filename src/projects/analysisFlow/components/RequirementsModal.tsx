// components/RequirementsModal.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Requirement } from "../../versionNodes/utils/VersionInterfaces";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  FileText
} from "lucide-react";

interface RequirementsModalProps {
  requirements: Requirement[];
  groupName: string;
}

export const RequirementsModal: React.FC<RequirementsModalProps> = ({
  requirements,
  groupName
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const passedCount = requirements.filter(r => r.status === 'pass').length;
  const failedCount = requirements.filter(r => r.status === 'fail').length;
  const pendingCount = requirements.filter(r => r.status === 'pending').length;
  const totalCount = requirements.length;
  const passRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(0) : 0;

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'pass': return <CheckCircle size={14} />;
      case 'fail': return <XCircle size={14} />;
      default: return <AlertTriangle size={14} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'pass': return 'var(--success)';
      case 'fail': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'var(--error)';
      case 'important': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <ModalContainer>
      <ModalHeader onClick={() => setIsExpanded(!isExpanded)}>
        <HeaderLeft>
          <IconWrapper>
            <FileText size={16} />
          </IconWrapper>
          <HeaderContent>
            <ModalTitle>{groupName} Requirements</ModalTitle>
            <ModalSubtitle>{totalCount} requirements • {passRate}% passing</ModalSubtitle>
          </HeaderContent>
        </HeaderLeft>
        <HeaderRight>
          <StatusSummary>
            <StatusItem $color="var(--success)">
              <CheckCircle size={12} />
              <span>{passedCount}</span>
            </StatusItem>
            <StatusItem $color="var(--error)">
              <XCircle size={12} />
              <span>{failedCount}</span>
            </StatusItem>
            <StatusItem $color="var(--text-muted)">
              <AlertTriangle size={12} />
              <span>{pendingCount}</span>
            </StatusItem>
          </StatusSummary>
          <ExpandButton>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </ExpandButton>
        </HeaderRight>
      </ModalHeader>

      {isExpanded && (
        <ModalContent>
          <RequirementsList>
            {requirements.map((req) => (
              <RequirementCard key={req.id} $status={req.status}>
                <CardHeader>
                  <CardTitle>
                    {getStatusIcon(req.status)}
                    <span>{req.name}</span>
                  </CardTitle>
                  <PriorityBadge $priority={req.priority}>
                    {req.priority}
                  </PriorityBadge>
                </CardHeader>

                <CardBody>
                  <SpecRow>
                    <SpecLabel>Target:</SpecLabel>
                    <SpecValue>
                      {req.comparator} {req.targetValue} {req.unit}
                    </SpecValue>
                  </SpecRow>
                  
                  {req.currentValue !== undefined && (
                    <SpecRow>
                      <SpecLabel>Current:</SpecLabel>
                      <SpecValue $status={req.status}>
                        {req.currentValue} {req.unit}
                      </SpecValue>
                    </SpecRow>
                  )}

                  <SpecRow>
                    <SpecLabel>Category:</SpecLabel>
                    <CategoryBadge>{req.category}</CategoryBadge>
                  </SpecRow>
                </CardBody>

                {req.status === 'fail' && req.currentValue !== undefined && (
                  <CardFooter>
                    <DeltaIndicator>
                      <Target size={12} />
                      <span>
                        Delta: {Math.abs(req.targetValue - req.currentValue).toFixed(2)} {req.unit}
                      </span>
                    </DeltaIndicator>
                  </CardFooter>
                )}
              </RequirementCard>
            ))}
          </RequirementsList>
        </ModalContent>
      )}
    </ModalContainer>
  );
};

// Styled Components
const ModalContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 320px;
  max-width: 400px;
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-tertiary);
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary-action) 0%, var(--primary-alternate) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
`;

const ModalSubtitle = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 3px;
  color: ${props => props.$color};
  font-size: 11px;
  font-weight: 600;
`;

const ExpandButton = styled.div`
  color: var(--text-muted);
`;

const ModalContent = styled.div`
  padding: 12px;
  max-height: 400px;
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
    
    &:hover {
      background: var(--text-muted);
    }
  }
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RequirementCard = styled.div<{ $status?: string }>`
  background: var(--bg-tertiary);
  border: 1px solid ${props => {
    switch(props.$status) {
      case 'pass': return 'var(--success)';
      case 'fail': return 'var(--error)';
      default: return 'var(--border-outline)';
    }
  }};
  border-radius: 8px;
  padding: 10px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const PriorityBadge = styled.div<{ $priority: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.$priority) {
      case 'critical': return 'rgba(var(--error-rgb), 0.1)';
      case 'important': return 'rgba(var(--accent-primary-rgb), 0.1)';
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

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SpecRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
`;

const SpecLabel = styled.span`
  color: var(--text-muted);
  font-weight: 500;
  min-width: 50px;
`;

const SpecValue = styled.span<{ $status?: string }>`
  color: ${props => {
    switch(props.$status) {
      case 'pass': return 'var(--success)';
      case 'fail': return 'var(--error)';
      default: return 'var(--text-primary)';
    }
  }};
  font-weight: 600;
`;

const CategoryBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: capitalize;
  background: var(--bg-secondary);
  color: var(--primary-alternate);
  border: 1px solid var(--border-outline);
`;

const CardFooter = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-bg);
`;

const DeltaIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--error);
  font-weight: 500;
`;