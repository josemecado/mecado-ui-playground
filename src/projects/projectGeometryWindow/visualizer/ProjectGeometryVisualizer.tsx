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
      "#f72585", // Level 2 - Data (pink)
      "#724cf9", // Level 3 - VTK (blue)
      "#3da35d", // Level 4 - Selection (green)
      "#ff8500", // Level 5 - Viz (rose)
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
  top: 0px;
  right: 0px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 4px;
  border-radius: 10px;
  font-size: 9px;
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
const NodeDetails = styled.div`
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const DetailSection = styled.div`
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailItem = styled.div`
  font-size: 11px;
  color: #333;
  padding: 2px 0;
  padding-left: 8px;
  font-family: "Monaco", "Courier New", monospace;
`;

const ExpandIcon = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
  font-size: 12px;
`;

const CustomNode: React.FC<any> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeContainer $level={data.level} style={{ cursor: "pointer" }}>
        {data.isMemoized && <MemoizedBadge>MEMOIZED</MemoizedBadge>}
        <NodeHeader $level={data.level} style={{ position: "relative" }}>
          LEVEL {data.level}
          <ExpandIcon>{data.expanded ? "▼" : "▶"}</ExpandIcon>
        </NodeHeader>
        <NodeBody>
          <NodeTitle>{data.label}</NodeTitle>
          {data.description && (
            <NodeDescription>{data.description}</NodeDescription>
          )}
        </NodeBody>
        {data.expanded && data.details && (
          <NodeDetails>
            <DetailSection>
              <DetailTitle>Dependencies:</DetailTitle>
              {data.details.dependencies.map((dep: string, idx: number) => (
                <DetailItem key={idx}>• {dep}</DetailItem>
              ))}
            </DetailSection>
            <DetailSection>
              <DetailTitle>Returns:</DetailTitle>
              {data.details.returns.map((ret: string, idx: number) => (
                <DetailItem key={idx}>→ {ret}</DetailItem>
              ))}
            </DetailSection>
            <DetailSection>
              <DetailTitle>Depends On (Upstream):</DetailTitle>
              {data.details.upstream.map((up: string, idx: number) => (
                <DetailItem key={idx}>↑ {up}</DetailItem>
              ))}
            </DetailSection>

            <DetailSection>
              <DetailTitle>Used By (Downstream):</DetailTitle>
              {data.details.downstream.map((down: string, idx: number) => (
                <DetailItem key={idx}>↓ {down}</DetailItem>
              ))}
            </DetailSection>
          </NodeDetails>
        )}
      </NodeContainer>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const HookArchitectureVisualizer: React.FC = () => {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Define nodes for each hook
  const [nodes, setNodes] = useState<Node[]>([
    // LEVEL 1: Core Context (y: 50)
    {
      id: "projectContext",
      type: "custom",
      position: { x: 500, y: 50 },
      data: {
        label: "useProjectContextViewModel",
        description: "Files, project ID, loading state",
        level: 1,
        expanded: false,
        details: {
          dependencies: ["None (Root Hook)"],
          returns: [
            "projectID: string",
            "version: number",
            "files: { facesFile, edgesFile, bodiesFile }",
            "geometryInfo: GeometryJson",
            "folderName: string",
            "isLoading: boolean",
            "error: string | null",
            "isReady: boolean",
            "reload: () => void",
          ],
          upstream: ["None (Root)"],
          downstream: [
            "geometryData",
            "inference",
            "handCalcInstances",
            "pinnedHandCalcs",
            "keyboard",
            "vtkViewer",
            "rightSidebar",
            "bottomButtons",
          ],
        },
      },
    },

    // LEVEL 2: Data Processing (y: 200)
    {
      id: "geometryData",
      type: "custom",
      position: { x: 300, y: 200 },
      data: {
        label: "useGeometryDataViewModel",
        description: "PolyData, lookup tables",
        level: 2,
        expanded: false,
        details: {
          dependencies: [
            "files: projectContext.files",
            "isReady: projectContext.isReady",
          ],
          returns: [
            "polyData: { faces, edges, bodies }",
            "lookupTables.faceIdToCells: Map",
            "lookupTables.edgeIdToCells: Map",
            "lookupTables.bodyIdToCells: Map",
            "lookupTables.cellToFaceId: Map",
            "lookupTables.cellToEdgeId: Map",
            "lookupTables.cellToBodyId: Map",
            "mappings: { stepToMechanical, stepToDiscovery }",
            "isProcessed: boolean",
          ],
          upstream: ["projectContext"],
          downstream: ["vtkRenderer", "selectionViz"],
        },
      },
    },
    {
      id: "inference",
      type: "custom",
      position: { x: 700, y: 200 },
      data: {
        label: "useInferenceViewModel",
        description: "ML inference, labeling",
        level: 2,
        expanded: false,
        details: {
          dependencies: [
            "projectId: projectContext.projectID",
            "version: projectContext.version",
          ],
          returns: [
            "inferenceMapping: InferenceMapping | null",
            "isInferenceReady: boolean",
            "isRunning: boolean",
            "runInference: () => Promise<void>",
            "checkStatus: () => Promise<void>",
          ],
          upstream: ["projectContext"],
          downstream: ["vtkViewer", "bottomButtons"],
        },
      },
    },

    // LEVEL 3: VTK Rendering & Selection State (y: 350)
    {
      id: "vtkRenderer",
      type: "custom",
      position: { x: 300, y: 350 },
      data: {
        label: "useVTKRendererViewModel",
        description: "VTK scene, actors, renderer",
        level: 3,
        expanded: false,
        details: {
          dependencies: [
            "container: vtkContainerRef",
            "polyData: geometryData.polyData",
            "isReady: geometryData.isProcessed",
          ],
          returns: [
            "getRenderer: () => vtkRenderer",
            "getRenderWindow: () => vtkRenderWindow",
            "getActors: () => { face, edge, body }",
            "getPicker: () => vtkCellPicker",
            "triggerRender: () => void",
            "resetCamera: () => void",
            "isInitialized: boolean",
          ],
          upstream: ["geometryData"],
          downstream: ["selectionViz"],
        },
      },
    },
    {
      id: "selectionState",
      type: "custom",
      position: { x: 700, y: 350 },
      data: {
        label: "useSelectionStateViewModel",
        description: "Pure selection state",
        level: 4,
        expanded: false,
        details: {
          dependencies: ["None (Pure State)"],
          returns: [
            "getSelections: () => { faces: Set, edges: Set, bodies: Set }",
            "hoveredId: number | null",
            "mode: 'face' | 'edge' | 'body'",
            "toggleSelection: (type, id) => void",
            "clearAll: () => void",
            "setMode: (mode) => void",
            "setHovered: (id) => void",
            "selectionCount: number",
            "loadSelections: (selections) => void",
          ],
          upstream: ["None (Pure State)"],
          downstream: [
            "selectionViz",
            "handCalcInstances",
            "vtkViewer",
            "keyboard",
          ],
        },
      },
    },

    // LEVEL 5: Visualization Bridge (y: 500)
    {
      id: "selectionViz",
      type: "custom",
      position: { x: 500, y: 500 },
      data: {
        label: "useSelectionVisualizationViewModel",
        description: "Bridges selection to VTK",
        level: 5,
        expanded: false,
        details: {
          dependencies: [
            "getRenderer: vtkRenderer.getRenderer",
            "getRenderWindow: vtkRenderer.getRenderWindow",
            "getActors: vtkRenderer.getActors",
            "getPicker: vtkRenderer.getPicker",
            "lookupTables: geometryData.lookupTables",
            "selections: selectionState.getSelections",
            "hoveredId: selectionState.hoveredId",
            "mode: selectionState.mode",
            "onHover: selectionState.setHovered",
            "onSelect: selectionState.toggleSelection",
            "triggerRender: vtkRenderer.triggerRender",
          ],
          returns: [
            "handleMouseMove: (event) => void",
            "handleClick: (event) => void",
            "updateDisplay: () => void",
          ],
          upstream: ["vtkRenderer", "geometryData", "selectionState"],
          downstream: ["None (consumed by effects)"],
        },
      },
    },

    // LEVEL 6: Mode-specific hooks (y: 650)
    {
      id: "handCalcInstances",
      type: "custom",
      position: { x: 100, y: 650 },
      data: {
        label: "useHandCalcInstancesViewModel",
        description: "HandCalc equations",
        level: 6,
        expanded: false,
        details: {
          dependencies: [
            "projectId: projectContext.projectID",
            "version: projectContext.version",
            "enabled: sidebarMode === 'handcalc'",
            "selections: selectionState.getSelections()",
            "onSelectionLoad: selectionState.loadSelections",
          ],
          returns: [
            "instances: HandCalcInstance[]",
            "selectedIndex: number",
            "isCreating: boolean",
            "pendingInstanceData: {...} | null",
            "createInstance: (data) => void",
            "deleteInstance: (id) => void",
            "navigate: (direction) => void",
            "selectInstance: (index) => void",
            "confirmName: () => void",
            "cancelCreation: () => void",
            "markForDeletion: () => void",
            "clearDeletionMark: () => void",
            "saveSelection: () => void",
            "newInstanceName: string",
            "setNewInstanceName: (name) => void",
            "shouldFocusInput: boolean",
          ],
          upstream: ["projectContext", "selectionState"],
          downstream: [
            "connectionGraph",
            "leftSidebar",
            "rightSidebar",
            "keyboard",
            "bottomButtons",
          ],
        },
      },
    },
    {
      id: "connectionGraph",
      type: "custom",
      position: { x: 400, y: 650 },
      data: {
        label: "useConnectionGraphViewModel",
        description: "Variable connections",
        level: 6,
        expanded: false,
        details: {
          dependencies: [
            "instances: handCalcInstances.instances",
            "enabled: sidebarMode === 'handcalc'",
          ],
          returns: [
            "connections: HandCalcInstanceVariableConnection[]",
            "selectedVariable: { instanceId, variableSymbol } | null",
            "selectionMode: boolean",
            "handleVariableClick: (instanceId, variableSymbol) => void",
            "deleteConnection: (connectionId) => void",
            "deleteVariable: (connectionId, instanceId, variableSymbol) => void",
            "clearSelection: () => void",
          ],
          upstream: ["handCalcInstances"],
          downstream: ["leftSidebar", "keyboard"],
        },
      },
    },
    {
      id: "keyboard",
      type: "custom",
      position: { x: 700, y: 650 },
      data: {
        label: "useKeyboardNavigationViewModel",
        description: "Keyboard orchestration",
        level: 6,
        expanded: false,
        details: {
          dependencies: [
            "mode: sidebarMode",
            "filesReady: projectContext.isReady",
            "handlers.handCalc: handCalcInstances methods",
            "handlers.connections: connectionGraph methods",
            "handlers.toggleMode: setSidebarMode",
            "handlers.toggleSelectionMode: selectionState.setMode",
            "handlers.clearSelections: selectionState.clearAll",
          ],
          returns: [
            "Automatically sets up keyboard listeners",
            "Routes keyboard events to appropriate handlers",
          ],
          upstream: [
            "projectContext",
            "handCalcInstances",
            "connectionGraph",
            "selectionState",
          ],
          downstream: ["None (event system)"],
        },
      },
    },
    {
      id: "pinnedHandCalcs",
      type: "custom",
      position: { x: 1000, y: 650 },
      data: {
        label: "usePinnedHandCalcsViewModel",
        description: "Pinned equation templates",
        level: 6,
        expanded: false,
        details: {
          dependencies: [
            "projectId: projectContext.projectID",
            "version: projectContext.version",
            "selectedInstanceParentId: handCalcInstances...parentHandCalcId",
          ],
          returns: [
            "pinnedEquations: HandCalc[]",
            "createInstanceFromPinned: (pinnedId) => void",
            "isLoading: boolean",
            "pendingInstanceData: {...} | null",
          ],
          upstream: ["projectContext", "handCalcInstances"],
          downstream: ["rightSidebar"],
        },
      },
    },
    {
      id: "rightSidebarState",
      type: "custom",
      position: { x: 1300, y: 650 },
      data: {
        label: "useRightSidebarViewModel",
        description: "Right sidebar UI state",
        level: 6,
        expanded: false,
        details: {
          dependencies: ["None (Pure UI State)"],
          returns: [
            "isCollapsed: boolean",
            "toggle: () => void",
            "collapse: () => void",
            "expand: () => void",
          ],
          upstream: ["None (Pure State)"],
          downstream: ["rightSidebar", "CollapsedSidebarButton"],
        },
      },
    },

    // LEVEL 7: UI Components (memoized) (y: 800)
    {
      id: "leftSidebar",
      type: "custom",
      position: { x: 100, y: 800 },
      data: {
        label: "Left Sidebar",
        description: "HandCalc/FEA UI",
        level: 6,
        isMemoized: true,
        expanded: false,
        details: {
          dependencies: [
            "handCalcInstances.instances",
            "handCalcInstances.selectedIndex",
            "handCalcInstances.newInstanceName",
            "connectionGraph.connections",
            "connectionGraph.selectedVariable",
            "connectionGraph.selectionMode",
          ],
          returns: ["Memoized JSX Component"],
          upstream: ["handCalcInstances", "connectionGraph"],
          downstream: ["Main UI Render"],
        },
      },
    },
    {
      id: "vtkViewer",
      type: "custom",
      position: { x: 400, y: 800 },
      data: {
        label: "VTK Viewer",
        description: "3D viewport",
        level: 6,
        isMemoized: true,
        expanded: false,
        details: {
          dependencies: [
            "vtkContainerRef",
            "projectContext.isLoading",
            "projectContext.error",
            "projectContext.geometryInfo",
            "selectionState.mode",
            "selectionState.hoveredId",
            "selectionState.selectionCount",
            "handCalcInstances.instances.length",
            "sidebarMode",
            "inference.inferenceMapping",
          ],
          returns: ["Memoized VTKViewer Component"],
          upstream: [
            "projectContext",
            "selectionState",
            "handCalcInstances",
            "inference",
          ],
          downstream: ["Main UI Render"],
        },
      },
    },
    {
      id: "rightSidebar",
      type: "custom",
      position: { x: 700, y: 800 },
      data: {
        label: "Right Sidebar",
        description: "Pinned equations",
        level: 6,
        isMemoized: true,
        expanded: false,
        details: {
          dependencies: [
            "rightSidebarState.isCollapsed",
            "projectContext.projectID",
            "projectContext.version",
            "handCalcInstances.instances",
            "handCalcInstances.selectedIndex",
            "pinnedHandCalcs.pendingInstanceData",
          ],
          returns: ["Memoized HandCalcRightSidebar Component"],
          upstream: [
            "rightSidebarState",
            "projectContext",
            "handCalcInstances",
            "pinnedHandCalcs",
          ],
          downstream: ["Main UI Render"],
        },
      },
    },
    {
      id: "bottomButtons",
      type: "custom",
      position: { x: 1000, y: 800 },
      data: {
        label: "Bottom Buttons",
        description: "Inference & Navigation",
        level: 6,
        isMemoized: true,
        expanded: false,
        details: {
          dependencies: [
            "inference.isRunning",
            "inference.isInferenceReady",
            "theme",
            "sidebarMode",
            "handCalcInstances.saveSelection",
          ],
          returns: ["Memoized ButtonsContainer Component"],
          upstream: ["inference", "handCalcInstances"],
          downstream: ["Main UI Render"],
        },
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
