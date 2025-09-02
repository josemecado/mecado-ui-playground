// mockData.ts

import { Node, Edge, MarkerType } from "@xyflow/react";

export interface GeometryFile {
  name: string;
  size: string;
}

export interface Equation {
  name: string;
  latex: string;
}

export interface AssociatedFile {
  name: string;
  type: 'pdf' | 'xlsx' | 'docx' | 'pptx';
}

export interface EdgeConfig {
  targetId: string;
  label?: string;
  animated?: boolean;
}

export interface ProjectVersion {
  id: string;
  title: string;
  parentVersion: string | null;
  createdAt: string;
  geometries: GeometryFile[];
  equations: Equation[];
  files: AssociatedFile[];
  edges?: EdgeConfig[];
}

// Simplified to 3 versions with edge configurations
export const projectVersions: ProjectVersion[] = [
  {
    id: "v1",
    title: "v1 - Initial Design",
    parentVersion: null,
    createdAt: "2024-01-15",
    geometries: [
      { name: "main_assembly.step", size: "2.4MB" },
      { name: "bracket.step", size: "450KB" }
    ],
    equations: [
      { name: "Stress Analysis", latex: "\\sigma = \\frac{F}{A}" },
      { name: "Deflection", latex: "\\delta = \\frac{PL^3}{3EI}" }
    ],
    files: [
      { name: "requirements.pdf", type: "pdf" },
      { name: "analysis_report.docx", type: "docx" }
    ],
    edges: [
      { targetId: "v2", label: "Optimized", animated: true }
    ]
  },
  {
    id: "v2",
    title: "v2 - Weight Optimization",
    parentVersion: "v1",
    createdAt: "2024-01-22",
    geometries: [
      { name: "main_assembly_v2.step", size: "2.1MB" },
      { name: "bracket_optimized.step", size: "380KB" }
    ],
    equations: [
      { name: "Stress Analysis", latex: "\\sigma = \\frac{F}{A}" },
      { name: "Weight Reduction", latex: "W_{new} = W_{old} \\times 0.85" },
      { name: "Safety Factor", latex: "SF = \\frac{\\sigma_{yield}}{\\sigma_{max}}" }
    ],
    files: [
      { name: "optimization_results.xlsx", type: "xlsx" },
      { name: "fea_results.pdf", type: "pdf" }
    ],
    edges: [
      { targetId: "v3", label: "Material Update", animated: true }
    ]
  },
  {
    id: "v3",
    title: "v3 - Production Ready",
    parentVersion: "v2",
    createdAt: "2024-02-01",
    geometries: [
      { name: "main_assembly_v3.step", size: "2.2MB" },
      { name: "bracket_titanium.step", size: "390KB" }
    ],
    equations: [
      { name: "Thermal Expansion", latex: "\\Delta L = \\alpha L \\Delta T" },
      { name: "Fatigue Life", latex: "N_f = \\frac{C}{(\\Delta\\sigma)^m}" }
    ],
    files: [
      { name: "material_properties.pdf", type: "pdf" },
      { name: "cost_analysis.xlsx", type: "xlsx" }
    ],
    edges: [] // Final version, no outgoing edges
  }
];

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

// Generate initial nodes for React Flow
export const generateNodes = (versions: ProjectVersion[]): Node[] => {
  return versions.map((version, index) => ({
    id: version.id,
    type: 'versionNode',
    position: {
      x: index * 350,
      y: 100
    },
    data: version
  }));
};

// Generate edges from node data (like GeometryFlow)
export const generateEdges = (nodes: Node[]): Edge[] => {
  const edges: Edge[] = [];

  nodes.forEach((node) => {
    const nodeData = node.data as ProjectVersion;
    if (nodeData.edges) {
      nodeData.edges.forEach((edgeConfig) => {
        edges.push({
          id: `${node.id}-${edgeConfig.targetId}`,
          source: node.id,
          target: edgeConfig.targetId,
          animated: edgeConfig.animated ?? false,
          label: edgeConfig.label,
          labelStyle: {
            fill: "var(--text-primary)",
            fontWeight: 500,
            fontSize: 11,
          },
          labelBgStyle: {
            fill: "var(--bg-secondary)",
            stroke: "var(--border-bg)",
            strokeWidth: 1,
          },
          style: {
            stroke: "var(--primary-action)",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--primary-action)",
            width: 20,
            height: 20,
          },
        });
      });
    }
  });

  return edges;
};