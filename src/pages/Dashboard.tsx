import React from "react";
import styled from "styled-components";
import SideMenu from "../core/sideMenu/SideMenu";
import { LabelSidebar } from "../components/temporary/GeometryLabelSidebar"; // adjust import path if needed

// 1. IMPORT GeometryCard and GeometryFile type
import { GeometryCard, GeometryFile } from "../components/temporary/GeometryCard"; // !! ADJUST PATH HERE !!

// --- Mock Types (matching the LabelSidebar types) ---
type EntityKind = "face" | "edge" | "body";
type EntityID<K extends EntityKind = EntityKind> = `${K}_${number}`;

type Label = {
  id: string;
  name: string;
  color: [number, number, number];
  entities: Set<EntityID>;
};

// --- Mock Data ---
const mockLabels: Map<string, Label> = new Map([
  [
    "label1",
    {
      id: "label1",
      name: "Front Faces",
      color: [1, 0.5, 0.2],
      entities: new Set(["face_1", "face_2", "face_3", "edge_8"]),
    },
  ],
  [
    "label2",
    {
      id: "label2",
      name: "Front Faces",
      color: [1, 0.5, 0.2],
      entities: new Set(["face_1"]),
    },
  ],
]);

// 2. MOCK DATA for GeometryCard
const mockGeometry: GeometryFile = {
  id: "mock_geo_123",
  filename: "main_housing_v1.stp",
  title: "Main Project Housing Unit (Mock)",
  thumbnailUrl: "https://picsum.photos/300/150?random=1", // Placeholder image
  fileSize: "4.8 MB",
  dateModified: new Date("2025-11-06T12:00:00Z"),
  fileType: "stp",
  tags: ["assembly", "test"],
  vtpFiles: {
    bodies: "/path/to/bodies.vtp",
  },
};

const filteredLabels = Array.from(mockLabels.values());

// --- Empty placeholder state ---
const labelManager = {
  labels: mockLabels,
  activeLabel: "label1",
  pendingSelection: new Set<EntityID>(["face_4", "edge_8"]),
  setActiveLabel: () => {},
  clearPendingSelection: () => {},
};

const vtkConfig = {
  hoveredEntity: "face_2" as EntityID,
  setHoveredEntity: () => {},
  currentMode: "face" as EntityKind,
};

// --- Empty handlers ---
const handleCreateLabel = () => {};
const handleDeleteLabel = () => {};
const handleGeometryCardClick = () => {
    console.log("Geometry Card in Dashboard clicked!");
};

export default function VulcanDashboard() {
  return (
    <Container>
      <SideMenu />
      <MainContent>
        <h2>Vulcan Dashboard (Mock UI)</h2>
        <p>Geometry Card Preview:</p>
        
        {/* 3. RENDER GeometryCard */}
        <CardWrapper>
            <GeometryCard 
                geometry={mockGeometry}
                onClick={handleGeometryCardClick}
            />
        </CardWrapper>

      </MainContent>
      <LabelSidebar
        labels={labelManager.labels}
        activeLabel={labelManager.activeLabel}
        pendingSelection={labelManager.pendingSelection}
        hoveredEntity={vtkConfig.hoveredEntity}
        currentMode={vtkConfig.currentMode}
        filteredLabels={filteredLabels}
        onCreateLabel={handleCreateLabel}
        onDeleteLabel={handleDeleteLabel}
        onSelectLabel={labelManager.setActiveLabel}
        onClearPendingSelection={labelManager.clearPendingSelection}
        onClearHoverFilter={() => vtkConfig.setHoveredEntity()}
        onLoadFile={() => {}}
      />
    </Container>
  );
}

// --- Styled Components (UNCHANGED) ---
const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  background-color: ${(p) => p.theme.colors.backgroundPrimary};
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  color: ${(p) => p.theme.colors.textPrimary};
`;

// --- New Styled Component for Card Layout ---
const CardWrapper = styled.div`
    width: 320px; /* Constrain the card width for proper visualization */
    margin-top: 1rem;
`;