import React, { useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  Box,
  Minus,
  Square,
  Link2,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  Info,
  PieChart,
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

  // Separate mode state for each viewer
  const [leftMode, setLeftMode] = useState<EntityKind>("body");
  const [rightMode, setRightMode] = useState<EntityKind>("body");

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

  // Chart data for overview
  const chartData = {
    linked: linkedCount,
    deleted: markedDeleted,
    new: markedNew,
    remaining: totalOriginal - totalProcessed,
  };

  return (
    <Container>
      <MainContent>
        {/* Left Viewer */}
        <ViewerSection>
          <ViewerHeader>
            <ViewerTitleSection>
              <ViewerTitle>Source Geometry (v{oldVersion})</ViewerTitle>
              <ViewerSubtitle>Contains existing FEA setup</ViewerSubtitle>
            </ViewerTitleSection>
          </ViewerHeader>
          <MockViewer onClick={handleLeftSelect} selected={selections.left > 0}>
            <ViewerModeSelector>
              {(["body", "face", "edge"] as EntityKind[]).map((mode) => (
                <ModeButton
                  key={mode}
                  active={leftMode === mode}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLeftMode(mode);
                  }}
                >
                  {getModeIcon(mode)}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </ModeButton>
              ))}
            </ViewerModeSelector>
            <ViewerPlaceholder>
              <ViewerIcon>
                <Box size={48} />
              </ViewerIcon>
              <ViewerText>3D Geometry Viewer</ViewerText>
              <ViewerSubtext>
                Original geometry with analysis setup
              </ViewerSubtext>
              {selections.left > 0 && (
                <SelectionBadge left>{selections.left} Selected</SelectionBadge>
              )}
            </ViewerPlaceholder>

            <GeometryActionButtons>
              {/* Left-specific actions */}
              <ViewerActions>
                <ActionButton
                  disabled={!canMarkNew}
                  onClick={handleMarkNew}
                  variant="success"
                  size="small"
                >
                  <Plus size={16} />
                  Mark New
                </ActionButton>
                <ActionButton
                  disabled={!canMarkDeleted}
                  onClick={handleMarkDeleted}
                  variant="danger"
                  size="small"
                >
                  <Trash2 size={16} />
                  Mark Deleted
                </ActionButton>
                <ActionButton
                  onClick={handleClear}
                  variant="secondary"
                  size="small"
                >
                  <RotateCcw size={16} />
                  Clear
                </ActionButton>
              </ViewerActions>
            </GeometryActionButtons>
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
            <ProgressSection>
              <ProgressHeader>
                <ProgressTitle>Transfer Progress</ProgressTitle>
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
            {/* Overview Chart */}
            <ChartSection>
              <ChartHeader>
                <ChartTitle>
                  <PieChart size={16} />
                  Transfer Overview
                </ChartTitle>
              </ChartHeader>
              <ChartContainer>
                <DonutChart>
                  <DonutCenter>
                    <DonutCenterNumber>
                      {Math.round(progressPercent)}%
                    </DonutCenterNumber>
                    <DonutCenterLabel>Complete</DonutCenterLabel>
                  </DonutCenter>
                  {/* Mock donut chart visualization */}
                  <DonutSegment
                    percentage={progressPercent}
                    color="var(--primary-action)"
                  />
                </DonutChart>
                <ChartLegend>
                  <LegendItem>
                    <LegendDot color="var(--primary-action)" />
                    <LegendLabel>Linked: {chartData.linked}</LegendLabel>
                  </LegendItem>
                  <LegendItem>
                    <LegendDot color="var(--error)" />
                    <LegendLabel>Deleted: {chartData.deleted}</LegendLabel>
                  </LegendItem>
                  <LegendItem>
                    <LegendDot color="var(--accent-primary)" />
                    <LegendLabel>New: {chartData.new}</LegendLabel>
                  </LegendItem>
                  <LegendItem>
                    <LegendDot color="var(--text-muted)" />
                    <LegendLabel>Remaining: {chartData.remaining}</LegendLabel>
                  </LegendItem>
                </ChartLegend>
              </ChartContainer>
            </ChartSection>

            {/* Central linking actions */}
            <ActionButton
              disabled={!canLink}
              onClick={handleLink}
              variant="primary"
              size="large"
            >
              <Link2 size={16} />
              Link Selected Elements
            </ActionButton>
          </ControlPanelUpper>

          <ControlPanelLower>
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
            <ViewerTitleSection>
              <ViewerTitle>Target Geometry (v{newVersion})</ViewerTitle>
              <ViewerSubtitle>Will receive transferred setup</ViewerSubtitle>
            </ViewerTitleSection>
          </ViewerHeader>
          <MockViewer
            onClick={handleRightSelect}
            selected={selections.right > 0}
          >
            <ViewerModeSelector>
              {(["body", "face", "edge"] as EntityKind[]).map((mode) => (
                <ModeButton
                  key={mode}
                  active={rightMode === mode}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRightMode(mode);
                  }}
                >
                  {getModeIcon(mode)}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </ModeButton>
              ))}
            </ViewerModeSelector>
            <ViewerPlaceholder>
              <ViewerIcon>
                <Box size={48} />
              </ViewerIcon>
              <ViewerText>3D Geometry Viewer</ViewerText>
              <ViewerSubtext>Modified geometry for analysis</ViewerSubtext>
              {selections.right > 0 && (
                <SelectionBadge right>
                  {selections.right} Selected
                </SelectionBadge>
              )}
            </ViewerPlaceholder>

            <GeometryActionButtons>
              {/* Right-specific actions */}
              <ViewerActions>
                <ActionButton
                  disabled={!canMarkNew}
                  onClick={handleMarkNew}
                  variant="success"
                  size="small"
                >
                  <Plus size={16} />
                  Mark New
                </ActionButton>

                <ActionButton
                  disabled={!canMarkDeleted}
                  onClick={handleMarkDeleted}
                  variant="danger"
                  size="small"
                >
                  <Trash2 size={16} />
                  Mark Deleted
                </ActionButton>
                <ActionButton
                  onClick={handleClear}
                  variant="secondary"
                  size="small"
                >
                  <RotateCcw size={16} />
                  Clear
                </ActionButton>
              </ViewerActions>
            </GeometryActionButtons>
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
          Left: {leftMode} mode, {selections.left} selected | Right: {rightMode}{" "}
          mode, {selections.right} selected
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
  font-size: 22px;
  font-weight: 600;
  text-align: center;
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
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-bg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ViewerTitleSection = styled.div`
  flex: 1;
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

const ModeButton = styled.button<{ active?: boolean }>`
  padding: 6px 10px;
  background: ${(props) =>
    props.active ? "var(--primary-action)" : "var(--bg-tertiary)"};
  color: ${(props) => (props.active ? "white" : "var(--text-primary)")};
  border: 1px solid
    ${(props) => (props.active ? "var(--primary-action)" : "var(--border-bg)")};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${(props) =>
      props.active ? "var(--primary-action)" : "var(--hover-bg)"};
    opacity: 0.7;
  }
