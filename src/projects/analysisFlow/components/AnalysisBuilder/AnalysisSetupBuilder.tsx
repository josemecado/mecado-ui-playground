// analysisFlow/components/AnalysisBuilder/AnalysisSetupBuilder.tsx
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import {
  Requirement,
  Analysis,
  AnalysisGroup,
} from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { RequirementsBuilder } from "./RequirementsBuilder";
import { CheckCircle, Layers } from "lucide-react";
import { useTheme } from "../../../../utilities/ThemeContext";

import { AnalysisGroupBuilder } from "./AnalysisGroupBuilder";

interface AnalysisSetupBuilderProps {
  onClose: () => void;
  onSave: (data: {
    requirements: Requirement[];
    analysisGroups: AnalysisGroup[];
  }) => void;
  initialRequirements?: Requirement[];
  initialAnalyses?: Analysis[];
  initialGroups?: AnalysisGroup[];
  mode?: "create" | "edit";
}

type PanelTab = "requirements" | "analyses" | "groups";

export const AnalysisSetupBuilder: React.FC<AnalysisSetupBuilderProps> = ({
  onClose,
  onSave,
  initialRequirements = [],
  initialAnalyses = [],
  initialGroups = [],
  mode = "create",
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>("requirements");
  const [requirements, setRequirements] =
    useState<Requirement[]>(initialRequirements);
  const [analyses, setAnalyses] = useState<Analysis[]>(initialAnalyses);
  const [groups, setGroups] = useState<AnalysisGroup[]>(initialGroups);
  const { theme } = useTheme();

  const handleSave = () => {
    onSave({
      requirements,
      analysisGroups: groups,
    });
  };

  const tabs = useMemo(
    () => [
      {
        id: "requirements" as PanelTab,
        label: "Requirements",
        icon: <CheckCircle size={14} />,
        count: requirements.length,
      },
      {
        id: "groups" as PanelTab,
        label: "Analysis Groups",
        icon: <Layers size={14} />,
        count: groups.length,
      },
    ],
    [requirements.length, groups.length]
  );

  const canSave =
    requirements.length > 0 && analyses.length > 0 && groups.length > 0;

  return (
    <PanelContainer $theme={theme}>
      <HeaderSection $theme={theme}>
        <TabBar>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon>{tab.icon}</TabIcon>
              <TabLabel>{tab.label}</TabLabel>
              {tab.count > 0 && <TabCount>{tab.count}</TabCount>}
            </Tab>
          ))}
        </TabBar>
      </HeaderSection>

      <PanelContent>
        {activeTab === "requirements" && (
          <RequirementsBuilder
            requirements={requirements}
            onChange={setRequirements}
          />
        )}
        {activeTab === "groups" && (
          <AnalysisGroupBuilder
            groups={groups}
            requirements={requirements}
            onChange={setGroups}
          />
        )}
      </PanelContent>

      <PanelFooter>
        <FooterButton $variant="secondary" onClick={onClose}>
          Cancel
        </FooterButton>
        <FooterButton
          $variant="primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          {mode === "create" ? "Create Configuration" : "Save Changes"}
        </FooterButton>
      </PanelFooter>
    </PanelContainer>
  );
};

// Styled Components - REMOVED OVERLAY
const PanelContainer = styled.div<{ $theme: "dark" | "light" }>`
  display: flex;
  flex-direction: column;
  width: 100%;

  background: ${props => props.$theme === "dark" ? "var(--bg-shadow)" : "var(--bg-secondary)"};
  border-left: 1px solid var(--border-bg);

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

const TabBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

const HeaderSection = styled.div<{ $theme: "light" | "dark" }>`
  display: flex;
  background-color: ${(props) =>
    props.$theme === "dark" ? "var(--bg-shadow)" : "var(--bg-secondary)"};
  padding: 16px 16px 0 16px;
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 6px;
  padding: 10px 12px;
  background: ${(props) =>
    props.$active ? "var(--accent-primary)" : "var(--bg-tertiary)"};
  border: none;
  border-bottom: 1px solid var(--border-bg);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  color: ${(props) => (props.$active ? "white" : "var(--text-muted)")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  ${(props) =>
    props.$active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent-primary);
    }
  `}

  &:hover {
    background: ${(props) =>
      props.$active ? "var(--accent-primary)" : "var(--hover-bg)"};
    color: ${(props) => (props.$active ? "white" : "var(--text-primary)")};
  }
`;

const TabIcon = styled.div`
  display: flex;
  align-items: center;
`;

const TabLabel = styled.span``;

const TabCount = styled.span`
  padding: 2px 6px;
  background: var(--primary-alternate);
  color: var(--text-inverted);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 0 16px;
`;

const PanelFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-bg);
`;

const FooterButton = styled.button<{ $variant: "primary" | "secondary" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: var(--accent-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--hover-primary);
    }
  `
      : `
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border-bg);
    
    &:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
