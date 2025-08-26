import React, { useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GeoNode, GeoNodeData } from "./GeoNode";

const nodeTypes = {
  geoNode: GeoNode,
};

export const GeometryFlow: React.FC = () => {
  const initialNodes: Node<GeoNodeData>[] = [
    {
      id: "preprocessing",
      type: "geoNode",
      position: { x: 100, y: 100 },
      data: {
        title: "Preprocessing",
        label: "STEP Import", // Optional label for canvas
        status: "complete",
        panels: [
          {
            id: "status",
            title: "Status",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
                    ✓ Complete
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Execution time: 3.2s
                  </div>
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                  <strong>Input:</strong> assembly.step (18.4 MB)
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                  <strong>Bodies:</strong> 12 solid bodies
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  <strong>Last modified:</strong> 2 min ago
                </div>
              </div>
            ),
          },
          {
            id: "results",
            title: "Results",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                    Geometry Cleanup
                  </div>
                  <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                    <div>• Small features: 234 removed</div>
                    <div>• Sliver faces: 89 merged</div>
                    <div>• Duplicate vertices: 1,247 merged</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                    Simplification
                  </div>
                  <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                    <div>• Original: 45,892 faces</div>
                    <div>• Simplified: 12,341 faces</div>
                    <div>• Reduction: 73%</div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "materials",
            title: "Materials",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
                  Not configured
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  Materials will be assigned in the next step
                </div>
              </div>
            ),
          },
        ],
        geometry: {
          id: "geo1",
          type: "step",
          renderContent: () => (
            <div style={{ textAlign: "center" }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <rect
                  x="20"
                  y="20"
                  width="80"
                  height="80"
                  fill="var(--bg-tertiary)"
                  stroke="var(--accent-primary)"
                  strokeWidth="2"
                  rx="4"
                />
                <rect
                  x="30"
                  y="30"
                  width="60"
                  height="60"
                  fill="var(--bg-secondary)"
                  stroke="var(--primary-action)"
                  strokeWidth="1"
                  rx="2"
                />
                <circle cx="60" cy="60" r="15" fill="var(--primary-action)" />
              </svg>
              <div
                style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}
              >
                Simplified Geometry
              </div>
            </div>
          ),
        },
      } as GeoNodeData,
    },
    {
      id: "meshing",
      type: "geoNode",
      position: { x: 750, y: 100 },
      data: {
        title: "Mesh Generation",
        label: "Tetrahedral Mesh",
        status: "complete",
        panels: [
          {
            id: "status",
            title: "Status",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ color: "var(--accent-primary)", fontWeight: "600" }}>
                    ✓ Complete
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Execution time: 12.7s
                  </div>
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                  <strong>Method:</strong> Tetrahedral
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                  <strong>Quality:</strong> High (refined)
                </div>
                <div style={{ color: "var(--text-primary)" }}>
                  <strong>Convergence:</strong> 3 iterations
                </div>
              </div>
            ),
          },
          {
            id: "results",
            title: "Results",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                    Mesh Statistics
                  </div>
                  <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                    <div>• Elements: 487,234</div>
                    <div>• Nodes: 98,456</div>
                    <div>• Average size: 2.5mm</div>
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                    Quality Metrics
                  </div>
                  <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                    <div>• Min angle: 18.2°</div>
                    <div>• Max aspect ratio: 6.8</div>
                    <div>• Skewness: 0.12 avg</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                    border: "1px solid var(--error)"
                  }}
                >
                  <div
                    style={{
                      color: "var(--error)",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    ⚠ 12 elements below quality threshold
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: "materials",
            title: "Materials",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
                  Assigned Materials
                </div>
                <div
                  style={{
                    marginBottom: "8px",
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>Aluminum 6061-T6</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    <div>E: 68.9 GPa</div>
                    <div>ν: 0.33</div>
                    <div>ρ: 2700 kg/m³</div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>Steel AISI 304</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    <div>E: 193 GPa</div>
                    <div>ν: 0.29</div>
                    <div>ρ: 8000 kg/m³</div>
                  </div>
                </div>
              </div>
            ),
          },
        ],
        geometry: {
          id: "geo2",
          type: "mesh",
          renderContent: () => (
            <div style={{ textAlign: "center" }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <pattern
                    id="mesh"
                    x="0"
                    y="0"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 0 0 L 10 0 L 5 8.66 Z"
                      stroke="var(--text-muted)"
                      strokeWidth="0.5"
                      fill="none"
                    />
                  </pattern>
                </defs>
                <rect
                  x="10"
                  y="10"
                  width="100"
                  height="100"
                  fill="url(#mesh)"
                />
              </svg>
              <div
                style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}
              >
                Mesh Generated
              </div>
            </div>
          ),
        },
      } as GeoNodeData,
    },
    {
      id: "fea-analysis",
      type: "geoNode",
      position: { x: 400, y: 400 },
      data: {
        title: "Static Structural",
        label: "FEA Solver",
        status: "processing",
        panels: [
          {
            id: "status",
            title: "Status",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div
                  style={{
                    marginBottom: "12px",
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ color: "var(--primary-action)", fontWeight: "600" }}>
                    ⟳ Running
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Progress: 67%
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      background: "var(--bg-secondary)",
                      height: "4px",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: "67%",
                        background: "var(--primary-action)",
                        height: "100%",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                  <strong>Solver:</strong> Direct sparse
                </div>
                <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                  <strong>Iteration:</strong> 8 of 12
                </div>
                <div style={{ color: "var(--text-primary)" }}>
                  <strong>Residual:</strong> 1.2e-4
                </div>
              </div>
            ),
          },
          {
            id: "results",
            title: "Results",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                    Preliminary Results
                  </div>
                  <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                    <div>• Max displacement: 0.82mm</div>
                    <div>• Max von Mises: 234 MPa</div>
                    <div>• Safety factor: 1.8</div>
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                    Boundary Conditions
                  </div>
                  <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                    <div>• Fixed: 4 surfaces</div>
                    <div>• Force: 1000N distributed</div>
                    <div>• Pressure: 2 MPa on top</div>
                  </div>
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  Full results available after completion
                </div>
              </div>
            ),
          },
          {
            id: "materials",
            title: "Materials",
            content: (
              <div style={{ fontSize: "12px" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
                  Active Materials
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>Aluminum 6061-T6</span>
                    <span style={{ color: "var(--accent-primary)" }}>✓</span>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px",
                      background: "var(--bg-tertiary)",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>Steel AISI 304</span>
                    <span style={{ color: "var(--accent-primary)" }}>✓</span>
                  </div>
                </div>
                <div
                  style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)" }}
                >
                  Temperature: 22°C (room temp)
                </div>
              </div>
            ),
          },
        ],
        geometry: {
          id: "geo3",
          type: "custom",
          renderContent: () => (
            <div style={{ textAlign: "center" }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <linearGradient
                    id="stress"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "var(--primary-action)", stopOpacity: 1 }}
                    />
                    <stop
                      offset="50%"
                      style={{ stopColor: "var(--primary-alternate)", stopOpacity: 1 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "var(--error)", stopOpacity: 1 }}
                    />
                  </linearGradient>
                </defs>
                <rect
                  x="20"
                  y="20"
                  width="80"
                  height="80"
                  fill="url(#stress)"
                  rx="4"
                />
                <text
                  x="60"
                  y="115"
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--text-muted)"
                >
                  Stress Distribution
                </text>
              </svg>
            </div>
          ),
        },
      } as GeoNodeData,
    },
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "preprocessing", target: "meshing", animated: true },
    { id: "e2-3", source: "meshing", target: "fea-analysis", animated: true },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", background: "var(--bg-primary)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={35} size={2} color="var(--border-bg)" />
      </ReactFlow>
    </div>
  );
};