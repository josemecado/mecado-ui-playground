// HookArchitectureVisualizer.tsx
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

// Styled components for custom nodes
const NodeContainer = styled.div<{ $level: number }>`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 220px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid #e0e0e0;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const NodeHeader = styled.div<{ $level: number }>`
  background: ${(props) => {
    const colors = [
      "#667eea", // Level 1 - Core (purple)
      "#f093fb", // Level 2 - Data (pink)
      "#4facfe", // Level 3 - VTK (blue)
      "#43e97b", // Level 4 - Selection (green)
      "#fa709a", // Level 5 - Viz (rose)
      "#30cfd0", // Mode specific (teal)
    ];
    return colors[props.$level - 1] || colors[5];
  }};
  padding: 4px 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NodeBody = styled.div`
  padding: 12px 16px;
`;

const NodeTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1a1a1a;
`;

const NodeDescription = styled.div`
  font-size: 11px;
  opacity: 0.7;
  font-weight: 500;
  color: var(--text-muted);
`;

const LevelLabel = styled.div`
  position: absolute;
  left: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.3;
`;

const MemoizedBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border: 2px solid white;
  z-index: 10;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  color: black;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  background: white;
  border: 2px solid ${(props) => props.$color};
  border-radius: 6px;
  margin-right: 10px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.$color};
    border-radius: 4px 4px 0 0;
  }
`;

