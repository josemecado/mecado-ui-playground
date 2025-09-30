// components/RequirementCell.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Requirement } from "../../../versionNodes/utils/VersionInterfaces";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RequirementCellProps {
  requirement: Requirement;
  defaultExpanded?: boolean;
}

export const RequirementCell: React.FC<RequirementCellProps> = ({
  requirement,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle size={14} />;
      case "fail":
        return <XCircle size={14} />;
      default:
        return <AlertTriangle size={14} />;
    }
  };

  const calculateDelta = () => {
    if (requirement.currentValue === undefined) return null;
    return Math.abs(requirement.targetValue - requirement.currentValue);
  };

  const delta = calculateDelta();

  return (
    <CellContainer
      $status={requirement.status}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Compact View - Always Visible */}
      <CompactView>
        <CompactLeft>
          <CompactSubtitleContainer>
            <StatusIconWrapper $status={requirement.status}>
              {getStatusIcon(requirement.status)}
            </StatusIconWrapper>
            <CellName>{requirement.name}</CellName>
          </CompactSubtitleContainer>

          <ExpandIcon>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </ExpandIcon>
        </CompactLeft>
        <CompactRight>
          <PriorityBadge >
            Target: 
          </PriorityBadge>
          <CompactSubtitleContainer>
            <TargetValue>
              {requirement.comparator} {requirement.targetValue}{" "}
              {requirement.unit}
            </TargetValue>
          </CompactSubtitleContainer>
        </CompactRight>
      </CompactView>

      {/* Expanded View - Conditional */}
      {isExpanded && (
        <ExpandedView>
          <Divider />

          <DetailsGrid>
            {requirement.currentValue !== undefined && (
              <DetailRow>
                <DetailLabel>Current:</DetailLabel>
                <DetailValue $status={requirement.status}>
                  {requirement.currentValue} {requirement.unit}
                </DetailValue>
              </DetailRow>
            )}

            <DetailRow>
              <DetailLabel>Category:</DetailLabel>
              <CategoryBadge>{requirement.category}</CategoryBadge>
            </DetailRow>

            {requirement.description && (
              <DetailRow $fullWidth>
                <Description>{requirement.description}</Description>
              </DetailRow>
            )}
          </DetailsGrid>

          {requirement.status === "fail" && delta !== null && (
            <>
              <Divider />
              <DeltaSection>
                <DeltaIndicator>
                  <Target size={12} />
                  <span>
                    Delta: {delta.toFixed(2)} {requirement.unit}
                  </span>
                </DeltaIndicator>
              </DeltaSection>
            </>
          )}
        </ExpandedView>
      )}
    </CellContainer>
  );
};

// Styled Components
const CellContainer = styled.div<{ $status?: string }>`
  background: var(--bg-tertiary);
  border: 1px solid
    ${(props) => {
      switch (props.$status) {
        case "pass":
          return "var(--success)";
        case "fail":
          return "var(--error)";
        default:
          return "var(--border-outline)";
      }
    }};
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: ${(props) => {
      switch (props.$status) {
        case "pass":
          return "#10b981";
        case "fail":
          return "#dc2626";
        default:
          return "var(--primary-alternate)";
      }
    }};
  }
`;

const CompactView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 10px;
  gap: 8px;
`;

const CompactLeft = styled.div`
  display: flex;
  align-items: center;
justify-content: space-between;
  flex: 1;
  min-width: 0;
`;

const StatusIconWrapper = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${(props) => {
    switch (props.$status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  }};
`;

const CellName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CompactRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
`;

const CompactSubtitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const PriorityBadge = styled.div<{ $priority: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) => {
    switch (props.$priority) {
      case "critical":
        return "rgba(239, 68, 68, 0.1)";
      case "important":
        return "rgba(99, 102, 241, 0.1)";
      default:
        return "var(--bg-secondary)";
    }
  }};
  color: ${(props) => {
    switch (props.$priority) {
      case "critical":
        return "var(--error)";
      case "important":
        return "var(--accent-primary)";
      default:
        return "var(--text-muted)";
    }
  }};
  white-space: nowrap;
`;

const TargetValue = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
`;

const ExpandIcon = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: transform 0.2s ease;
`;

const ExpandedView = styled.div`
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-bg);
  margin: 0 10px;
`;

const DetailsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
`;

const DetailRow = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  align-items: ${(props) => (props.$fullWidth ? "flex-start" : "center")};
  gap: 8px;
  font-size: 11px;
  flex-direction: ${(props) => (props.$fullWidth ? "column" : "row")};
`;

const DetailLabel = styled.span`
  color: var(--text-primary);
  font-weight: 500;
  min-width: ${(props) => (props.theme?.$fullWidth ? "auto" : "60px")};
  font-size: 10px;
`;

const DetailValue = styled.span<{ $status?: string }>`
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

const Description = styled.p`
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
`;

const DeltaSection = styled.div`
  padding: 8px 10px;
`;

const DeltaIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--error);
  font-weight: 500;
`;
