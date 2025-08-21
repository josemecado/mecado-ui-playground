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

const NodeContainer = styled.div<{
  $level: number;
  $type: "hook" | "component";
}>`
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  min-width: 240px;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid var(--border-bg);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const NodeHeader = styled.div<{ $level: number; $type: "hook" | "component" }>`
  background: ${(props) => {
    if (props.$type === "component") return "#6c757d";
    const colors = [
      "#667eea", // Level 1 - Core
      "#f72585", // Level 2 - Data Processing
      "#724cf9", // Level 3 - VTK
      "#3da35d", // Level 4 - Selection
      "#ff8500", // Level 5 - Visualization
      "#30cfd0", // Level 6 - Interaction
      "#e91e63", // Level 7 - Mode/UI
    ];
    return colors[props.$level - 1] || colors[6];
  }};
  padding: 6px 8px;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NodeBody = styled.div`
  padding: 8px;
`;

const NodeTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
`;

const NodeDescription = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const MethodsList = styled.div`
  border-top: 1px solid var(--bg-tertiary);
  padding-top: 8px;
`;

const MethodItem = styled.div<{ $type: "exposes" | "calls" }>`
  font-size: 9px;
  /* font-family: "Monaco", "Courier New", monospace; */
  padding: 2px 0;
  color: ${(props) => (props.$type === "exposes" ? "#059669" : "var(--error)")};

  &::before {
    content: "${(props) => (props.$type === "exposes" ? "→" : "←")}";
    margin-right: 4px;
    font-weight: bold;
  }
`;

const SectionTitle = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: var(--text-muted);
  margin: 8px 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LevelLabel = styled.div`
  position: absolute;
  left: 20px;
  font-size: 16px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.3;
