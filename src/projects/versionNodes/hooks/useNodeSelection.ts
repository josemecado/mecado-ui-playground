// hooks/useNodeSelection.ts
import { useState, useCallback, useMemo } from "react";
import { Node } from "@xyflow/react";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { extractVersionNumber } from "../../../utilities/Interfaces";

export interface UseNodeSelectionReturn {
  selectedNodeIds: string[];
  selectedVersionsInfo: Array<{
    id: string;
    title: string;
    isSource: boolean;
  }>;
  
  // Actions
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  handlePaneClick: () => void;
  clearSelection: () => void;
  setSelectedNodeIds: (ids: string[]) => void;
  
  // Selection state queries
  hasSelection: boolean;
  hasSingleSelection: boolean;
  hasDoubleSelection: boolean;
  canExplore: boolean;
  canGeometryLink: boolean;
  
  // Geometry linking
  getGeometryLinkingUrl: (projectId: string) => string;
}

/**
 * Hook for managing node selection state and multi-select logic
 * Handles Ctrl+Click multi-select, keyboard shortcuts, and selection validation
 */
export const useNodeSelection = (
  versions: ProjectVersion[],
  setNodes: (updater: (nodes: Node[]) => Node[]) => void
): UseNodeSelectionReturn => {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Multi-select node click handler
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();

      const isMultiSelect = event.ctrlKey || event.metaKey;

      if (isMultiSelect) {
        // Multi-select logic
        setSelectedNodeIds((prev) => {
          if (prev.includes(node.id)) {
            // Deselect if already selected
            return prev.filter((id) => id !== node.id);
          } else if (prev.length < 2) {
            // Add to selection if less than 2 nodes selected
            return [...prev, node.id];
          } else {
            // Replace second selection if 2 nodes already selected
            return [prev[0], node.id];
          }
        });
      } else {
        // Single select
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === node.id,
          }))
        );
        setSelectedNodeIds([node.id]);
      }
    },
    [setNodes]
  );

  // Clear selection when clicking on empty space
  const handlePaneClick = useCallback(() => {
    setSelectedNodeIds([]);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  }, [setNodes]);

  // Clear selection programmatically
  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  }, [setNodes]);

  // Selection state queries
  const hasSelection = selectedNodeIds.length > 0;
  const hasSingleSelection = selectedNodeIds.length === 1;
  const hasDoubleSelection = selectedNodeIds.length === 2;
  const canExplore = hasSingleSelection;
  const canGeometryLink = hasDoubleSelection;

  // Get selected versions info for UI display
  const selectedVersionsInfo = useMemo(() => {
    return selectedNodeIds.map((nodeId, index) => {
      const version = versions.find((v) => v.id === nodeId);
      return {
        id: nodeId,
        title: version?.title || nodeId.toUpperCase(),
        isSource: index === 0,
      };
    });
  }, [selectedNodeIds, versions]);

  // Generate GeometryLinking URL
  const getGeometryLinkingUrl = useCallback((projectId: string) => {
    if (selectedNodeIds.length !== 2) return "";

    const sourceVersion = extractVersionNumber(selectedNodeIds[0]);
    const targetVersion = extractVersionNumber(selectedNodeIds[1]);

    return `/geometryLinking?projectId=${projectId}&oldVersion=${sourceVersion}&newVersion=${targetVersion}`;
  }, [selectedNodeIds]);

  return {
    selectedNodeIds,
    selectedVersionsInfo,
    
    // Actions
    handleNodeClick,
    handlePaneClick,
    clearSelection,
    setSelectedNodeIds,
    
    // State queries
    hasSelection,
    hasSingleSelection,
    hasDoubleSelection,
    canExplore,
    canGeometryLink,
    
    // Utilities
    getGeometryLinkingUrl,
  };
};