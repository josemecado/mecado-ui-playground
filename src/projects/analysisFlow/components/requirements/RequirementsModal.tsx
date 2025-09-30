// components/RequirementsModal.tsx
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Requirement, AnalysisGroup } from "../../../versionNodes/utils/VersionInterfaces";
import { RequirementCell } from "./RequirementCell";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

interface RequirementsModalProps {
  analysisGroups: AnalysisGroup[];
  selectedGroup?: AnalysisGroup | null;
}

export const RequirementsModal: React.FC<RequirementsModalProps> = ({
  analysisGroups,
  selectedGroup,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Aggregate requirements based on current view
  const aggregatedRequirements = useMemo(() => {
    // Early return if no data
    if (!analysisGroups || analysisGroups.length === 0) {
      return [];
    }

    if (selectedGroup) {
      // Detail view: Show group requirements + all analysis requirements
      const analysisReqs = selectedGroup.analyses?.flatMap(a => a.requirements || []) || [];
      const groupReqs = selectedGroup.requirements || [];
      return [...groupReqs, ...analysisReqs];
    } else {
      // Overview: Show all group requirements + all analysis requirements
      return analysisGroups.flatMap(g => [
        ...(g.requirements || []),
        ...(g.analyses?.flatMap(a => a.requirements || []) || [])
      ]);
    }
  }, [analysisGroups, selectedGroup]);

  const passedCount = aggregatedRequirements.filter((r) => r.status === "pass").length;
  const failedCount = aggregatedRequirements.filter((r) => r.status === "fail").length;
  const pendingCount = aggregatedRequirements.filter((r) => r.status === "pending").length;

  const displayName = selectedGroup ? selectedGroup.name : "All Groups";

  // Don't render if no requirements
  if (aggregatedRequirements.length === 0) {
    return null;
  }


  return (
    <ModalContainer>
      <ModalHeader onClick={() => setIsExpanded(!isExpanded)}>
        <HeaderLeft>
          <IconWrapper>
            <FileText size={16} />
          </IconWrapper>
          <HeaderContent>
            <ModalTitle>{displayName}</ModalTitle>
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
          </HeaderContent>
        </HeaderLeft>
        <HeaderRight>
          <ExpandButton>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </ExpandButton>
        </HeaderRight>
      </ModalHeader>

      {isExpanded && (
        <ModalContent>
          <RequirementsList>
            {aggregatedRequirements.length > 0 ? (
              aggregatedRequirements.map((req) => (
                <RequirementCell key={req.id} requirement={req} />
              ))
            ) : (
              <EmptyState>No requirements defined</EmptyState>
            )}
          </RequirementsList>
        </ModalContent>
      )}
    </ModalContainer>
  );
};

// Styled Components (same as before, plus EmptyState)
const ModalContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 225px;
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
  padding: 10px;
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
  background: var(--primary-alternate);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverted);
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
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
  color: ${(props) => props.$color};
  font-size: 11px;
  font-weight: 600;
`;

const ExpandButton = styled.div`
  color: var(--text-muted);
`;

const ModalContent = styled.div`
  padding: 10px;
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

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
`;