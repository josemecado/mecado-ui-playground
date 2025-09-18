import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  Box,
  Minus,
  Square,
  ArrowRight,
  Link2,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  X,
  Info,
} from "lucide-react";

interface MockUnmappedData {
  oldGeometry: {
    bodies: number;
    faces: number;
    edges: number;
  };
  newGeometry: {
    bodies: number;
    faces: number;
    edges: number;
  };
}

type EntityKind = "body" | "face" | "edge";
type SelectionState =
  | "EMPTY"
  | "LEFT_SINGLE"
  | "LEFT_MANY"
  | "RIGHT_SINGLE"
  | "RIGHT_MANY"
  | "LEFT_TO_RIGHT";

interface SelectionData {
  left: number;
  right: number;
}

export const GeometryLinkingWireframe: React.FC = () => {
  // Mock data - in real component this comes from URL params
  const projectID = "proj_123";
  const oldVersion = 1;
  const newVersion = 2;

  // Core state
  const [currentMode, setCurrentMode] = useState<EntityKind>("body");
  const [selections, setSelections] = useState<SelectionData>({
    left: 0,
    right: 0,
  });
  const [linkedCount, setLinkedCount] = useState(0);
  const [markedDeleted, setMarkedDeleted] = useState(0);
  const [markedNew, setMarkedNew] = useState(0);

  // Mock unmapped data
  const unmappedData: MockUnmappedData = {
    oldGeometry: {
      bodies: 8,
      faces: 156,
      edges: 342,
    },
    newGeometry: {
      bodies: 12,
      faces: 189,
      edges: 398,
    },
  };

  // Calculate totals and progress
  const totalOriginal =
    Object.values(unmappedData.oldGeometry).reduce((a, b) => a + b, 0) +
    Object.values(unmappedData.newGeometry).reduce((a, b) => a + b, 0);
  const totalProcessed = linkedCount + markedDeleted + markedNew;
  const progressPercent =
    totalOriginal > 0 ? (totalProcessed / totalOriginal) * 100 : 0;

  const getSelectionState = useCallback((): SelectionState => {
    const leftCount = selections.left;
    const rightCount = selections.right;

    if (leftCount === 0 && rightCount === 0) return "EMPTY";
    if (leftCount === 1 && rightCount === 0) return "LEFT_SINGLE";
    if (leftCount > 1 && rightCount === 0) return "LEFT_MANY";
    if (leftCount === 0 && rightCount === 1) return "RIGHT_SINGLE";
    if (leftCount === 0 && rightCount > 1) return "RIGHT_MANY";
    if (leftCount > 0 && rightCount > 0) return "LEFT_TO_RIGHT";
    return "EMPTY";
  }, [selections]);

  const selectionState = getSelectionState();
  const canMarkDeleted =
    selectionState === "LEFT_SINGLE" || selectionState === "LEFT_MANY";
  const canMarkNew =
    selectionState === "RIGHT_SINGLE" || selectionState === "RIGHT_MANY";
  const canLink = selectionState === "LEFT_TO_RIGHT";

  const handleModeChange = useCallback((newMode: EntityKind) => {
    setCurrentMode(newMode);
    setSelections({ left: 0, right: 0 });
  }, []);

  const handleLeftSelect = useCallback(() => {
    setSelections((prev) => ({
      ...prev,
      left: prev.left === 0 ? 1 : prev.left + 1,
    }));
  }, []);

  const handleRightSelect = useCallback(() => {
    setSelections((prev) => ({
      ...prev,
      right: prev.right === 0 ? 1 : prev.right + 1,
    }));
  }, []);

  const handleClear = useCallback(() => {
    setSelections({ left: 0, right: 0 });
  }, []);

  const handleMarkDeleted = useCallback(() => {
    setMarkedDeleted((prev) => prev + selections.left);
    setSelections({ left: 0, right: 0 });
  }, [selections.left]);

  const handleMarkNew = useCallback(() => {
    setMarkedNew((prev) => prev + selections.right);
    setSelections({ left: 0, right: 0 });
  }, [selections.right]);

  const handleLink = useCallback(() => {
    setLinkedCount((prev) => prev + selections.left + selections.right);
    setSelections({ left: 0, right: 0 });
  }, [selections]);

  const getModeIcon = (mode: EntityKind) => {
    switch (mode) {
      case "body":
        return <Box size={16} />;
      case "face":
        return <Square size={16} />;
      case "edge":
        return <Minus size={16} />;
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Geometry Analysis Transfer</HeaderTitle>
      </Header>
      <MainContent>
        {/* Left Viewer */}
        <ViewerSection>
          <ViewerHeader>
            <ViewerTitle>Source Geometry (v{oldVersion})</ViewerTitle>
            <ViewerSubtitle>Contains existing FEA setup</ViewerSubtitle>
          </ViewerHeader>
          <MockViewer onClick={handleLeftSelect} selected={selections.left > 0}>
            <ViewerPlaceholder>
              <ViewerIcon>
                <Box size={48} />
              </ViewerIcon>
              <ViewerText>3D Geometry Viewer</ViewerText>
              <ViewerSubtext>
                Original geometry with analysis setup
              </ViewerSubtext>
              {selections.left > 0 && (
                <SelectionBadge left>{selections.left} selected</SelectionBadge>
              )}
            </ViewerPlaceholder>
          </MockViewer>
          <ViewerStats>
            <StatItem>
              <StatNumber unmapped>
                {unmappedData.oldGeometry.bodies}
              </StatNumber>
              <StatLabel>Bodies</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber unmapped>{unmappedData.oldGeometry.faces}</StatNumber>
              <StatLabel>Faces</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber unmapped>{unmappedData.oldGeometry.edges}</StatNumber>
              <StatLabel>Edges</StatLabel>
            </StatItem>
          </ViewerStats>
        </ViewerSection>

        {/* Center Control Panel */}
        <ControlPanel>
          <ControlPanelUpper>

            
            <ModeSection>
              <ModeTitle>Selection Mode</ModeTitle>
              <ModeButtons>
                {(["body", "face", "edge"] as EntityKind[]).map((mode) => (
                  <ModeButton
                    key={mode}
                    active={currentMode === mode}
                    onClick={() => handleModeChange(mode)}
                  >
                    {getModeIcon(mode)}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </ModeButton>
                ))}
              </ModeButtons>
            </ModeSection>
            <ProgressSection>
              <ProgressHeader>
                <ProgressTitle>Transfer Progress (v{oldVersion} → v{newVersion})</ProgressTitle>
                <ProgressPercent>
                  {Math.round(progressPercent)}%
                </ProgressPercent>
              </ProgressHeader>
              <ProgressBar>
                <ProgressFill style={{ width: `${progressPercent}%` }} />
              </ProgressBar>
              <ProgressStats>
                <ProgressStat>
                  <ProgressStatNumber>{totalProcessed}</ProgressStatNumber>
                  <ProgressStatLabel>Processed</ProgressStatLabel>
                </ProgressStat>
                <ProgressStat>
                  <ProgressStatNumber>
                    {totalOriginal - totalProcessed}
                  </ProgressStatNumber>
                  <ProgressStatLabel>Remaining</ProgressStatLabel>
                </ProgressStat>
              </ProgressStats>
            </ProgressSection>

            <ActionsSection>
              <ActionButton
                disabled={!canMarkDeleted}
                onClick={handleMarkDeleted}
                variant="danger"
              >
                <Trash2 size={16} />
                Mark Deleted
              </ActionButton>

              <ActionButton
                disabled={!canLink}
                onClick={handleLink}
                variant="primary"
              >
                <Link2 size={16} />
                Link Elements
              </ActionButton>

              <ActionButton
                disabled={!canMarkNew}
                onClick={handleMarkNew}
                variant="success"
              >
                <Plus size={16} />
                Mark New
              </ActionButton>

              <ActionButton onClick={handleClear} variant="secondary">
                <RotateCcw size={16} />
                Clear Selection
              </ActionButton>
            </ActionsSection>
          </ControlPanelUpper>
          <ControlPanelLower>
            <SummarySection>
              <SummaryTitle>Transfer Summary</SummaryTitle>
              <SummaryStats>
                <SummaryStat>
                  <SummaryStatIcon linked>
                    <Link2 size={14} />
                  </SummaryStatIcon>
                  <SummaryStatNumber>{linkedCount}</SummaryStatNumber>
                  <SummaryStatLabel>Linked</SummaryStatLabel>
                </SummaryStat>
                <SummaryStat>
                  <SummaryStatIcon deleted>
                    <Trash2 size={14} />
                  </SummaryStatIcon>
                  <SummaryStatNumber>{markedDeleted}</SummaryStatNumber>
                  <SummaryStatLabel>Deleted</SummaryStatLabel>
                </SummaryStat>
                <SummaryStat>
                  <SummaryStatIcon new>
                    <Plus size={14} />
                  </SummaryStatIcon>
                  <SummaryStatNumber>{markedNew}</SummaryStatNumber>
                  <SummaryStatLabel>New</SummaryStatLabel>
                </SummaryStat>
              </SummaryStats>
            </SummarySection>

            <FinishSection>
              <FinishButton disabled={progressPercent < 100}>
                <Check size={16} />
                Complete Transfer
              </FinishButton>
            </FinishSection>
          </ControlPanelLower>
        </ControlPanel>

        {/* Right Viewer */}
        <ViewerSection>
          <ViewerHeader>
            <ViewerTitle>Target Geometry (v{newVersion})</ViewerTitle>
            <ViewerSubtitle>Will receive transferred setup</ViewerSubtitle>
          </ViewerHeader>
          <MockViewer
            onClick={handleRightSelect}
            selected={selections.right > 0}
          >
            <ViewerPlaceholder>
              <ViewerIcon>
                <Box size={48} />
              </ViewerIcon>
              <ViewerText>3D Geometry Viewer</ViewerText>
              <ViewerSubtext>Modified geometry for analysis</ViewerSubtext>
              {selections.right > 0 && (
                <SelectionBadge right>
                  {selections.right} selected
                </SelectionBadge>
              )}
            </ViewerPlaceholder>
          </MockViewer>
          <ViewerStats>
            <StatItem>
              <StatNumber unmapped>
                {unmappedData.newGeometry.bodies}
              </StatNumber>
              <StatLabel>Bodies</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber unmapped>{unmappedData.newGeometry.faces}</StatNumber>
              <StatLabel>Faces</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber unmapped>{unmappedData.newGeometry.edges}</StatNumber>
              <StatLabel>Edges</StatLabel>
            </StatItem>
          </ViewerStats>
        </ViewerSection>
      </MainContent>
      <StatusBar>
        <StatusItem>
          <Info size={14} />
          Select elements to link, mark as deleted, or mark as new
        </StatusItem>
        <StatusItem>
          Current: {currentMode} mode | Selected: {selections.left} left,{" "}
          {selections.right} right
        </StatusItem>
      </StatusBar>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  color: var(--text-primary);
`;

const Header = styled.div`
display: flex;
justify-content: space-between;
  padding: 16px 16px 16px 12px;
  
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-bg);
  text-align: center;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  color: var(--text-muted);
  font-size: 16px;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
`;

const ViewerSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
`;

const ViewerHeader = styled.div`
  padding: 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
`;

const ViewerTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
`;

const ViewerSubtitle = styled.p`
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
`;

const MockViewer = styled.div<{ selected?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 2px solid
    ${(props) => (props.selected ? "var(--primary-action)" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-action);
  }
`;

const ViewerPlaceholder = styled.div`
  text-align: center;
  color: var(--text-muted);
`;

const ViewerIcon = styled.div`
  margin-bottom: 16px;
  opacity: 0.5;
`;

const ViewerText = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const ViewerSubtext = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

const SelectionBadge = styled.div<{ left?: boolean; right?: boolean }>`
  position: absolute;
  top: 16px;
  ${(props) => (props.left ? "left: 16px;" : "right: 16px;")}
  background: ${(props) =>
    props.left ? "var(--error-bg)" : "var(--success-bg)"};
  color: ${(props) =>
    props.left ? "var(--error-text)" : "var(--success-text)"};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const ViewerStats = styled.div`
  display: flex;
  padding: 16px;
  background: var(--bg-tertiary);
  gap: 24px;
  justify-content: center;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div<{ unmapped?: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) =>
    props.unmapped ? "var(--error-text)" : "var(--text-primary)"};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-bg);
  border-right: 1px solid var(--border-bg);
  padding: 16px;
  overflow-y: auto;
