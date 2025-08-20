// LevelArchitectureVisualizer.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";

// Styled components
const LevelNodeContainer = styled.div<{ $level: number }>`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  color: black;
  border: 2px solid
    ${(props) => {
      const colors = [
        "#667eea", // Level 1 - Core
        "#f72585", // Level 2 - Data
        "#724cf9", // Level 3 - VTK
        "#3da35d", // Level 4 - Selection
        "#ff8500", // Level 5 - Bridge
        "#30cfd0", // Level 6 - Mode
        "#ffd700", // Level 7 - UI
      ];
      return colors[props.$level - 1] || colors[6];
    }};

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  color: black;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const LevelHeader = styled.div<{ $level: number }>`
  background: ${(props) => {
    const colors = [
      "#667eea", // Level 1 - Core
      "#f72585", // Level 2 - Data
      "#724cf9", // Level 3 - VTK
      "#3da35d", // Level 4 - Selection
      "#ff8500", // Level 5 - Bridge
      "#30cfd0", // Level 6 - Mode
      "#ffd700", // Level 7 - UI
    ];
    return colors[props.$level - 1] || colors[6];
  }};
  padding: 4px 12px;
  color: white;
  position: relative;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const LevelTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const LevelSubtitle = styled.div`
  font-size: 13px;
  opacity: 0.95;
`;

const ExpandIcon = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.2);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LevelBody = styled.div`
  padding: 16px 20px;
`;

const HooksList = styled.div`
  border-radius: 8px;
`;

const HookItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  font-weight: 500;
  color: #333;

  &:before {
    content: "→";
    margin-right: 8px;
    color: #666;
  }
`;

const LifecycleSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5cc 100%);
  border-radius: 8px;
  border: 1px solid #ffd700;
`;

const LifecycleTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;

  &:before {
    content: "⚡";
    margin-right: 8px;
  }
`;

const LifecycleItem = styled.div<{ $type?: "trigger" | "effect" | "stable" }>`
  font-size: 12px;
  padding: 8px 12px;
  margin: 6px 0;
  border-radius: 6px;
  background: ${(props) => {
    switch (props.$type) {
      case "trigger":
        return "#ffe6e6";
      case "effect":
        return "#e6f3ff";
      case "stable":
        return "#e6ffe6";
      default:
        return "#f0f0f0";
    }
  }};
  border-left: 3px solid
    ${(props) => {
      switch (props.$type) {
        case "trigger":
          return "#ff4444";
        case "effect":
          return "#4444ff";
        case "stable":
          return "#44ff44";
        default:
          return "#888";
      }
    }};
`;

const StatBadge = styled.span<{ $type: "refs" | "state" | "memo" }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-right: 8px;
  background: ${(props) => {
    switch (props.$type) {
      case "refs":
        return "#e3f2fd";
      case "state":
        return "#fce4ec";
      case "memo":
        return "#fff9c4";
      default:
        return "#f0f0f0";
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case "refs":
        return "#1976d2";
      case "state":
        return "#c2185b";
      case "memo":
        return "#f57c00";
      default:
        return "#666";
    }
  }};
`;

const ImpactIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 12px;
`;

// Custom Level Node Component
const LevelNode: React.FC<any> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <LevelNodeContainer $level={data.level}>
        <LevelHeader $level={data.level}>
          <LevelTitle>{data.title}</LevelTitle>
          <LevelSubtitle>{data.subtitle}</LevelSubtitle>
          <ExpandIcon>{data.expanded ? "−" : "+"}</ExpandIcon>
        </LevelHeader>

        <LevelBody>
          <HooksList>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Hooks at this level:
            </div>
            {data.hooks.map((hook: string, idx: number) => (
              <HookItem key={idx}>{hook}</HookItem>
            ))}
          </HooksList>

          {/* <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <StatBadge $type="refs">{data.stats.refs} Refs</StatBadge>
            <StatBadge $type="state">{data.stats.state} State</StatBadge>
            <StatBadge $type="memo">{data.stats.memo} Memoized</StatBadge>
          </div> */}

          {data.expanded && (
            <LifecycleSection>
              <LifecycleTitle>Lifecycle & Re-rendering Behavior</LifecycleTitle>

              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 13, color: "#666" }}>
                  When this level changes:
                </strong>
              </div>

              {data.lifecycle.triggers.map((trigger: string, idx: number) => (
                <LifecycleItem key={idx} $type="trigger">
                  🔴 {trigger}
                </LifecycleItem>
              ))}

              {data.lifecycle.effects.map((effect: string, idx: number) => (
                <LifecycleItem key={idx} $type="effect">
                  🔵 {effect}
                </LifecycleItem>
              ))}

              {data.lifecycle.stable.map((stable: string, idx: number) => (
                <LifecycleItem key={idx} $type="stable">
                  🟢 {stable}
                </LifecycleItem>
              ))}

              <ImpactIndicator>
                <strong>Impact:</strong> {data.lifecycle.impact}
              </ImpactIndicator>
            </LifecycleSection>
          )}
        </LevelBody>
      </LevelNodeContainer>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const LevelArchitectureVisualizer: React.FC = () => {
  const nodeTypes = useMemo(() => ({ levelNode: LevelNode }), []);

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "level1",
      type: "levelNode",
      position: { x: 400, y: 0 },
      data: {
        level: 1,
        title: "Level 1: Core Context",
        subtitle: "Foundation - Project files and metadata",
        expanded: false,
        hooks: ["useProjectContextViewModel"],
        stats: {
          refs: 2,
          state: 8,
          memo: 0,
        },
        lifecycle: {
          triggers: [
            "User selects new project → All files reload",
            "Version changes → Complete re-initialization",
            "setIsLoading(true) → UI shows loading state",
          ],
          effects: [
            "Cascades to ALL downstream levels",
            "GeometryData re-processes files",
            "VTK renderer rebuilds entire scene",
            "All selections cleared",
          ],
          stable: [
            "Uses refs for folderName to avoid re-renders",
            "File data stored as state (necessary for UI)",
            "No memoization needed (root level)",
          ],
          impact: "MAXIMUM - Entire app re-initializes",
        },
      },
    },
    {
      id: "level2",
      type: "levelNode",
      position: { x: 0, y: 350 },
      data: {
        level: 2,
        title: "Level 2: Data Processing",
        subtitle: "Transform raw files into usable structures",
        expanded: false,
        hooks: ["useGeometryDataViewModel", "useInferenceViewModel"],
        stats: {
          refs: 12,
          state: 2,
          memo: 0,
        },
        lifecycle: {
          triggers: [
            "Files change from Level 1 → Re-parse VTP files",
            "Build new lookup tables → Memory intensive",
            "Inference runs → Updates mapping data",
          ],
          effects: [
            "VTK Renderer receives new polyData",
            "Selection Viz gets new lookup tables",
            "No React re-renders (data in refs)",
          ],
          stable: [
            "Lookup tables stored in refs (Maps)",
            "PolyData objects in refs",
            "Only isProcessed in state for UI feedback",
          ],
          impact: "HIGH - VTK scene rebuilds, but no UI re-renders",
        },
      },
    },
    {
      id: "level3",
      type: "levelNode",
      position: { x: 800, y: 650 },
      data: {
        level: 3,
        title: "Level 3: VTK Rendering",
        subtitle: "3D scene management without React state",
        expanded: false,
        hooks: ["useVTKRendererViewModel"],
        stats: {
          refs: 6,
          state: 1,
          memo: 0,
        },
        lifecycle: {
          triggers: [
            "PolyData changes → Delete old actors, create new",
            "Container ref changes → Re-mount entire scene",
          ],
          effects: [
            "Selection Viz gets new renderer reference",
            "Returns getter functions, not objects",
            "triggerRender() doesn't cause React updates",
          ],
          stable: [
            "ALL VTK objects in refs",
            "Only isInitialized in state",
            "Getters return stable references",
          ],
          impact: "MEDIUM - VTK re-renders, React doesn't",
        },
      },
    },
    {
      id: "level4",
      type: "levelNode",
      position: { x: 800, y: 950 },
      data: {
        level: 4,
        title: "Level 4: Selection State",
        subtitle: "Pure state management, decoupled from rendering",
        expanded: false,
        hooks: ["useSelectionStateViewModel"],
        stats: {
          refs: 3,
          state: 4,
          memo: 0,
        },
        lifecycle: {
          triggers: [
            "User clicks geometry → toggleSelection()",
            "Mode changes (face/edge/body) → setMode()",
            "Hover events → setHovered()",
          ],
          effects: [
            "Selection Viz updates VTK display",
            "HandCalc instances sync selections",
            "selectionCount triggers UI update",
          ],
          stable: [
            "Selections in refs for high-frequency updates",
            "Only selectionCount in state for UI",
            "getSelections() returns new Set (immutable)",
          ],
          impact: "LOW - Only selection display updates",
        },
      },
    },
    {
      id: "level5",
      type: "levelNode",
      position: { x: 0, y: 1250 },
      data: {
        level: 5,
        title: "Level 5: Visualization Bridge",
        subtitle: "Connects selection state to VTK rendering",
        expanded: false,
        hooks: ["useSelectionVisualizationViewModel"],
        stats: {
          refs: 2,
          state: 0,
          memo: 2,
        },
        lifecycle: {
          triggers: [
            "Selection changes → updateDisplay()",
            "Hover changes → updateHoverDisplay()",
            "Mouse events → 60+ times per second",
          ],
          effects: [
            "Adds/removes VTK actors directly",
            "Calls renderer.render() (VTK only)",
            "NO React state updates",
          ],
          stable: [
            "Event handlers memoized with useCallback",
            "Selection actors in refs",
            "Zero React state = zero re-renders",
          ],
          impact: "MINIMAL - Only VTK canvas updates",
        },
      },
    },
    {
      id: "level6",
      type: "levelNode",
      position: { x: 400, y: 1550 },
      data: {
        level: 6,
        title: "Level 6: Mode-Specific Logic",
        subtitle: "HandCalc, FEA, Keyboard, UI state management",
        expanded: false,
        hooks: [
          "useHandCalcInstancesViewModel",
          "useConnectionGraphViewModel",
          "useFEANavigationViewModel",
          "useKeyboardNavigationViewModel",
          "usePinnedHandCalcsViewModel",
          "useRightSidebarViewModel",
        ],
        stats: {
          refs: 8,
          state: 15,
          memo: 5,
        },
        lifecycle: {
          triggers: [
            "User creates HandCalc → state update",
            "Connection made → connection state update",
            "Keyboard event → routed to appropriate handler",
          ],
          effects: [
            "Left sidebar re-renders (memoized)",
            "Auto-save triggers on connection change",
            "Selection sync with Level 4",
          ],
          stable: [
            "Keyboard handlers memoized",
            "Instance navigation doesn't re-render VTK",
            "UI state isolated from business logic",
          ],
          impact: "ISOLATED - Only affected UI components re-render",
        },
      },
    },
    {
      id: "level7",
      type: "levelNode",
      position: { x: 400, y: 2000 },
      data: {
        level: 7,
        title: "Level 7: UI Components",
        subtitle: "Memoized presentation layer",
        expanded: false,
        hooks: [],
        stats: {
          refs: 0,
          state: 0,
          memo: 4,
        },
        lifecycle: {
          triggers: [
            "Dependency props change → Re-render",
            "Non-dependency changes → Use cached version",
          ],
          effects: [
            "React DOM updates only changed parts",
            "Virtual DOM diffing minimizes updates",
          ],
          stable: [
            "ALL components memoized with useMemo",
            "Dependencies explicitly declared",
            "MathJax context prevents re-renders",
          ],
          impact: "NONE - Terminal nodes, no downstream effects",
        },
      },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    {
      id: "e1",
      source: "level1",
      target: "level2",
      animated: true,
      style: { strokeWidth: 3, stroke: "#667eea" },
      label: "Files & Context",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e2",
      source: "level2",
      target: "level3",
      animated: true,
      style: { strokeWidth: 3, stroke: "#f72585" },
      label: "PolyData",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e3",
      source: "level2",
      target: "level5",
      style: { strokeWidth: 2, stroke: "#f72585", strokeDasharray: "5 5" },
      label: "Lookup Tables",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e4",
      source: "level3",
      target: "level5",
      animated: true,
      style: { strokeWidth: 3, stroke: "#724cf9" },
      label: "Renderer",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e5",
      source: "level4",
      target: "level5",
      animated: true,
      style: { strokeWidth: 3, stroke: "#3da35d" },
      label: "Selections",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e6",
      source: "level4",
      target: "level6",
      style: { strokeWidth: 2, stroke: "#3da35d" },
      label: "Selection State",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e7",
      source: "level6",
      target: "level7",
      animated: true,
      style: { strokeWidth: 3, stroke: "#ffd700" },
      label: "Props",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e8",
      source: "level1",
      target: "level6",
      style: { strokeWidth: 2, stroke: "#667eea", strokeDasharray: "5 5" },
      label: "Project ID",
      markerEnd: { type: MarkerType.ArrowClosed },
      type: "step",
    },
  ]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            data: {
              ...n.data,
              expanded: !n.data.expanded,
            },
          };
        }
        return n;
      })
    );
  }, []);

  return (
    <VisualizerContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <MiniMap />
      </ReactFlow>

      <InfoPanel>
        <h3>Architecture Levels</h3>
        <InfoSection>
          <InfoLabel>🔴 Trigger:</InfoLabel> What causes changes
        </InfoSection>
        <InfoSection>
          <InfoLabel>🔵 Effect:</InfoLabel> What gets affected
        </InfoSection>
        <InfoSection>
          <InfoLabel>🟢 Stable:</InfoLabel> What prevents re-renders
        </InfoSection>
        <hr style={{ margin: "12px 0", opacity: 0.2 }} />
        <p style={{ fontSize: 12, lineHeight: 1.5 }}>
          Click any level to see detailed lifecycle behavior and re-rendering
          impact.
        </p>
      </InfoPanel>
    </VisualizerContainer>
  );
};

// Additional styled components
const VisualizerContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--bg-primary);
`;

const InfoPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  color: black;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 280px;

  h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: #666;
  }
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size: 13px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  margin-right: 8px;
`;

export default LevelArchitectureVisualizer;
