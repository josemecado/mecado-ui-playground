import React from "react";
import { Node } from "@xyflow/react";
import { GeoNodeData } from "./GeoNode";

export const mockNodes: Node<GeoNodeData>[] = [
  {
    id: "preprocessing",
    type: "geoNode",
    position: { x: 100, y: 200 },
    data: {
      title: "Preprocessing",
      label: "STEP Import",
      status: "complete",
      statusColor: "#4caf50",
      edges: [
        { targetId: "meshing", label: "Clean Geometry", animated: true }
      ],
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
    position: { x: 750, y: 200 },
    data: {
      title: "Mesh Generation",
      label: "Tetrahedral Mesh",
      status: "processing",
      statusColor: "#2196f3",
      edges: [],
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
                <div style={{ color: "#2196f3", fontWeight: "600" }}>
                  ⟳ Processing
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  Estimated time: 15s
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
                      width: "45%",
                      background: "#2196f3",
                      height: "100%",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                <strong>Method:</strong> Tetrahedral
              </div>
              <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                <strong>Quality:</strong> High (refined)
              </div>
              <div style={{ color: "var(--text-primary)" }}>
                <strong>Target Size:</strong> 2.5mm
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
                  <div>• Elements: Calculating...</div>
                  <div>• Nodes: Calculating...</div>
                  <div>• Average size: 2.5mm</div>
                </div>
              </div>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
                  Quality Metrics
                </div>
                <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
                  <div>• Min angle: Pending</div>
                  <div>• Max aspect ratio: Pending</div>
                  <div>• Skewness: Pending</div>
                </div>
              </div>
              <div
                style={{
                  padding: "8px",
                  background: "var(--bg-tertiary)",
                  borderRadius: "4px",
                  color: "var(--text-muted)",
                  fontSize: "11px",
                }}
              >
                Results will be available once meshing completes
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
                  id="mesh-pattern"
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
                fill="url(#mesh-pattern)"
              />
            </svg>
            <div
              style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}
            >
              Generating Mesh...
            </div>
          </div>
        ),
      },
    } as GeoNodeData,
  },
];