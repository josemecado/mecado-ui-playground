import React, { useState } from "react";
import styled from "styled-components";
import { Box, Minus, Square, Link2, PieChart } from "lucide-react";

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

export const ControlPanel: React.FC = () => {
  const [linkedCount, setLinkedCount] = useState(0);
  const [markedDeleted, setMarkedDeleted] = useState(0);
  const [markedNew, setMarkedNew] = useState(0);

  //Mock Data
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

  const totalOriginal =
    Object.values(unmappedData.oldGeometry).reduce((a, b) => a + b, 0) +
    Object.values(unmappedData.newGeometry).reduce((a, b) => a + b, 0);
  const totalProcessed = linkedCount + markedDeleted + markedNew;
  const progressPercent =
    totalOriginal > 0 ? (totalProcessed / totalOriginal) * 100 : 0;

  // Chart data for overview
  const chartData = {
    linked: linkedCount,
    deleted: markedDeleted,
    new: markedNew,
    remaining: totalOriginal - totalProcessed,
  };

  return (
    <Container>
      <ControlPanelUpper>
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
        <ActionButton onClick={() => {}} variant="primary" size="large">
          <Link2 size={16} />
          Link Selected Elements
        </ActionButton>
      </ControlPanelUpper>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  background: var(--bg-secondary);
  padding: 16px;
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

const ControlPanelUpper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;