`;

const MockViewer = styled.div<{ selected?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 2px solid
    ${(props) => (props.selected ? "var(--primary-action)" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
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
  right: 16px;
  background: ${(props) =>
    props.left ? "var(--accent-primary)" : "var(--accent-primary)"};
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const ViewerActions = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-bg);
`;

const ViewerStats = styled.div`
  display: flex;
  padding: 16px;
  background: var(--bg-secondary);
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
    props.unmapped ? "var(--error)" : "var(--text-primary)"};
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

const ControlPanelUpper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const ControlPanelLower = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
  gap: 16px;
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
  font-size: 18px;
  font-weight: 600;
`;

const ProgressPercent = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
`;

const ProgressBar = styled.div`
  height: 8px;
  background: var(--text-muted);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-action),
    var(--accent-primary)
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

// New chart components
const ChartSection = styled.div`
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 16px;
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;
`;

const ChartTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const DonutChart = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary-action) 0deg,
    var(--primary-action) calc(var(--percentage, 0) * 3.6deg),
    var(--bg-primary) calc(var(--percentage, 0) * 3.6deg),
    var(--bg-primary) 360deg
  );
`;

const DonutCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const DonutCenterNumber = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const DonutCenterLabel = styled.div`
  font-size: 8px;
  color: var(--text-muted);
`;

const DonutSegment = styled.div<{ percentage: number; color: string }>`
  display: none; /* Just for type safety - actual styling handled by conic-gradient */
`;

const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
`;

const LegendLabel = styled.div`
  font-size: 12px;
  color: var(--text-primary);
`;

const LinkingSection = styled.div`
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 16px;
  border: 2px solid var(--primary-action);
`;

const LinkingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--primary-action);
`;

const LinkingDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
`;

const LinkingHint = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  border: 1px solid var(--border-bg);
`;

const SectionTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ActionButton = styled.button<{
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "large";
}>`
  padding: 8px;
  background: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--primary-alternate)";
      case "danger":
        return "var(--error)";
      case "success":
        return "var(--accent-primary)";
      default:
        return "var(--bg-tertiary)";
    }
  }};
  color: ${(props) => {
    switch (props.variant) {
      case "primary":
        return "var(--text-inverted)";
      case "danger":
        return "white";
      case "success":
        return "white";
      default:
        return "white";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.variant) {
        case "primary":
          return "var(--primary-action)";
        case "danger":
          return "var(--error)";
        case "success":
          return "var(--accent-primary)";
        default:
          return "var(--border-bg)";
      }
    }};
  border-radius: 8px;
  font-size: ${(props) => (props.size === "large" ? "15px" : "13px")};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 3px;
  justify-content: center;
  width: ${(props) => (props.size === "large" ? "100%" : "auto")};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:hover:disabled {
    cursor: not-allowed;
    opacity: 0.7;

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
    if (props.deleted) return "var(--error)";
    if (props.new) return "var(--accent-primary)";
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
  background: var(--accent-primary);
  color: var(--text-inverted);
  border: 1px solid var(--accent-primary);
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
    background: var(--hover-primary);
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

const ViewerModeSelector = styled.div`
  display: flex;
  justify-content: space-around;
  gap: 12px;

  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  padding: 4px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const GeometryActionButtons = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`;
