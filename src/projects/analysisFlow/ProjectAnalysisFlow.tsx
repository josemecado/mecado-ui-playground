// views/ProjectAnalysisFlow.tsx
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { AnalysisGroup, Analysis, Requirement } from "../versionNodes/utils/VersionInterfaces";
import { AnalysisToolbar } from "./components/AnalysisFlowToolbar";
import { AnalysisFlowView } from "./components/AnalysisGroupFlow";

interface ProjectAnalysisFlowProps {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  activeVersionId: string;
  onAnalysisClick?: (analysis: Analysis) => void;
  onGroupClick?: (group: AnalysisGroup) => void;
  onRequirementsClick?: () => void;
  onRefreshAnalyses?: () => void;
}

export const ProjectAnalysisFlow: React.FC<ProjectAnalysisFlowProps> = ({
  analysisGroups,
  requirements,
  activeVersionId,
  onAnalysisClick,
  onGroupClick,
  onRequirementsClick,
  onRefreshAnalyses,
}) => {
  const [activeTab, setActiveTab] = useState<string | "all">("all");
  const [showRequirementsPanel, setShowRequirementsPanel] = useState(false);

  const handleTabChange = useCallback((tabId: string | "all") => {
    setActiveTab(tabId);
  }, []);

  const handleRequirementsClick = useCallback(() => {
    setShowRequirementsPanel(!showRequirementsPanel);
    onRequirementsClick?.();
  }, [showRequirementsPanel, onRequirementsClick]);

  const handleGroupClick = useCallback((group: AnalysisGroup) => {
    // If clicking a group in "all" view, switch to that group's tab
    if (activeTab === "all") {
      setActiveTab(group.id);
    }
    onGroupClick?.(group);
  }, [activeTab, onGroupClick]);

  return (
    <FlowContainer>
      <AnalysisToolbar
        analysisGroups={analysisGroups}
        requirements={requirements}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onRequirementsClick={handleRequirementsClick}
      />
      
      <ContentContainer>
        <AnalysisFlowView
          analysisGroups={analysisGroups}
          activeTab={activeTab}
          onAnalysisClick={onAnalysisClick}
          onGroupClick={handleGroupClick}
          onRefreshAnalyses={onRefreshAnalyses}
        />
        
        {showRequirementsPanel && (
          <RequirementsPanel>
            <PanelHeader>
              <PanelTitle>Requirements & Specifications</PanelTitle>
              <CloseButton onClick={() => setShowRequirementsPanel(false)}>
                ×
              </CloseButton>
            </PanelHeader>
            
            <PanelContent>
              {requirements.map((req, index) => (
                <RequirementItem key={req.id} $status={req.status}>
                  <RequirementHeader>
                    <RequirementName>{req.name}</RequirementName>
                    <RequirementStatus $status={req.status}>
                      {req.status || 'pending'}
                    </RequirementStatus>
                  </RequirementHeader>
                  
                  <RequirementDetails>
                    <DetailRow>
                      <DetailLabel>Target:</DetailLabel>
                      <DetailValue>
                        {req.comparator} {req.targetValue} {req.unit}
                      </DetailValue>
                    </DetailRow>
                    
                    {req.currentValue !== undefined && (
                      <DetailRow>
                        <DetailLabel>Current:</DetailLabel>
                        <DetailValue $isGood={req.status === 'pass'}>
                          {req.currentValue} {req.unit}
                        </DetailValue>
                      </DetailRow>
                    )}
                    
                    <DetailRow>
                      <DetailLabel>Category:</DetailLabel>
                      <CategoryBadge $category={req.category}>
                        {req.category}
                      </CategoryBadge>
                    </DetailRow>
                    
                    <DetailRow>
                      <DetailLabel>Priority:</DetailLabel>
                      <PriorityBadge $priority={req.priority}>
                        {req.priority}
                      </PriorityBadge>
                    </DetailRow>
                  </RequirementDetails>
                  
                  {req.description && (
                    <RequirementDescription>
                      {req.description}
                    </RequirementDescription>
                  )}
                </RequirementItem>
              ))}
            </PanelContent>
          </RequirementsPanel>
        )}
      </ContentContainer>
    </FlowContainer>
  );
};

// Styled Components
const FlowContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const RequirementsPanel = styled.div`
  width: 320px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-bg);
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

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

const RequirementItem = styled.div<{ $status?: string }>`
  background: var(--bg-tertiary);
  border: 1px solid ${props => {
    switch(props.$status) {
      case 'pass': return 'var(--success)';
      case 'fail': return 'var(--error)';
      default: return 'var(--border-outline)';
    }
  }};
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RequirementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const RequirementName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const RequirementStatus = styled.div<{ $status?: string }>`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${props => {
    switch(props.$status) {
      case 'pass': return 'rgba(var(--success-rgb), 0.1)';
      case 'fail': return 'rgba(var(--error-rgb), 0.1)';
      default: return 'var(--bg-secondary)';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'pass': return 'var(--success)';
      case 'fail': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  }};
`;

const RequirementDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
`;

const DetailLabel = styled.span`
  color: var(--text-muted);
  font-weight: 500;
  min-width: 60px;
`;

const DetailValue = styled.span<{ $isGood?: boolean }>`
  color: ${props => props.$isGood ? 'var(--success)' : 'var(--text-primary)'};
  font-weight: 600;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: capitalize;
  background: var(--bg-secondary);
  color: var(--primary-alternate);
  border: 1px solid var(--border-outline);
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: capitalize;
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

const RequirementDescription = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  padding-top: 8px;
  border-top: 1px solid var(--border-bg);
`;