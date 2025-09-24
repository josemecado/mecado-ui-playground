// views/VersionFlowPreview.tsx - Updated to use shared tree layout
import React, { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Background,
  MiniMap,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { MiniVersionNode } from "../nodes/MiniVersionNode";
import { useVersionTreeLayout } from "../hooks/useVersionTreeLayout";

// Props
interface VersionFlowPreviewProps {
  versions: ProjectVersion[];
  onVersionChange?: (versionId: string) => void;
  height?: string;
  activeVersionId?: string;
}

// Styled Components
const PreviewContainer = styled.div<{ $height?: string }>`
  width: 100%;
  height: ${(p) => p.$height || "300px"};
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-bg);
  overflow: hidden;
  position: relative;
`;

const PreviewHeader = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-bg);
`;

const PreviewTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Main Component
export const VersionFlowPreview: React.FC<VersionFlowPreviewProps> = ({
  versions,
  onVersionChange,
  height = "300px",
  activeVersionId,
}) => {
  const [rf, setRf] = React.useState<ReactFlowInstance | null>(null);

  // Local state for optimistic updates
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(
    activeVersionId || null
  );

  // Use the shared tree layout hook with mini-view configuration
  const { nodes: treeNodes, edges: treeEdges } = useVersionTreeLayout(
    versions,
    "MINI" // Simply use the predefined MINI config
  );

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(treeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(treeEdges);

  // Node types
  const nodeTypes = useMemo(() => ({ versionBubble: MiniVersionNode }), []);

  // Update nodes and edges when versions or tree layout changes
  useEffect(() => {
    // Apply selection state when setting nodes
    const nodesWithSelection = treeNodes.map((node) => ({
      ...node,
      selected: node.id === (localSelectedId || activeVersionId),
      data: {
        ...node.data,
        isArchived: versions.find((v) => v.id === node.id)?.isArchived ?? false,
      },
    }));
    setNodes(nodesWithSelection);
    setEdges(treeEdges);
  }, [
    treeNodes,
    treeEdges,
    setNodes,
    setEdges,
    localSelectedId,
    activeVersionId,
  ]);

  // Sync local selection with external activeVersionId changes
  useEffect(() => {
    if (activeVersionId && activeVersionId !== localSelectedId) {
      setLocalSelectedId(activeVersionId);
    }
  }, [activeVersionId]);

  // Center on active node - separate effect without nodes dependency
  useEffect(() => {
    if (!rf || !localSelectedId) return;

    // Find the node directly from treeNodes to avoid dependency on state
    const activeNode = treeNodes.find((n) => n.id === localSelectedId);
    if (activeNode) {
      // Small delay to ensure nodes are rendered
      const timeoutId = setTimeout(() => {
        rf.fitView({
          nodes: [{ id: localSelectedId }] as any,
          padding: 1.5,
          duration: 300,
          minZoom: 0.3,
          maxZoom: 1.5,
        });
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [localSelectedId, rf, treeNodes]);

  // Handle node click with optimistic update
  const handleNodeClick = React.useCallback(
    (_e: React.MouseEvent, node: Node) => {
      // Optimistic local update - immediate visual feedback
      setLocalSelectedId(node.id);

      // Update the nodes immediately for instant visual feedback
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }))
      );

      // Notify parent about the change
      if (onVersionChange) {
        onVersionChange(node.id);
      }
    },
    [onVersionChange, setNodes]
  );

  return (
    <PreviewContainer $height={height}>
      <PreviewHeader>
        <PreviewTitle>Version Tree</PreviewTitle>
      </PreviewHeader>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.3,
          maxZoom: 1.5,
        }}
        nodesDraggable={false} // Keep tree structure intact
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        panOnDrag
        preventScrolling
        proOptions={{ hideAttribution: true }}
        onInit={setRf}
        minZoom={0.1} // Allow zooming out more for overview
        maxZoom={2} // Allow some zoom in for details
      >
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="var(--border-bg)"
          style={{ opacity: 0.3 }}
        />
        <MiniMap
          zoomable
          pannable
          style={{
            width: 80,
            height: 60,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-bg)",
            borderRadius: 4,
          }}
          nodeColor={(n) =>
            n.selected ? "var(--primary-alternate)" : "var(--accent-neutral)"
          }
          nodeStrokeColor={() => "var(--border-bg)"}
          nodeBorderRadius={12}
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>
    </PreviewContainer>
  );
};
