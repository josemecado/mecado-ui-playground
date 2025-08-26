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

// Keep all the styled components as-is...
const NodeContainer = styled.div<{
  $level: number;
  $type: "hook" | "component";
}>`
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  min-width: 150px;
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
      "#724cf9", // Level 3 - Selection
      "#3da35d", // Level 4 - VTK
      "#ff8500", // Level 5 - Interaction
      "#30cfd0", // Level 6 - Persistence
      "#e91e63", // Level 7 - HandCalc
      "#ffd60a", // Level 8 - UI Controllers
    ];
    return colors[props.$level - 1] || colors[7];
  }};
  padding: 6px 8px;
  color: white;
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

const Legend = styled.div<{ $collapsed?: boolean }>`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: ${(props) => (props.$collapsed ? "12px" : "16px")};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: ${(props) => (props.$collapsed ? "150px" : "300px")};
  cursor: pointer;
  transition: all 0.3s ease;
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
      {/* Add handles on all sides for flexible routing */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />

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
              {/* Dependencies Section */}
              {data.dependencies && data.dependencies.length > 0 && (
                <>
                  <SectionTitle>Dependencies:</SectionTitle>
                  {data.dependencies.map((dep: string, idx: number) => (
                    <MethodItem key={idx} $type="calls">
                      {dep}
                    </MethodItem>
                  ))}
                </>
              )}

              {/* Exposed Methods with Callers */}
              {data.methods && data.methods.length > 0 && (
                <>
                  <SectionTitle>Exposed Methods:</SectionTitle>
                  {data.methods.map((method: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: "4px" }}>
                      <MethodItem $type="exposes">{method.name}</MethodItem>
                      {method.calledBy && method.calledBy.length > 0 && (
                        <div
                          style={{
                            marginLeft: "12px",
                            fontSize: "8px",
                            color: "var(--text-muted)",
                          }}
                        >
                          ← {method.calledBy.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Connected Hooks Summary */}
              {data.connections && (
                <div
                  style={{
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--bg-tertiary)",
                  }}
                >
                  <SectionTitle>Connections:</SectionTitle>
                  {data.connections.upstream &&
                    data.connections.upstream.length > 0 && (
                      <div
                        style={{ fontSize: "9px", color: "var(--text-muted)" }}
                      >
                        ↑ Upstream: {data.connections.upstream.join(", ")}
                      </div>
                    )}
                  {data.connections.downstream &&
                    data.connections.downstream.length > 0 && (
                      <div
                        style={{ fontSize: "9px", color: "var(--text-muted)" }}
                      >
                        ↓ Downstream: {data.connections.downstream.join(", ")}
                      </div>
                    )}
                </div>
              )}
            </MethodsList>
          )}
        </NodeBody>
      </NodeContainer>

      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
    </>
  );
};

const MethodCallArchitecture: React.FC = () => {
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

const [nodes, setNodes] = useState<Node[]>([
  // LEVEL 1: Core Context (unchanged)
  {
    id: "projectFiles",
    type: "custom",
    position: { x: 500, y: 50 },
    data: {
      label: "projectFiles",
      description: "Project metadata & file management",
      level: 1,
      expanded: false,
      dependencies: [],
      methods: [
        {
          name: "projectID",
          calledBy: ["mlInference", "handCalcInstances"],
        },
        {
          name: "version",
          calledBy: ["mlInference", "handCalcInstances"],
        },
        { name: "files", calledBy: ["polyDataProcessing"] },
        { name: "geometryInfo", calledBy: ["geometryMappings"] },
        {
          name: "isReady",
          calledBy: ["polyDataProcessing", "geometryMappings"],
        },
      ],
      connections: {
        upstream: [],
        downstream: [
          "polyDataProcessing",
          "geometryMappings",
          "mlInference",
          "handCalcInstances",
        ],
      },
    },
  },

  // LEVEL 2: Data Processing (unchanged)
  {
    id: "polyDataProcessing",
    type: "custom",
    position: { x: 150, y: 180 },
    data: {
      label: "polyDataProcessing",
      description: "Raw geometry → VTK polyData",
      level: 2,
      expanded: false,
      dependencies: ["projectFiles.files", "projectFiles.isReady"],
      methods: [
        { name: "polyData", calledBy: ["lookupTables", "vtkRenderer"] },
        { name: "isProcessed", calledBy: ["lookupTables", "vtkRenderer"] },
      ],
      connections: {
        upstream: ["projectFiles"],
        downstream: ["lookupTables", "vtkRenderer"],
      },
    },
  },

  {
    id: "lookupTables",
    type: "custom",
    position: { x: 375, y: 180 },
    data: {
      label: "lookupTables",
      description: "ID ↔ Cell mapping (for VTK picking)",
      level: 2,
      expanded: false,
      dependencies: [
        "polyDataProcessing.polyData",
        "polyDataProcessing.isProcessed",
      ],
      methods: [
        { name: "getCellsForFace", calledBy: ["vtkRenderer"] },
        { name: "getCellsForEdge", calledBy: ["vtkRenderer"] },
        { name: "getCellsForBody", calledBy: ["vtkRenderer"] },
        { name: "getFaceIdForCell", calledBy: ["vtkRenderer"] },
        { name: "getEdgeIdForCell", calledBy: ["vtkRenderer"] },
        { name: "getBodyIdForCell", calledBy: ["vtkRenderer"] },
        { name: "isTablesReady", calledBy: ["vtkRenderer"] },
      ],
      connections: {
        upstream: ["polyDataProcessing"],
        downstream: ["vtkRenderer"],
      },
    },
  },

  {
    id: "geometryMappings",
    type: "custom",
    position: { x: 625, y: 180 },
    data: {
      label: "geometryMappings",
      description: "STEP ↔ Ansys ID mappings",
      level: 2,
      expanded: false,
      dependencies: ["projectFiles.geometryInfo"],
      methods: [
        { name: "loadMappings", calledBy: ["main component effect"] },
        { name: "toMechanicalId", calledBy: ["selectionState"] },
        { name: "toDiscoveryId", calledBy: ["selectionState"] },
        {
          name: "isMappingsReady",
          calledBy: ["selectionState", "main component"],
        },
      ],
      connections: {
        upstream: ["projectFiles"],
        downstream: ["selectionState"],
      },
    },
  },

  {
    id: "mlInference",
    type: "custom",
    position: { x: 850, y: 180 },
    data: {
      label: "mlInference",
      description: "ML inference execution & results",
      level: 2,
      expanded: false,
      dependencies: ["projectFiles.projectID", "projectFiles.version"],
      methods: [
        { name: "runInference", calledBy: ["UI buttons"] },
        { name: "isRunning", calledBy: ["UI components"] },
        { name: "isReady", calledBy: ["UI components"] },
        { name: "getElementLabels", calledBy: ["VTKViewer component"] },
        { name: "getBestLabel", calledBy: ["VTKViewer component"] },
      ],
      connections: {
        upstream: ["projectFiles"],
        downstream: ["UI components"],
      },
    },
  },

  // LEVEL 3: Selection State - UPDATED with focus management
  {
    id: "selectionState",
    type: "custom",
    position: { x: 350, y: 320 },
    data: {
      label: "selectionState",
      description: "Single source of truth for selections & focus",
      level: 3,
      expanded: false,
      dependencies: ["geometryMappings (optional for debug)"],
      methods: [
        // Active selections
        { name: "selectedFaces", calledBy: ["vtkRenderer"] },
        { name: "selectedEdges", calledBy: ["vtkRenderer"] },
        { name: "selectedBodies", calledBy: ["vtkRenderer"] },
        
        // NEW: Focused geometry
        { name: "focusedFaces", calledBy: ["vtkRenderer"] },
        { name: "focusedEdges", calledBy: ["vtkRenderer"] },
        { name: "focusedBodies", calledBy: ["vtkRenderer"] },
        
        // Hover and mode
        { name: "hoveredElement", calledBy: ["vtkRenderer", "VTKViewer"] },
        { name: "mode", calledBy: ["vtkRenderer", "interactionManager", "VTKViewer"] },
        
        // Event handlers
        { name: "onElementClick", calledBy: ["interactionManager"] },
        { name: "onElementHover", calledBy: ["interactionManager"] },
        { name: "onModeChange", calledBy: ["interactionManager"] },
        { name: "onClearAll", calledBy: ["interactionManager"] },
        
        // NEW: Focus management
        { name: "setFocusedGeometry", calledBy: ["geometryFocusManager"] },
        { name: "clearFocusedGeometry", calledBy: ["geometryFocusManager"] },
        
        // Snapshot operations
        { name: "loadSnapshot", calledBy: ["persistence (if needed)"] },
        { name: "getSnapshot", calledBy: ["persistence (if needed)"] },
      ],
      connections: {
        upstream: ["geometryMappings"],
        downstream: ["vtkRenderer", "interactionManager", "geometryFocusManager"],
      },
    },
  },

  // LEVEL 4: VTK Renderer - UPDATED to handle focused geometry
  {
    id: "vtkRenderer",
    type: "custom",
    position: { x: 700, y: 420 },
    data: {
      label: "vtkRenderer",
      description: "Autonomous VTK - renders selected & focused geometry",
      level: 4,
      expanded: false,
      dependencies: [
        "vtkContainerRef",
        "polyDataProcessing.polyData",
        "lookupTables (all methods)",
        // Active selections
        "selectionState.selectedFaces",
        "selectionState.selectedEdges",
        "selectionState.selectedBodies",
        // Focused geometry
        "selectionState.focusedFaces",
        "selectionState.focusedEdges",
        "selectionState.focusedBodies",
        // Other
        "selectionState.hoveredElement",
        "selectionState.mode",
      ],
      methods: [
        { name: "getElementAt", calledBy: ["interactionManager"] },
        { name: "resetCamera", calledBy: ["UI buttons"] },
        { name: "isInitialized", calledBy: ["main component", "interactionManager"] },
      ],
      connections: {
        upstream: ["polyDataProcessing", "lookupTables", "selectionState"],
        downstream: ["interactionManager"],
      },
    },
  },

  // LEVEL 5: Interaction Manager (unchanged)
  {
    id: "interactionManager",
    type: "custom",
    position: { x: 350, y: 520 },
    data: {
      label: "interactionManager",
      description: "User input → selection events",
      level: 5,
      expanded: false,
      dependencies: [
        "vtkRenderer.getElementAt",
        "vtkRenderer.isInitialized",
        "selectionState.onElementClick",
        "selectionState.onElementHover",
        "selectionState.onModeChange",
        "selectionState.onClearAll",
        "selectionState.mode",
        "sidebarMode",
        "isSelectionEnabled()",
      ],
      methods: [
        { name: "handleMouseMove", calledBy: ["DOM event listener"] },
        { name: "handleClick", calledBy: ["DOM event listener"] },
        { name: "handleKeyPress", calledBy: ["DOM event listener"] },
      ],
      connections: {
        upstream: ["vtkRenderer", "selectionState"],
        downstream: ["DOM events"],
      },
    },
  },

  // LEVEL 6: NEW Geometry Focus Manager (replaces handCalcSelectionSync)
  {
    id: "geometryFocusManager",
    type: "custom",
    position: { x: 700, y: 620 },
    data: {
      label: "geometryFocusManager",
      description: "Generic focus manager for GeometrySelectable objects",
      level: 6,
      expanded: false,
      dependencies: [
        "selectionState.setFocusedGeometry",
        "selectionState.clearFocusedGeometry",
      ],
      methods: [
        { name: "focusOn", calledBy: ["main component useEffect", "future: message handlers"] },
        { name: "getFocusedItem", calledBy: ["UI components (if needed)"] },
      ],
      connections: {
        upstream: ["selectionState"],
        downstream: [],
      },
    },
  },

  // LEVEL 7: HandCalc Mode - UPDATED
  {
    id: "handCalcInstances",
    type: "custom",
    position: { x: 200, y: 750 },
    data: {
      label: "handCalcInstances",
      description: "HandCalc instance management",
      level: 7,
      expanded: false,
      dependencies: ["projectFiles.projectID", "projectFiles.version"],
      methods: [
        { name: "instances", calledBy: ["handCalcConnections", "leftSidebarController"] },
        { name: "selectedInstance", calledBy: ["main component useEffect → geometryFocusManager"] },
        { name: "selectedIndex", calledBy: ["leftSidebarController"] },
        { name: "select", calledBy: ["leftSidebarController"] },
      ],
      connections: {
        upstream: ["projectFiles"],
        downstream: ["handCalcConnections", "leftSidebarController", "geometryFocusManager (via useEffect)"],
      },
    },
  },

  {
    id: "handCalcConnections",
    type: "custom",
    position: { x: 500, y: 750 },
    data: {
      label: "handCalcConnections",
      description: "Variable connections",
      level: 7,
      expanded: false,
      dependencies: ["handCalcInstances.instances"],
      methods: [
        { name: "connections", calledBy: ["leftSidebarController", "auto-save effect"] },
        { name: "startConnection", calledBy: ["leftSidebarController"] },
        { name: "completeConnection", calledBy: ["leftSidebarController"] },
      ],
      connections: {
        upstream: ["handCalcInstances"],
        downstream: ["leftSidebarController"],
      },
    },
  },

  // LEVEL 8: UI Controllers (unchanged)
  {
    id: "leftSidebarController",
    type: "custom",
    position: { x: 300, y: 880 },
    data: {
      label: "leftSidebarController",
      description: "Left sidebar orchestration",
      level: 8,
      expanded: false,
      dependencies: [
        "sidebarMode",
        "handCalcInstances.instances",
        "handCalcInstances.selectedIndex",
        "handCalcConnections.connections",
        "handCalcInstances.select",
        "handCalcConnections.startConnection",
        "handCalcConnections.completeConnection",
      ],
      methods: [
        { name: "data", calledBy: ["LeftSidebar component"] },
        { name: "handlers", calledBy: ["LeftSidebar component"] },
      ],
      connections: {
        upstream: ["handCalcInstances", "handCalcConnections"],
        downstream: ["LeftSidebar"],
      },
    },
  },

  {
    id: "rightSidebarController",
    type: "custom",
    position: { x: 700, y: 880 },
    data: {
      label: "rightSidebarController",
      description: "Right sidebar state",
      level: 8,
      expanded: false,
      dependencies: ["projectFiles.projectID", "projectFiles.version"],
      methods: [
        { name: "isCollapsed", calledBy: ["RightSidebar component"] },
        { name: "data", calledBy: ["RightSidebar component"] },
      ],
      connections: {
        upstream: ["projectFiles"],
        downstream: ["RightSidebar"],
      },
    },
  },
]);

// Update edges to reflect new connections
const [edges, setEdges] = useState<Edge[]>([
  // Data flow edges (blue) - vertical connections between levels
  {
    id: "e1",
    source: "projectFiles",
    target: "polyDataProcessing",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e2",
    source: "projectFiles",
    target: "geometryMappings",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e3",
    source: "projectFiles",
    target: "mlInference",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e5",
    source: "polyDataProcessing",
    target: "vtkRenderer",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e6",
    source: "lookupTables",
    target: "vtkRenderer",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e7",
    source: "geometryMappings",
    target: "selectionState",
    style: { stroke: "#3b82f6", strokeDasharray: "5 5" },
  },

  // Same-level connections
  {
    id: "e4",
    source: "polyDataProcessing",
    sourceHandle: "right",
    target: "lookupTables",
    targetHandle: "left",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e8",
    source: "selectionState",
    sourceHandle: "right",
    target: "vtkRenderer",
    targetHandle: "left",
    animated: true,
    style: { stroke: "#3b82f6" },
  },
  {
    id: "e9",
    source: "handCalcInstances",
    sourceHandle: "right",
    target: "handCalcConnections",
    targetHandle: "left",
    style: { stroke: "#3b82f6" },
  },

  // Method call edges (red, dashed)
  {
    id: "m1",
    source: "interactionManager",
    target: "vtkRenderer",
    label: "getElementAt",
    style: { stroke: "#dc2626", strokeDasharray: "5 5" },
  },
  {
    id: "m2",
    source: "interactionManager",
    target: "selectionState",
    label: "event handlers",
    style: { stroke: "#dc2626", strokeDasharray: "5 5" },
  },
  
  // NEW: geometryFocusManager calling selectionState
  {
    id: "m3",
    source: "geometryFocusManager",
    target: "selectionState",
    label: "setFocusedGeometry",
    style: { stroke: "#dc2626", strokeDasharray: "5 5" },
  },
  
  // Indirect connection via useEffect
  {
    id: "m4",
    source: "handCalcInstances",
    target: "geometryFocusManager",
    label: "via useEffect",
    style: { stroke: "#9333ea", strokeDasharray: "5 5" }, // Purple for indirect
  },

  {
    id: "m5",
    source: "leftSidebarController",
    target: "handCalcInstances",
    style: { stroke: "#dc2626", strokeDasharray: "5 5" },
  },
  {
    id: "m6",
    source: "leftSidebarController",
    target: "handCalcConnections",
    style: { stroke: "#dc2626", strokeDasharray: "5 5" },
  },

      {
      id: "c1",
      source: "leftSidebarController",
      target: "leftSidebar",
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c2",
      source: "selectionState",
      target: "vtkViewer",
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c3",
      source: "projectFiles",
      target: "vtkViewer",
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },
    {
      id: "c4",
      source: "rightSidebarController",
      target: "rightSidebar",
      style: { stroke: "#f59e0b", strokeWidth: 2 },
    },

  // Component prop edges (gold) - if you add components back
]);

  // Rest of the component code remains the same...
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
        {/* <Controls /> */}
        {/* <MiniMap /> */}

        {/* Level Labels */}
        {/* <LevelLabel style={{ top: 50 }}>Level 1: Core Project Data</LevelLabel>
        <LevelLabel style={{ top: 180 }}>Level 2: Data Processing & ML</LevelLabel>
        <LevelLabel style={{ top: 320 }}>Level 3-4: Selection & VTK</LevelLabel>
        <LevelLabel style={{ top: 460 }}>Level 5: Interaction</LevelLabel>
        <LevelLabel style={{ top: 600 }}>Level 6-7: Persistence & HandCalc</LevelLabel>
        <LevelLabel style={{ top: 740 }}>Level 8: UI Controllers</LevelLabel>
        <LevelLabel style={{ top: 880 }}>React Components</LevelLabel> */}
      </ReactFlow>

      <Legend
        $collapsed={legendCollapsed}
        onClick={() => setLegendCollapsed(!legendCollapsed)}
      >
        <h4 style={{ margin: legendCollapsed ? "0" : "0 0 12px 0" }}>
          {legendCollapsed ? "Legend ▶" : "Architecture Legend"}
        </h4>
        {!legendCollapsed && (
          <>
            <LegendItem>
              <div
                style={{
                  width: "24px",
                  height: "4px",
                  backgroundColor: "#3b82f6",
                  marginRight: "10px",
                }}
              ></div>
              Data Dependencies (blue)
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
              Component Props (gold)
            </LegendItem>
            <hr style={{ margin: "12px 0 8px 0" }} />
            <div style={{ fontSize: "10px", opacity: 0.8 }}>
              <strong>Click nodes to expand</strong> and see dependencies,
              methods, and connections
            </div>
          </>
        )}
      </Legend>

      <KeyInsights
        $collapsed={insightsCollapsed}
        onClick={() => setInsightsCollapsed(!insightsCollapsed)}
      >
        <h3>{insightsCollapsed ? "Insights ▶" : "Simplified Architecture"}</h3>
        {!insightsCollapsed && (
          <InsightsList>
            <li>
              <strong>Event-Driven:</strong> Interactions trigger events, not
              direct manipulation
            </li>
            <li>
              <strong>Autonomous VTK:</strong> Watches state and auto-updates
              visualization
            </li>
            <li>
              <strong>Single Selection State:</strong> One source of truth for
              all selections
            </li>
            <li>
              <strong>Clean Interfaces:</strong> Simple data types (coordinates,
              IDs, flags)
            </li>
            <li>
              <strong>No Circular Dependencies:</strong> Clear one-way data flow
            </li>
          </InsightsList>
        )}
      </KeyInsights>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: var(--bg-primary);
`;

// Update the KeyInsights styled component
const KeyInsights = styled.div<{ $collapsed?: boolean }>`
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bg-secondary);
  padding: ${(props) => (props.$collapsed ? "12px" : "16px")};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: ${(props) => (props.$collapsed ? "150px" : "280px")};
  cursor: pointer;
  transition: all 0.3s ease;

  h3 {
    margin: 0 0 ${(props) => (props.$collapsed ? "0" : "12px")} 0;
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
