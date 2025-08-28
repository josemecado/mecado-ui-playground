import React from "react";
import { Node } from "@xyflow/react";
import { GeoNodeData } from "../GeoNode";

// Import all the panel content creators
import {
  createEmptyGeometryUI,
  createPreprocessingStatusPanel,
  createPreprocessingResultsPanel,
  createPreprocessingMaterialsPanel,
  createMeshingStatusPanel,
  createMeshingResultsPanel,
  createMeshingMaterialsPanel
} from "./mockNodeContent";

// ============= MOCK NODES DATA =============
export const mockNodes: Node<GeoNodeData>[] = [
  {
    id: "preprocessing",
    type: "geoNode",
    position: { x: 100, y: 100 },
    data: {
      title: "Preprocessing",
      geoLabel: "STEP Import",
      status: "complete",
      edges: [
        { targetId: "meshing", label: "Clean Geometry", animated: true }
      ],
      panels: [
        {
          id: "status",
          title: "Status",
          panelContent: createPreprocessingStatusPanel(),
        },
        {
          id: "results",
          title: "Results",
          panelContent: createPreprocessingResultsPanel(),
        },
        {
          id: "materials",
          title: "Materials",
          panelContent: createPreprocessingMaterialsPanel(),
        },
      ],
      geometry: {
        id: "geo1",
        renderContent: createEmptyGeometryUI,
        placeholder: "Geometry Preview"
      },
    } as GeoNodeData,
  },
  {
    id: "meshing",
    type: "geoNode",
    position: { x: 300, y: 700 },
    data: {
      title: "Mesh Generation",
      geoLabel: "Tetrahedral Mesh",
      status: "processing",
      color: "#2196f3",
      edges: [],
      panels: [
        {
          id: "status",
          title: "Status",
          panelContent: createMeshingStatusPanel(),
        },
        {
          id: "results",
          title: "Results",
          panelContent: createMeshingResultsPanel(),
        },
        {
          id: "materials",
          title: "Materials",
          panelContent: createMeshingMaterialsPanel(),
        },
      ],
      geometry: {
        id: "geo2",
        renderContent: createEmptyGeometryUI,
        placeholder: "Mesh Preview"
      },
    } as GeoNodeData,
  },
];