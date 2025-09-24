// views/VersionFlow.tsx - Refactored with MVVM-style hook architecture
import React, { useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// Components
import { ProjectVersion } from "../utils/VersionInterfaces";
import { VersionDetailsPopup } from "../components/VersionDetailsPopup";
import { AddVersionModal } from "../components/AddVersionModal";
import { VersionMiniSelector } from "../components/VersionMiniSelector";
import DynamicSortingModal from "../components/MetricSortingModal";
import TkinterControl from "../mock/tkinterControl";

// Hooks - Clean separation of concerns
import { useVersionFlowState } from "../hooks/useVersionFlowState";
import { useNodeSelection } from "../hooks/useNodeSelection";
import { useVersionFlowActions } from "../hooks/useVersionFlowActions";
import { useAIGeneration } from "../hooks/useAIGeneration";
import { useReactFlowManager } from "../hooks/useReactFlowManager";

// UI Components
import { 
  TopLeftControls,
  TopRightControls,
  BottomLeftControls,
  MiniSelectorWrapper,
  SuccessNotification 
} from "../components/VersionFlowControls";

// Props
interface VersionFlowVisualizationProps {
  versions: ProjectVersion[];
  activeVersionId: string;
  onVersionChange: (versionId: string) => void;
  onAddVersion: (newVersion: ProjectVersion) => void;
  onNewProjectVersion?: () => Promise<void>; // NEW: For backend version creation
  projectId: string;
  onRefreshGeometry?: () => void;
}

// Styled Components
const FlowContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  position: relative;
`;

const SortingModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * Refactored VersionFlowVisualization with clean hook-based architecture
 * Each hook handles a specific domain of responsibility
 */
export const VersionFlowVisualization: React.FC<VersionFlowVisualizationProps> = ({
  versions,
  activeVersionId,
  onVersionChange,
  onAddVersion,
  onNewProjectVersion, // NEW: Now we have access to backend version creation
  projectId,
  onRefreshGeometry,
}) => {
  const navigate = useNavigate();

  // 1. UI State Management - Modals, notifications, loading states
  const uiState = useVersionFlowState();

  // 2. Node Selection - Multi-select logic, keyboard shortcuts
  const selection = useNodeSelection(versions, (updater) => reactFlow.setNodes(updater));

  // 3. User Actions - Geometry upload, archiving, refresh, navigation
  const actions = useVersionFlowActions({
    projectId,
    versions,
    setNodes: (updater) => reactFlow.setNodes(updater),
    onRefreshGeometry,
    onVersionChange,
    onAddVersion,
    setUploadSuccess: uiState.setUploadSuccess,
    setIsRefreshing: uiState.setIsRefreshing,
    openVersionDetails: uiState.openVersionDetails,
    closeAddModal: uiState.closeAddModal,
    navigate,
  });

  // 4. AI Generation - Geometry management, queue, stage simulation
  const aiGeneration = useAIGeneration({
    projectId,
    onAddVersion,
    onRefreshGeometry,
    setSelectedNodeIds: selection.setSelectedNodeIds,
    onCreateBackendVersion: async () => {
      // The bridge's onNewProjectVersion handles the backend version creation
      if (onNewProjectVersion) {
        await onNewProjectVersion();
      }
    },
  });

  // 5. React Flow Management - Node/edge state, layout, sorting
  const reactFlow = useReactFlowManager({
    versions,
    selectedNodeIds: selection.selectedNodeIds,
    activeVersionId,
    aiStateById: aiGeneration.aiStateById,
    onShowDetails: actions.showVersionDetails,
    onUploadGeometry: actions.handleGeometryUpload,
    isUploading: actions.isUploading,
    uploadError: actions.uploadError,
  });

  // Keyboard shortcuts integration
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Archive/Delete
      if ((event.key === "Backspace" || event.key === "Delete") && selection.hasSingleSelection) {
        event.preventDefault();
        actions.handleArchiveVersion(selection.selectedNodeIds[0]);
      }

      // Clear selection
      if (event.key === "Escape") {
        selection.clearSelection();
      }

      // Refresh
      if (event.key === "r") {
        actions.handleRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selection, actions]);

  // Early return if no versions
  if (!versions.length) return null;

  return (
    <FlowContainer>
      <TkinterControl />

      {/* Top Left Controls - Selection info, geometry management, AI controls */}
      <TopLeftControls
        selection={selection}
        aiGeneration={aiGeneration}
        onExplore={() => aiGeneration.handleExplorePaths(selection.selectedNodeIds, versions)}
        onGeometryLink={() => navigate(selection.getGeometryLinkingUrl(projectId))}
      />

      {/* Top Right Controls - Sorting */}
      <TopRightControls
        onSort={uiState.openSortModal}
        onClearSort={reactFlow.clearSort}
        hasSortConfig={!!reactFlow.sortConfig}
      />

      {/* Mini Selector */}
      <MiniSelectorWrapper>
        <VersionMiniSelector
          versions={versions}
          activeVersionId={activeVersionId}
          onVersionChange={onVersionChange}
          onNewVersion={uiState.openAddModal}
        />
      </MiniSelectorWrapper>

      {/* Success notification */}
      {uiState.uploadSuccess && (
        <SuccessNotification>{uiState.uploadSuccess}</SuccessNotification>
      )}

      {/* Modals */}
      {uiState.showSortModal && (
        <SortingModalWrapper>
          <DynamicSortingModal
            availableMetrics={reactFlow.availableMetrics}
            defaultSelectedMetric={reactFlow.availableMetrics[0]?.title}
            defaultOrder="asc"
            onConfirm={reactFlow.handleSortConfirm}
            onCancel={uiState.closeSortModal}
            title="Sort versions by metric"
            confirmLabel="Apply Sort"
            onClick={(e) => e.stopPropagation()}
          />
        </SortingModalWrapper>
      )}

      {uiState.showAddModal && (
        <AddVersionModal
          onSave={actions.handleAddModalSave}
          onCancel={uiState.closeAddModal}
          existingVersions={versions}
          projectId={projectId}
        />
      )}

      {uiState.selectedVersion && (
        <VersionDetailsPopup
          version={uiState.selectedVersion}
          onClose={uiState.closeVersionDetails}
        />
      )}

      {/* React Flow */}
      <ReactFlow
        nodes={reactFlow.nodes}
        edges={reactFlow.edges}
        onInit={reactFlow.setRf}
        onNodesChange={reactFlow.onNodesChange}
        onEdgesChange={reactFlow.onEdgesChange}
        onConnect={reactFlow.onConnect}
        onNodeClick={selection.handleNodeClick}
        onPaneClick={selection.handlePaneClick}
        nodeTypes={reactFlow.nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        panOnDrag
        panOnScroll={false}
        preventScrolling
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant="dots"
          gap={50}
          size={3}
          color="var(--text-secondary)"
        />
        <MiniMap
          zoomable
          pannable
          nodeColor={(n) =>
            n.selected ? "var(--primary-alternate)" : "var(--accent-neutral)"
          }
          nodeStrokeColor={() => "var(--border-bg)"}
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-bg)",
            borderRadius: "4px)",
          }}
        />
      </ReactFlow>

      {/* Bottom Left Controls - Refresh */}
      <BottomLeftControls
        onRefresh={actions.handleRefresh}
        isRefreshing={uiState.isRefreshing}
      />
    </FlowContainer>
  );
};

export default VersionFlowVisualization;