`;

const Legend = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
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

const CustomNode: React.FC<any> = ({ data }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <NodeContainer $level={data.level} $type={data.type || "hook"}>
        <NodeHeader $level={data.level} $type={data.type || "hook"}>
          {data.type === "component" ? "COMPONENT" : `LEVEL ${data.level}`}
          <span>{data.expanded ? "▼" : "▶"}</span>
        </NodeHeader>
        <NodeBody>
          <NodeTitle>{data.label}</NodeTitle>
          <NodeDescription>{data.description}</NodeDescription>

          {data.expanded && (
            <MethodsList>
              {data.calls && data.calls.length > 0 && (
                <>
                  <SectionTitle>Calls (From Other Hooks):</SectionTitle>
                  {data.calls.map((method: string, idx: number) => (
                    <MethodItem key={idx} $type="calls">
                      {method}
                    </MethodItem>
                  ))}
                </>
              )}

              {data.exposes && data.exposes.length > 0 && (
                <>
                  <SectionTitle>Exposes (Methods/Data):</SectionTitle>
                  {data.exposes.map((method: string, idx: number) => (
                    <MethodItem key={idx} $type="exposes">
                      {method}
                    </MethodItem>
                  ))}
                </>
              )}
            </MethodsList>
          )}
        </NodeBody>
      </NodeContainer>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

const MethodCallArchitecture: React.FC = () => {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const [nodes, setNodes] = useState<Node[]>([
    // LEVEL 1: Core Context
    {
      id: "projectFiles",
      type: "custom",
      position: { x: 500, y: 50 },
      data: {
        label: "projectFiles",
        description: "Project metadata & file management",
        level: 1,
        expanded: false,
        exposes: [
          "projectID: string",
          "files: { facesFile, edgesFile, bodiesFile }",
          "geometryInfo: GeometryJson",
          "isReady: boolean",
          "reload: () => void",
        ],
        calls: [],
        expanded: false,
      },
    },

    // LEVEL 2A: Data Processing - Split into focused hooks
    {
      id: "polyDataProcessing",
      type: "custom",
      position: { x: 200, y: 180 },
      data: {
        label: "polyDataProcessing",
        description: "Raw geometry → VTK polyData",
        level: 2,
        expanded: false,
        exposes: [
          "polyData: { faces, edges, bodies }",
          "isProcessed: boolean",
          "processingError: string | null",
        ],
        calls: ["projectFiles.files", "projectFiles.isReady"],
        expanded: false,
      },
    },

    {
      id: "lookupTables",
      type: "custom",
      position: { x: 500, y: 180 },
      data: {
        label: "lookupTables",
        description: "ID ↔ Cell mapping methods (no raw data exposure)",
        level: 2,
        expanded: false,
        exposes: [
          "getCellsForFace: (id) => number[]",
          "getCellsForEdge: (id) => number[]",
          "getCellsForBody: (id) => number[]",
          "getFaceIdForCell: (id) => number | null",
          "getEdgeIdForCell: (id) => number | null",
          "getBodyIdForCell: (id) => number | null",
          "isTablesReady: boolean",
        ],
        calls: [
          "polyDataProcessing.polyData",
          "polyDataProcessing.isProcessed",
        ],
        expanded: false,
      },
    },

    {
      id: "geometryMappings",
      type: "custom",
      position: { x: 800, y: 180 },
      data: {
        label: "geometryMappings",
        description: "STEP ↔ Mechanical/Discovery mappings",
        level: 2,
        expanded: false,
        exposes: [
          "getStepToMechanical: (id) => string | null",
          "getStepToDiscovery: (id) => string | null",
          "getMechanicalToStep: (id) => string | null",
          "getDiscoveryToStep: (id) => string | null",
          "isMappingsReady: boolean",
        ],
        calls: ["projectFiles.geometryInfo", "projectFiles.isReady"],
        expanded: false,
      },
    },

    // LEVEL 2B: ML Inference - Split into execution & results
    {
      id: "inferenceEngine",
      type: "custom",
      position: { x: 1100, y: 180 },
      data: {
        label: "inferenceEngine",
        description: "ML inference execution",
        level: 2,
        expanded: false,
        exposes: [
          "runInference: () => Promise<void>",
          "checkStatus: () => Promise<void>",
          "isRunning: boolean",
          "isComplete: boolean",
          "error: string | null",
        ],
        calls: ["projectFiles.projectID", "projectFiles.version"],
        expanded: false,
      },
    },

    {
      id: "inferenceResults",
      type: "custom",
      position: { x: 1400, y: 180 },
      data: {
        label: "inferenceResults",
        description: "ML results & labeling methods",
        level: 2,
        expanded: false,
        exposes: [
          "getElementLabels: (id) => string[]",
          "getBestLabel: (id) => string | null",
          "getConfidenceScore: (id, label) => number",
          "isResultsReady: boolean",
        ],
        calls: [
          "projectFiles.projectID",
          "projectFiles.version",
          "inferenceEngine.isComplete",
        ],
        expanded: false,
      },
    },

    // LEVEL 3: VTK Rendering - Consolidated with high-level methods
    {
      id: "vtkRenderer",
      type: "custom",
      position: { x: 500, y: 320 },
      data: {
        label: "vtkRenderer",
        description: "Complete VTK management with high-level selection API",
        level: 3,
        expanded: false,
        exposes: [
          "highlightCells: (cellIds, color) => void",
          "clearHighlights: (type?) => void",
          "setHoverHighlight: (cellIds, color?) => void",
          "pickCellAtCoordinate: (x, y) => number | null",
          "updateVisibility: (type, visible) => void",
          "resetCamera: () => void",
          "triggerRender: () => void",
          "getRenderer: () => vtkRenderer",
          "isInitialized: boolean",
        ],
        calls: [
          "polyDataProcessing.polyData",
          "polyDataProcessing.isProcessed",
        ],
        expanded: false,
      },
    },

    // LEVEL 4: Selection State Management - Clean separation
    {
      id: "selectionState",
      type: "custom",
      position: { x: 200, y: 460 },
      data: {
        label: "selectionState",
        description: "Pure selection state (no VTK knowledge)",
        level: 4,
        expanded: false,
        exposes: [
          "getSelectedFaces: () => Set<number>",
          "getSelectedEdges: () => Set<number>",
          "getSelectedBodies: () => Set<number>",
          "getHoveredId: () => number | null",
          "getSelectionMode: () => 'face'|'edge'|'body'",
          "toggleFaceSelection: (id) => void",
          "toggleEdgeSelection: (id) => void",
          "toggleBodySelection: (id) => void",
          "setHovered: (id) => void",
          "setSelectionMode: (mode) => void",
          "clearAllSelections: () => void",
          "getSelectionCount: () => number",
        ],
        calls: [],
        expanded: false,
      },
    },

    {
      id: "selectionPersistence",
      type: "custom",
      position: { x: 600, y: 460 },
      data: {
        label: "selectionPersistence",
        description: "Save/load selections to/from storage",
        level: 4,
        expanded: false,
        exposes: [
          "saveSelections: () => Promise<void>",
          "loadSelections: () => Promise<void>",
          "autoSave: boolean",
          "setAutoSave: (enabled) => void",
        ],
        calls: [
          "projectFiles.projectID",
          "projectFiles.version",
          "selectionState.getSelectedFaces()",
          "selectionState.getSelectedEdges()",
          "selectionState.getSelectedBodies()",
          "selectionState.loadSelections()",
        ],
        expanded: false,
      },
    },

    // LEVEL 4: Selection Visualizer - Simplified orchestrator
    {
      id: "selectionVisualizer",
      type: "custom",
      position: { x: 800, y: 460 },
      data: {
        label: "selectionVisualization",
        description: "Orchestrates selection state → visual updates",
        level: 4,
        expanded: false,
        exposes: [
          "updateSelectionVisuals: () => void",
          "updateHoverVisuals: () => void",
          "refreshAllVisuals: () => void",
        ],
        calls: [
          "vtkRenderer.highlightCells()",
          "vtkRenderer.clearHighlights()",
          "vtkRenderer.setHoverHighlight()",
          "lookupTables.getCellsForFace()",
          "lookupTables.getCellsForEdge()",
          "lookupTables.getCellsForBody()",
          "selectionState.getSelectedFaces()",
          "selectionState.getSelectedEdges()",
          "selectionState.getSelectedBodies()",
          "selectionState.getHoveredId()",
        ],
        expanded: false,
      },
    },

    // LEVEL 5: Interaction Handling - Uses high-level methods only
    {
      id: "interactionHandlers",
      type: "custom",
      position: { x: 500, y: 600 },
      data: {
        label: "interactionHandlers",
        description: "Mouse/keyboard → actions (no raw VTK objects)",
        level: 5,
        expanded: false,
        exposes: [
          "handleMouseMove: (event) => void",
          "handleClick: (event) => void",
          "handleKeyPress: (event) => void",
        ],
        calls: [
          "vtkRenderer.pickCellAtCoordinate()",
          "lookupTables.getFaceIdForCell()",
          "lookupTables.getEdgeIdForCell()",
          "lookupTables.getBodyIdForCell()",
          "selectionState.toggleFaceSelection()",
          "selectionState.toggleEdgeSelection()",
          "selectionState.toggleBodySelection()",
          "selectionState.setHovered()",
          "selectionState.getSelectionMode()",
          "selectionVisualizer.updateSelectionVisuals()",
          "selectionVisualizer.updateHoverVisuals()",
        ],
        expanded: false,
      },
    },

    // LEVEL 6: HandCalc Mode - Better separation
    {
      id: "handCalcInstances",
      type: "custom",
      position: { x: 100, y: 740 },
      data: {
        label: "handCalcInstances",
        description: "Pure HandCalc instance management",
        level: 6,
        expanded: false,
        exposes: [
          "getInstances: () => HandCalcInstance[]",
          "getSelectedIndex: () => number",
          "getSelectedInstance: () => HandCalcInstance | null",
          "createInstance: (data) => void",
          "deleteInstance: (id) => void",
          "selectInstance: (index) => void",
          "navigateNext: () => void",
          "navigatePrev: () => void",
          "isCreating: boolean",
        ],
        calls: ["projectFiles.projectID", "projectFiles.version"],
        expanded: false,
      },
    },

    {
      id: "handCalcConnections",
      type: "custom",
      position: { x: 400, y: 740 },
      data: {
        label: "handCalcConnections",
        description: "Variable connections between instances",
        level: 6,
        expanded: false,
        exposes: [
          "getConnections: () => VariableConnection[]",
          "createConnection: (from, to) => void",
          "deleteConnection: (id) => void",
          "getConnectionsForVariable: (instanceId, variable) => Connection[]",
          "isInSelectionMode: boolean",
          "setSelectionMode: (enabled) => void",
        ],
        calls: ["handCalcInstances.getInstances()"],
        expanded: false,
      },
    },

    {
      id: "handCalcGeometryLink",
      type: "custom",
      position: { x: 700, y: 740 },
      data: {
        label: "handCalcGeometryLink",
        description: "Links HandCalc instances ↔ geometry selections",
        level: 6,
        expanded: false,
        exposes: [
          "linkCurrentSelection: () => void",
          "loadInstanceSelection: (instanceId) => void",
          "hasLinkedSelection: (instanceId) => boolean",
        ],
        calls: [
          "handCalcInstances.getSelectedInstance()",
          "selectionState.getSelectedFaces()",
          "selectionState.getSelectedEdges()",
          "selectionState.getSelectedBodies()",
          "selectionState.loadSelections()",
          "selectionPersistence.saveSelections()",
          "selectionPersistence.loadSelections()",
        ],
        expanded: false,
      },
    },

    // // LEVEL 7: UI State Management
    {
      id: "leftSidebarState",
      type: "custom",
      position: { x: 1000, y: 740 },
      data: {
        label: "leftSidebarState",
        description: "Left sidebar UI orchestration",
        level: 7,
        expanded: false,
        exposes: [
          "getSidebarData: () => SidebarData",
          "handleInstanceClick: (index) => void",
          "handleVariableClick: (instanceId, variable) => void",
          "isInputFocused: boolean",
        ],
        calls: [
          "handCalcInstances.getInstances()",
          "handCalcInstances.getSelectedIndex()",
          "handCalcInstances.selectInstance()",
          "handCalcConnections.getConnections()",
          "handCalcConnections.isInSelectionMode()",
        ],
        expanded: false,
      },
    },

    {
      id: "rightSidebarState",
      type: "custom",
      position: { x: 1300, y: 740 },
      data: {
        label: "rightSidebarState",
        description: "Right sidebar UI state",
        level: 7,
        expanded: false,
        exposes: [
          "isCollapsed: boolean",
          "toggle: () => void",
          "collapse: () => void",
          "expand: () => void",
        ],
        calls: [],
        expanded: false,
      },
    },

    // COMPONENTS - Memoized UI components
    {
      id: "leftSidebar",
      type: "custom",
      position: { x: 200, y: 880 },
      data: {
        label: "LeftSidebar",
        description: "Memoized HandCalc/FEA sidebar",
        type: "component",
        level: 8,
        expanded: false,
        exposes: ["JSX.Element (memoized)"],
        calls: [
          "leftSidebarState.getSidebarData()",
          "leftSidebarState.handleInstanceClick()",
          "leftSidebarState.handleVariableClick()",
          "leftSidebarState.isInputFocused",
        ],
        expanded: false,
      },
    },

    {
      id: "vtkViewer",
      type: "custom",
      position: { x: 600, y: 880 },
      data: {
        label: "VTKViewer",
        description: "Memoized 3D viewport component",
        type: "component",
        level: 8,
        expanded: false,
        exposes: ["JSX.Element (memoized)"],
        calls: [
          "projectFiles.isLoading",
          "projectFiles.error",
          "selectionState.getSelectionCount()",
          "selectionState.getSelectionMode()",
          "selectionState.getHoveredId()",
        ],
        expanded: false,
      },
    },

    {
      id: "rightSidebar",
      type: "custom",
      position: { x: 1000, y: 880 },
      data: {
        label: "RightSidebar",
        description: "Memoized pinned equations sidebar",
        type: "component",
        level: 8,
        expanded: false,
        exposes: ["JSX.Element (memoized)"],
        calls: [
          "rightSidebarState.isCollapsed",
          "projectFiles.projectID",
          "projectFiles.version",
          "handCalcInstances.getInstances()",
          "handCalcInstances.getSelectedIndex()",
        ],
        expanded: false,
      },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    // Level 1 → Level 2: Data dependencies (blue, animated)
    {
      id: "e1",
      source: "projectFiles",
      target: "polyDataProcessing",
      animated: true,
      label: "files",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },
    {
      id: "e2",
      source: "projectFiles",
      target: "geometryMappings",
      animated: true,
      label: "geometryInfo",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },
    {
      id: "e3",
      source: "projectFiles",
      target: "inferenceEngine",
      animated: true,
      label: "projectID",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },
    {
      id: "e4",
      source: "projectFiles",
      target: "inferenceResults",
      animated: true,
      label: "projectID",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },

    // Level 2A internal dependencies
    {
      id: "e5",
      source: "polyDataProcessing",
      target: "lookupTables",
      animated: true,
      label: "polyData",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },
    {
      id: "e6",
      source: "inferenceEngine",
      target: "inferenceResults",
      animated: true,
      label: "isComplete",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },

    // Level 2 → Level 3: VTK data flow
    {
      id: "e7",
      source: "polyDataProcessing",
      target: "vtkRenderer",
      animated: true,
      label: "polyData",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },

    // Level 3 → Level 4: Selection orchestration data flow
    {
      id: "e8",
      source: "projectFiles",
      target: "selectionPersistence",
      animated: true,
      label: "projectID",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#3b82f6" },
    },

    // Method calls between hooks (red, dashed)

    // Selection Visualizer calls VTK and lookup methods
    {
      id: "m1",
      source: "selectionVisualizer",
      target: "vtkRenderer",
      label: "highlightCells()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m2",
      source: "selectionVisualizer",
      target: "lookupTables",
      label: "getCellsForFace()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m3",
      source: "selectionVisualizer",
      target: "selectionState",
      label: "getSelectedFaces()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },

    // Interaction handlers call multiple hooks
    {
      id: "m4",
      source: "interactionHandlers",
      target: "vtkRenderer",
      label: "pickCellAtCoordinate()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m5",
      source: "interactionHandlers",
      target: "lookupTables",
      label: "getFaceIdForCell()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m6",
      source: "interactionHandlers",
      target: "selectionState",
      label: "toggleFaceSelection()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m7",
      source: "interactionHandlers",
      target: "selectionVisualizer",
      label: "updateSelectionVisuals()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },

    // Selection persistence calls selection state
    {
      id: "m8",
      source: "selectionPersistence",
      target: "selectionState",
      label: "getSelectedFaces()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },

    // HandCalc geometry link calls selection methods
    {
      id: "m9",
      source: "handCalcGeometryLink",
      target: "selectionState",
      label: "getSelectedFaces()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m10",
      source: "handCalcGeometryLink",
      target: "selectionPersistence",
      label: "saveSelections()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m11",
      source: "handCalcGeometryLink",
      target: "handCalcInstances",
      label: "getSelectedInstance()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },

    // HandCalc connections call instances
    {
      id: "m12",
      source: "handCalcConnections",
      target: "handCalcInstances",
      label: "getInstances()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },

    // UI state hooks call domain hooks
    {
      id: "m13",
      source: "leftSidebarState",
      target: "handCalcInstances",
      label: "getInstances()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },
    {
      id: "m14",
      source: "leftSidebarState",
      target: "handCalcConnections",
      label: "getConnections()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#dc2626", strokeDasharray: "5 5" },
    },

    // Component prop dependencies (gold, thick)
    {
      id: "c1",
      source: "leftSidebarState",
      target: "leftSidebar",
      label: "getSidebarData()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c2",
      source: "selectionState",
      target: "vtkViewer",
      label: "getSelectionCount()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c3",
      source: "projectFiles",
      target: "vtkViewer",
      label: "isLoading",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c4",
      source: "rightSidebarState",
      target: "rightSidebar",
      label: "isCollapsed",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c5",
      source: "handCalcInstances",
      target: "rightSidebar",
      label: "getInstances()",
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#f59e0b", strokeWidth: 2 },
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
            data: { ...n.data, expanded: !n.data.expanded },
          };
        }
        return n;
      })
    );
  }, []);

  return (
    <Container>
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
        <Background gap={25} />
        <Controls />
        <MiniMap />
        {/* 
        <LevelLabel style={{ top: 50 }}>Level 1: Core Project Data</LevelLabel>
        <LevelLabel style={{ top: 180 }}>Level 2: Data Processing & ML</LevelLabel>
        <LevelLabel style={{ top: 320 }}>Level 3: VTK Rendering (High-Level API)</LevelLabel>
        <LevelLabel style={{ top: 460 }}>Level 4: Selection Orchestration</LevelLabel>
        <LevelLabel style={{ top: 600 }}>Level 5: Interaction Handling</LevelLabel>
        <LevelLabel style={{ top: 740 }}>Level 6-7: HandCalc & UI State</LevelLabel>
        <LevelLabel style={{ top: 880 }}>Memoized Components</LevelLabel> */}
      </ReactFlow>

      <Legend>
        <h4 style={{ margin: "0 0 12px 0" }}>Architecture Legend</h4>
        <LegendItem>
          <div
            style={{
              width: "24px",
              height: "4px",
              backgroundColor: "#3b82f6",
              marginRight: "10px",
            }}
          ></div>
          Data Dependencies (blue, animated)
        </LegendItem>
        <LegendItem>
          <div
            style={{
              width: "24px",
              height: "2px",
              backgroundColor: "#dc2626",
              marginRight: "10px",
              borderStyle: "dashed",
              borderWidth: "1px 0",
            }}
          ></div>
          Method Calls (red, dashed)
        </LegendItem>
        <LegendItem>
          <div
            style={{
              width: "24px",
              height: "4px",
              backgroundColor: "#f59e0b",
              marginRight: "10px",
            }}
          ></div>
          Component Props (gold, thick)
        </LegendItem>
        <LegendItem>
          <LegendColor $color="#f59e0b" />
          Memoized React Components
        </LegendItem>
        <hr style={{ margin: "12px 0 8px 0" }} />
        <div style={{ fontSize: "10px", opacity: 0.8 }}>
          <strong>Key Insight:</strong> Hooks expose methods, not raw data.
          <br />
          This prevents multiple references and improves encapsulation.
        </div>
      </Legend>

      <KeyInsights>
        <h3>Improved Architecture Benefits</h3>
        <InsightsList>
          <li>
            <strong>High-Level VTK API:</strong> vtkRenderer.highlightCells() vs
            raw VTK objects
          </li>
          <li>
            <strong>Method-Only Interfaces:</strong>{" "}
            lookupTables.getCellsForFace() hides internal Maps
          </li>
          <li>
            <strong>Clean Separation:</strong> Selection state has zero VTK
            knowledge
          </li>
          <li>
            <strong>Simplified Visualizers:</strong> Just orchestrate method
            calls, no complex logic
          </li>
          <li>
            <strong>Perfect Encapsulation:</strong> Each hook's internals are
            completely hidden
          </li>
          <li>
            <strong>Easy Testing:</strong> Mock methods, not complex data
            structures
          </li>
          <li>
            <strong>Reusable Logic:</strong> Selection state works without VTK,
            HandCalc, or UI
          </li>
        </InsightsList>
      </KeyInsights>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--theme-darkBgPrimary);
`;

const KeyInsights = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 280px;

  h3 {
    margin: 0 0 12px 0;
    color: var(--text-primary);
    font-size: 14px;
  }
`;

const InsightsList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-primary);

  li {
    margin-bottom: 6px;
  }

  strong {
    color: #667eea;
  }
`;

export default MethodCallArchitecture;
