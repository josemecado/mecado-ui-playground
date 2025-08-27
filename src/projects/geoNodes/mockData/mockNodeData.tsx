import React from "react";
import { Node } from "@xyflow/react";
import { GeoNodeData } from "../GeoNode";

import { createPreprocessingStatusContent } from "./mockNodeContent";
import { createPreprocessingResultsContent } from "./mockNodeContent";
import { createMeshingStatusContent } from "./mockNodeContent";
import { createMeshingResultsContent } from "./mockNodeContent";
import { createMaterialsContent } from "./mockNodeContent";
import { createStepGeometry } from "./mockNodeContent";
import { createMeshGeometry } from "./mockNodeContent";
import { createEmptyMaterialsContent } from "./mockNodeContent";
// ============= MOCK DATA =============

const materials = [
  { name: "Aluminum 6061-T6", properties: { E: "68.9 GPa", v: "0.33", density: "2700 kg/m³" } },
  { name: "Steel AISI 304", properties: { E: "193 GPa", v: "0.29", density: "8000 kg/m³" } }
];

export const mockNodes: Node<GeoNodeData>[] = [
  {
    id: "preprocessing",
    type: "geoNode",
    position: { x: 100, y: 200 },
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
          labelContent: createPreprocessingStatusContent(),
        },
        {
          id: "results",
          title: "Results",
          labelContent: createPreprocessingResultsContent(),
        },
        {
          id: "materials",
          title: "Materials",
          labelContent: createEmptyMaterialsContent(),
        },
      ],
      geometry: {
        id: "geo1",
        renderContent: createStepGeometry,
      },
    } as GeoNodeData,
  },
  {
    id: "meshing",
    type: "geoNode",
    position: { x: 750, y: 200 },
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
          labelContent: createMeshingStatusContent(),
        },
        {
          id: "results",
          title: "Results",
          labelContent: createMeshingResultsContent(),
        },
        {
          id: "materials",
          title: "Materials",
          labelContent: createMaterialsContent(materials),
        },
      ],
      geometry: {
        id: "geo2",
        renderContent: createMeshGeometry,
      },
    } as GeoNodeData,
  },
];