`;

const ProgressSection = styled.div`
background-color: var(--bg-secondary);

`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const ProgressPercent = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-action);
`;

const ProgressBar = styled.div`
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-action),
    var(--primary-action-hover)
  );
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  gap: 16px;
`;

const ProgressStat = styled.div`
  text-align: center;
  flex: 1;
`;

const ProgressStatNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ProgressStatLabel = styled.div`
  font-size: 12px;
  color: var(--text-muted);
`;

const ModeSection = styled.div``;

const ModeTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const ModeButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ModeButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  background: ${(props) =>
    props.active ? "var(--primary-action)" : "var(--bg-tertiary)"};
  color: ${(props) => (props.active ? "white" : "var(--text-primary)")};
  border: 1px solid
    ${(props) => (props.active ? "var(--primary-action)" : "var(--border-bg)")};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${(props) =>
      props.active ? "var(--primary-action-hover)" : "var(--hover-bg)"};
  }
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActionButton = styled.button<{
  variant?: "primary" | "secondary" | "danger" | "success";
}>`
  padding: 12px 16px;
  background: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--primary-action)";
      case "danger":
        return "var(--error-bg)";
      case "success":
        return "var(--success-bg)";
      default:
        return "var(--bg-tertiary)";
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "white";
      case "danger":
        return "var(--error-text)";
      case "success":
        return "var(--success-text)";
      default:
        return "var(--text-primary)";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.variant) {
        case "primary":
          return "var(--primary-action)";
        case "danger":
          return "var(--error-border)";
        case "success":
          return "var(--success-border)";
        default:
          return "var(--border-bg)";
      }
    }};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SummarySection = styled.div``;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
`;

const SummaryStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryStat = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg-tertiary);
  border-radius: 6px;
`;

const SummaryStatIcon = styled.div<{
  linked?: boolean;
  deleted?: boolean;
  new?: boolean;
}>`
  color: ${(props) => {
    if (props.linked) return "var(--primary-action)";
    if (props.deleted) return "var(--error-text)";
    if (props.new) return "var(--success-text)";
    return "var(--text-muted)";
  }};
`;

const SummaryStatNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  min-width: 24px;
`;

const SummaryStatLabel = styled.div`
  font-size: 14px;
  color: var(--text-muted);
`;

const FinishSection = styled.div``;

const FinishButton = styled.button`
  width: 100%;
  padding: 16px;
  background: var(--success-bg);
  color: var(--success-text);
  border: 1px solid var(--success-border);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: var(--success-hover);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-bg);
  font-size: 14px;
  color: var(--text-muted);
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Control Panel
const ControlPanelUpper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ControlPanelLower = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
`;