// Custom node component
const CustomNode: React.FC<any> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeContainer $level={data.level}>
        {data.isMemoized && <MemoizedBadge>MEMOIZED</MemoizedBadge>}
        <NodeHeader $level={data.level}>
          LEVEL {data.level}
        </NodeHeader>
        <NodeBody>
          <NodeTitle>{data.label}</NodeTitle>
          {data.description && (
            <NodeDescription>{data.description}</NodeDescription>
          )}
        </NodeBody>
      </NodeContainer>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const HookArchitectureVisualizer: React.FC = () => {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Define nodes for each hook
  const [nodes, setNodes] = useState<Node[]>([
    // LEVEL 1: Core Context
    {
      id: "projectContext",
      type: "custom",
      position: { x: 400, y: 50 },
      data: {
        label: "useProjectContextViewModel",
        description: "Files, project ID, loading state",
        level: 1,
      },
    },

    // LEVEL 2: Data Processing
    {
      id: "geometryData",
      type: "custom",
      position: { x: 200, y: 200 },
      data: {
        label: "useGeometryDataViewModel",
        description: "PolyData, lookup tables",
        level: 2,
      },
    },
    {
      id: "inference",
      type: "custom",
      position: { x: 600, y: 200 },
      data: {
        label: "useInferenceViewModel",
        description: "ML inference, labeling",
        level: 2,
      },
    },

    // LEVEL 3: VTK Rendering
    {
      id: "vtkRenderer",
      type: "custom",
      position: { x: 200, y: 350 },
      data: {
        label: "useVTKRendererViewModel",
        description: "VTK scene, actors, renderer",
        level: 3,
      },
    },

    // LEVEL 4: Selection Management
    {
      id: "selectionState",
      type: "custom",
      position: { x: 500, y: 350 },
      data: {
        label: "useSelectionStateViewModel",
        description: "Pure selection state",
        level: 4,
      },
    },

    // LEVEL 5: Visualization Layer
    {
      id: "selectionViz",
      type: "custom",
      position: { x: 350, y: 500 },
      data: {
        label: "useSelectionVisualizationViewModel",
        description: "Bridges selection to VTK",
        level: 5,
      },
    },

    // Mode-specific hooks
    {
      id: "handCalcInstances",
      type: "custom",
      position: { x: 650, y: 500 },
      data: {
        label: "useHandCalcInstancesViewModel",
        description: "HandCalc equations",
        level: 6,
      },
    },
    {
      id: "connectionGraph",
      type: "custom",
      position: { x: 850, y: 500 },
      data: {
        label: "useConnectionGraphViewModel",
        description: "Variable connections",
        level: 6,
      },
    },
    {
      id: "feaNavigation",
      type: "custom",
      position: { x: 650, y: 650 },
      data: {
        label: "useFEANavigationViewModel",
        description: "FEA headings/subheadings",
        level: 6,
      },
    },
    {
      id: "keyboard",
      type: "custom",
      position: { x: 450, y: 650 },
      data: {
        label: "useKeyboardNavigationViewModel",
        description: "Keyboard orchestration",
        level: 6,
      },
    },

    // UI Components (memoized)
    {
      id: "leftSidebar",
      type: "custom",
      position: { x: 100, y: 800 },
      data: {
        label: "Left Sidebar",
        description: "HandCalc/FEA UI",
        level: 6,
        isMemoized: true,
      },
    },
    {
      id: "vtkViewer",
      type: "custom",
      position: { x: 350, y: 800 },
      data: {
        label: "VTK Viewer",
        description: "3D viewport",
        level: 6,
        isMemoized: true,
      },
    },
    {
      id: "rightSidebar",
      type: "custom",
      position: { x: 600, y: 800 },
      data: {
        label: "Right Sidebar",
        description: "Pinned equations",
        level: 6,
        isMemoized: true,
      },
    },
  ]);

  // Define edges (dependencies)
  const [edges, setEdges] = useState<Edge[]>([
    // Level 1 → Level 2
    {
      id: "e1",
      source: "projectContext",
      target: "geometryData",
      animated: true,
      label: "files",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e2",
      source: "projectContext",
      target: "inference",
      animated: true,
      label: "projectID",
      markerEnd: { type: MarkerType.ArrowClosed },
    },

    // Level 2 → Level 3
    {
      id: "e3",
      source: "geometryData",
      target: "vtkRenderer",
      animated: true,
      label: "polyData",
      markerEnd: { type: MarkerType.ArrowClosed },
    },

    // Level 3 & 4 → Level 5
    {
      id: "e4",
      source: "vtkRenderer",
      target: "selectionViz",
      animated: true,
      label: "getRenderer",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e5",
      source: "selectionState",
      target: "selectionViz",
      animated: true,
      label: "selections",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e6",
      source: "geometryData",
      target: "selectionViz",
      label: "lookupTables",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeDasharray: "5 5" },
    },

    // Selection state to mode-specific
    {
      id: "e7",
      source: "selectionState",
      target: "handCalcInstances",
      label: "selections",
      markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
      id: "e8",
      source: "selectionState",
      target: "feaNavigation",
      label: "selections",
      markerEnd: { type: MarkerType.ArrowClosed },
    },

    // HandCalc to connections
    {
      id: "e9",
      source: "handCalcInstances",
      target: "connectionGraph",
      label: "instances",
      markerEnd: { type: MarkerType.ArrowClosed },
    },

    // Project context to mode-specific
    {
      id: "e10",
      source: "projectContext",
      target: "handCalcInstances",
      label: "projectID",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeDasharray: "5 5" },
    },
    {
      id: "e11",
      source: "projectContext",
      target: "feaNavigation",
      label: "projectID",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeDasharray: "5 5" },
    },

    // Keyboard orchestration
    {
      id: "e12",
      source: "handCalcInstances",
      target: "keyboard",
      label: "handlers",
      markerEnd: { type: MarkerType.ArrowClosed },
      type: "step",
    },
    {
      id: "e13",
      source: "feaNavigation",
      target: "keyboard",
      label: "handlers",
      markerEnd: { type: MarkerType.ArrowClosed },
      type: "step",
    },
    {
      id: "e14",
      source: "connectionGraph",
      target: "keyboard",
      label: "handlers",
      markerEnd: { type: MarkerType.ArrowClosed },
      type: "step",
    },

    // To UI Components
    {
      id: "e15",
      source: "handCalcInstances",
      target: "leftSidebar",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#ffd700", strokeWidth: 2 },
    },
    {
      id: "e16",
      source: "connectionGraph",
      target: "leftSidebar",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#ffd700", strokeWidth: 2 },
    },
    {
      id: "e17",
      source: "selectionState",
      target: "vtkViewer",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#ffd700", strokeWidth: 2 },
    },
    {
      id: "e18",
      source: "inference",
      target: "vtkViewer",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#ffd700", strokeWidth: 2 },
    },
    {
      id: "e19",
      source: "handCalcInstances",
      target: "rightSidebar",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#ffd700", strokeWidth: 2 },
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

  return (
    <VisualizerContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />

        {/* Level labels */}
        <LevelLabel style={{ top: 50 }}>Level 1: Core Context</LevelLabel>
        <LevelLabel style={{ top: 200 }}>Level 2: Data Processing</LevelLabel>
        <LevelLabel style={{ top: 350 }}>Level 3: Rendering</LevelLabel>
        <LevelLabel style={{ top: 500 }}>Level 4-5: State & Bridge</LevelLabel>
        <LevelLabel style={{ top: 650 }}>Mode-Specific</LevelLabel>
        <LevelLabel style={{ top: 800 }}>UI Components</LevelLabel>
      </ReactFlow>

      <Legend>
        <h4 style={{ margin: "0 0 12px 0" }}>Legend</h4>
        <LegendItem>
          <LegendColor $color="#667eea" />
          Core Context Layer
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#f093fb" />
          Data Processing Layer
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#4facfe" />
          VTK Rendering Layer
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#43e97b" />
          Selection State Layer
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#fa709a" />
          Visualization Bridge
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#30cfd0" />
          Mode-Specific Hooks
        </LegendItem>
        <LegendItem>
          <span style={{ fontSize: "16px", marginRight: "10px" }}>⭐</span>
          Memoized Component
        </LegendItem>
        <hr style={{ margin: "8px 0" }} />
        <LegendItem style={{ fontSize: "11px", opacity: 0.8 }}>
          → Animated edges: Primary data flow
        </LegendItem>
        <LegendItem style={{ fontSize: "11px", opacity: 0.8 }}>
          ⇢ Dashed edges: Secondary dependencies
        </LegendItem>
        <LegendItem style={{ fontSize: "11px", opacity: 0.8 }}>
          🟨 Gold edges: To memoized components
        </LegendItem>
      </Legend>

      <InfoPanel>
        <h3>Key Insights</h3>
        <ul>
          <li>
            <strong>Unidirectional Flow:</strong> Data flows from top to bottom
          </li>
          <li>
            <strong>No Circular Dependencies:</strong> Each layer only knows
            about layers above
          </li>
          <li>
            <strong>Memoized Components:</strong> UI components cached to
            prevent re-renders
          </li>
          <li>
            <strong>Decoupled Selection:</strong> Selection state separate from
            VTK rendering
          </li>
          <li>
            <strong>Mode Independence:</strong> HandCalc and FEA modes don't
            know about each other
          </li>
        </ul>
      </InfoPanel>
    </VisualizerContainer>
  );
};

// Styled components
const VisualizerContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
`;

const InfoPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 250px;
  color: black;

  h3 {
    margin: 0 0 12px 0;
    color: #333;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 12px;
    line-height: 1.6;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #667eea;
  }
`;

export default HookArchitectureVisualizer;
