import React from "react";
import styled from "styled-components";
import { Box, FileText, FolderOpen, Calculator } from "lucide-react";

/**
 * Pure UI replica of your VersionNode using styled-components only.
 * - No React Flow / @xyflow/react dependencies
 * - Handles are visual only (absolute-positioned dots)
 * - Safe to tweak styles here and then copy/paste back into your app
 *
 * Tip: Adjust the CSS variables in <GlobalVars /> to quickly theme the node.
 */

// ===================== TYPES (minimal, UI-only) =====================
type MetricType = "mass" | "margin_of_safety" | "other";

type Metric = {
  title: string;
  value: string | number;
  unit?: string;
  type: MetricType;
};

type ProjectVersion = {
  id: string;
  title: string;
  parentVersion?: string;
  metrics: Metric[];
  geometries: unknown[];
  pinnedEquations: unknown[];
  uploadedFiles: unknown[];
  generatedFiles: unknown[];
};

// ===================== STYLED COMPONENTS =====================
const NodeContainer = styled.div<{ $selected?: boolean }>`
  position: relative;
  border: 2px solid
    ${(p) => (p.$selected ? "var(--primary-action)" : "var(--border-bg)")};
  border-radius: 12px;
  width: 500px;
  height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s ease;
  background: var(--bg-secondary);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

const NodeHeader = styled.div`
  padding: 10px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const NodeTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
`;

const NodeSubtitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SidePanel = styled.div`
  flex: 1;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-bg);
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--accent-neutral);
    border-radius: 2px;
  }
`;

const MetricSection = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--border-outline);
`;

const MetricTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div<{
  $type: "mass" | "margin_of_safety" | "other";
}>`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) =>
    p.$type === "mass"
      ? "#6366f1"
      : p.$type === "margin_of_safety"
      ? "#22c55e"
      : "var(--text-primary)"};
`;

const MetricUnit = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 4px;
`;

const CanvasArea = styled.div`
  flex: 2;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  overflow: auto;
`;

const CanvasPlaceholder = styled.div`
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.3;
  }
`;

const NodeFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-bg);
  padding: 8px 12px;
  overflow-x: auto;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
`;

const FooterIcon = styled.span`
  color: var(--text-primary);
  display: flex;
  align-items: center;
  svg {
    width: 15px;
    height: 16px;
  }
`;

const FooterValue = styled.div`
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`;

const NoMetricsMessage = styled.div`
  padding: 16px;
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
`;

// Visual-only handles to mimic React Flow handles
const HandleDot = styled.div<{
  $pos: "top" | "right" | "bottom" | "left";
  $neutral?: boolean;
}>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${(p) =>
    p.$neutral ? "var(--accent-neutral)" : "var(--accent-primary)"};
  border: 2px solid var(--bg-primary);
  border-radius: 50%;
  opacity: ${(p) => (p.$neutral ? 0.5 : 1)};
  ${(p) =>
    p.$pos === "top"
      ? "top: -6px; left: 50%; transform: translateX(-50%);"
      : p.$pos === "right"
      ? "right: -6px; top: 50%; transform: translateY(-50%);"
      : p.$pos === "bottom"
      ? "bottom: -6px; left: 50%; transform: translateX(-50%);"
      : "left: -6px; top: 50%; transform: translateY(-50%);"}
`;

// ===================== HELPERS =====================
const formatMetricValue = (
  metric: Metric
): { value: string; unit?: string } => ({
  value: String(metric.value),
  unit: metric.unit,
});

// ===================== UI COMPONENT =====================
const VersionNodeUI: React.FC<{ data: ProjectVersion; selected?: boolean }> = ({
  data,
  selected,
}) => {
  return (
    <NodeContainer $selected={selected}>
      {/* Visual-only handles */}
      <HandleDot $pos="top" />
      <HandleDot $pos="left" $neutral />
      <HandleDot $pos="right" $neutral />

      <NodeHeader className="node-header-drag">
        <NodeTitle>{data.id.toUpperCase()}</NodeTitle>
        {data.parentVersion && (
          <HeaderGroup>
            <NodeSubtitle>↑ Parent ID: </NodeSubtitle>
            <FooterValue>{data.parentVersion.toUpperCase()}</FooterValue>
          </HeaderGroup>
        )}
      </NodeHeader>

      <ContentContainer>
        <SidePanel>
          {data.metrics && data.metrics.length > 0 ? (
            data.metrics.map((metric, idx) => {
              const formatted = formatMetricValue(metric);
              return (
                <MetricSection key={idx}>
                  <MetricTitle>{metric.title}</MetricTitle>
                  <MetricValue $type={(metric.type as any) || "other"}>
                    {formatted.value}
                    {formatted.unit && (
                      <MetricUnit>{formatted.unit}</MetricUnit>
                    )}
                  </MetricValue>
                </MetricSection>
              );
            })
          ) : (
            <NoMetricsMessage>No metrics available</NoMetricsMessage>
          )}
        </SidePanel>

        <CanvasArea>
          <CanvasPlaceholder>
            <Box />
            <div>Geometry View</div>
            <div style={{ fontSize: "11px", opacity: 0.7 }}>
              {data.geometries.length > 0
                ? `${data.geometries.length} geometries available`
                : "No geometry loaded"}
            </div>
          </CanvasPlaceholder>
        </CanvasArea>
      </ContentContainer>

      <NodeFooter>
        <FooterItem>
          <FooterIcon>
            <Box />
          </FooterIcon>
          <FooterValue>{data.geometries.length}</FooterValue>
        </FooterItem>

        <FooterItem>
          <FooterIcon>
            <Calculator />
          </FooterIcon>
          <FooterValue>{data.pinnedEquations.length}</FooterValue>
        </FooterItem>

        <FooterItem>
          <FooterIcon>
            <FolderOpen />
          </FooterIcon>
          <FooterValue>{data.uploadedFiles.length}</FooterValue>
        </FooterItem>

        <FooterItem>
          <FooterIcon>
            <FileText />
          </FooterIcon>
          <FooterValue>{data.generatedFiles.length}</FooterValue>
        </FooterItem>
      </NodeFooter>

      <HandleDot $pos="bottom" />
    </NodeContainer>
  );
};

// ===================== DEMO WRAPPER =====================
const DemoFrame = styled.div`
  min-height: 100dvh;
  width: 100%;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const DemoStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const Label = styled.div`
  font-size: 12px;
  color: var(--text-muted);
`;

// Mock data (edit freely)
const mockVersion: ProjectVersion = {
  id: "v3",
  title: "Rotor Model - Baseline",
  parentVersion: "v2",
  metrics: [
    { title: "Mass", value: 12.4, unit: "kg", type: "mass" },
    {
      title: "Margin of Safety",
      value: 1.8,
      unit: "x",
      type: "margin_of_safety",
    },
  ],
  geometries: [1, 2, 3, 4],
  pinnedEquations: [1, 2],
  uploadedFiles: [1, 2, 3],
  generatedFiles: [1],
};

const mockVersionAlt: ProjectVersion = {
  id: "v4",
  title: "Rotor Model",
  parentVersion: undefined,
  metrics: [],
  geometries: [],
  pinnedEquations: [],
  uploadedFiles: [],
  generatedFiles: [],
};

export default function App() {
  return (
    <>
      <DemoFrame>
        <DemoStack>
          <Card>
            <Label>Selected</Label>
            <VersionNodeUI data={mockVersion} selected />
          </Card>
          <Card>
            <Label>Unselected / No Metrics</Label>
            <VersionNodeUI data={mockVersionAlt} />
          </Card>
        </DemoStack>
      </DemoFrame>
    </>
  );
}
