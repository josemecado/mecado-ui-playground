// components/AnalysisToolbar.tsx
import React from "react";
import styled from "styled-components";
import {
  AnalysisGroup,
  Requirement,
} from "../../versionNodes/utils/VersionInterfaces";
import { Play } from "lucide-react";

interface AnalysisToolbarProps {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  activeTab: string | "all";
  onTabChange: (tabId: string | "all") => void;
  onRequirementsClick: () => void;
  onRunAnalyses?: () => void;
}

export const AnalysisToolbar: React.FC<AnalysisToolbarProps> = ({
  analysisGroups,
  requirements,
  activeTab,
  onTabChange,
  onRequirementsClick,
  onRunAnalyses,
}) => {
  const passedRequirements = requirements.filter(
    (r) => r.status === "pass"
  ).length;
  const totalRequirements = requirements.length;
  const requirementRatio =
    totalRequirements > 0
      ? ((passedRequirements / totalRequirements) * 100).toFixed(0)
      : 0;

  return (
    <ToolbarContainer>
      <LeftSection>
        <RunButton onClick={onRunAnalyses}>
          <PlayIcon>
            <Play size={16} />
          </PlayIcon>
          <RunLabel>Run Analyses</RunLabel>
        </RunButton>
      </LeftSection>

      <RightSection>
        <TabSection>
          <BaseTabButton
            $active={activeTab === "all"}
            onClick={() => onTabChange("all")}
          >
            <TabLabel>Overview</TabLabel>
            <TabCount $active={activeTab === "all"}>
              {analysisGroups.length}
            </TabCount>
          </BaseTabButton>

          {analysisGroups.map((group) => (
            <BaseTabButton
              key={group.id}
              $active={activeTab === group.id}
              onClick={() => onTabChange(group.id)}
            >
              <TabLabel>{group.name}</TabLabel>
              <StatusIndicator $status={group.status} />
            </BaseTabButton>
          ))}
        </TabSection>
      </RightSection>
    </ToolbarContainer>
  );
};

// Styled Components
const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 10;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TabSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Base tab button that both Overview and regular tabs inherit from
const BaseTabButton = styled.button<{
  $active: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${(props) =>
    props.$active ? "var(--primary-action)" : "var(--bg-tertiary)"};
  color: ${(props) =>
    props.$active ? "white" : "var(--text-primary)"};
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--primary-alternate)" : "var(--border-bg)"};
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$active ? "var(--primary-action)" : "var(--hover-bg)"};
    border-color: ${(props) =>
      props.$active ? "var(--accent-primary)" : "var(--primary-alternate)"};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const RunButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--hover-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PlayIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RunLabel = styled.span`
  letter-spacing: 0.3px;
`;

const TabLabel = styled.span`
  letter-spacing: 0.3px;
`;

const TabCount = styled.span<{ $active: boolean }>`
  font-size: 11px;
  font-weight: 600;
  opacity: 0.8;
  background: ${(props) => (props.$active ? "rgba(255, 255, 255, 0.2)" : "var(--bg-secondary)")};
  color: ${(props) => (props.$active ? "white" : "var(--text-muted)")};
  padding: 2px 6px;
  border-radius: 10px;
`;

const StatusIndicator = styled.div<{ $status: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => {
    switch (props.$status) {
      case "passed":
        return "var(--success)";
      case "failed":
        return "var(--error)";
      case "running":
        return "var(--accent-primary)";
      case "partial":
        return "var(--accent-primary)";
      default:
        return "var(--text-muted)";
    }
  }};
  box-shadow: ${(props) => {
    if (props.$status === "running") {
      return "0 0 0 2px rgba(var(--accent-primary), 0.3)";
    }
    return "none";
  }};
  animation: ${(props) =>
    props.$status === "running" ? "pulse 2s infinite" : "none"};

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;