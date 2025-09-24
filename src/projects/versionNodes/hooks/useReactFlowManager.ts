// hooks/useReactFlowManager.ts
import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  Node, 
  Edge, 
  ReactFlowInstance, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Connection,
  MarkerType 
} from "@xyflow/react";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { VersionNode } from "../nodes/VersionNode";
import { useVersionTreeLayout } from "./useVersionTreeLayout";
import { useVersionSorting, SortingConfig } from "./useVersionSorting";

export interface UseReactFlowManagerReturn {
  // React Flow state
  rf: ReactFlowInstance | null;
  nodes: Node[];
  edges: Edge[];
  setNodes: (updater: (nodes: Node[]) => Node[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  setRf: (instance: ReactFlowInstance | null) => void;
  
  // Node types
  nodeTypes: { versionNode: any };
  
  // Sorting integration
  sortConfig: SortingConfig | null;
  setSortConfig: (config: SortingConfig | null) => void;
  availableMetrics: any[];
  clearSort: () => void;
  handleSortConfirm: (config: any) => void;
}

interface UseReactFlowManagerProps {
  versions: ProjectVersion[];
  selectedNodeIds: string[];
  activeVersionId: string;
  
  // AI Generation state
  aiStateById: Record<string, any>;
  
  // Action handlers
  onShowDetails: (versionId: string) => void;
  onUploadGeometry: (versionId: string) => void;
  
  // Upload state
  isUploading: boolean;
  uploadError: string | null;
}

/**
 * Hook for managing React Flow state, node/edge processing, and layout
 * Integrates sorting, AI generation state, and user interactions
 */
export const useReactFlowManager = ({
  versions,
  selectedNodeIds,
  activeVersionId,
  aiStateById,
  onShowDetails,
  onUploadGeometry,
  isUploading,
  uploadError,
}: UseReactFlowManagerProps): UseReactFlowManagerReturn => {

  // React Flow state
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sorting integration
  const {
    sortConfig,
    setSortConfig,
    sortedVersions,
    availableMetrics,
    clearSort,
    applySortToNodes,
  } = useVersionSorting(versions);

  // Generate tree layout
  const { nodes: treeNodes, edges: treeEdges } = useVersionTreeLayout(
    sortConfig ? sortedVersions : versions,
    "DETAIL"
  );

  // Node types
  const nodeTypes = useMemo(() => ({ versionNode: VersionNode }), []);

  // Build base geometry map for AI node inheritance
  const baseGeoMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const n of treeNodes) {
      m.set(n.id, (n.data as any)?.geometry);
    }
    return m;
  }, [treeNodes]);

  // Process nodes based on sorting and AI state
  const processedNodes = useMemo(() => {
    let baseNodes = treeNodes;
    let processedEdges = treeEdges;

    // Apply sorting if active
    if (sortConfig) {
      const sortResult = applySortToNodes(treeNodes);
      baseNodes = sortResult.nodes;
      processedEdges = sortResult.edges;
    }

    // Add AI generation state and handlers to nodes
    const enhancedNodes = baseNodes.map((node) => {
      const aiState = aiStateById[node.id];
      const parentId = (node.data as any)?.parentVersion as string | undefined;

      let mergedData: any = {
        ...node.data,
        onShowDetails,
        onUploadGeometry,
        isUploading,
        uploadError,
        sortConfig,
      };

      // Apply AI generation state if present
      if (aiState) {
        mergedData.aiGenerating = aiState.generating;
        mergedData.aiStageIndex = aiState.stageIndex;
        mergedData.aiStage = aiState.stage;

        // Simplified geometry inheritance - no upload blocking logic
        const currentGeo = (node.data as any)?.geometry;
        const parentGeo = parentId ? baseGeoMap.get(parentId) : undefined;

        // Always inherit from parent if no current geometry
        if (!currentGeo?.data && parentGeo?.data) {
          mergedData.geometry = {
            id: `geo-${node.id}`,
            data: parentGeo.data,
            renderContent: parentGeo.renderContent,
            placeholder: parentGeo.placeholder,
          };
        }
      }

      return {
        ...node,
        data: mergedData,
        selected: selectedNodeIds.includes(node.id),
        style: {
          ...node.style,
          ...(selectedNodeIds.includes(node.id) && {
            boxShadow:
              selectedNodeIds.indexOf(node.id) === 0
                ? "0 0 0 3px var(--accent-primary)"
                : "0 0 0 3px var(--primary-action)",
          }),
        },
      };
    });

    return { nodes: enhancedNodes, edges: processedEdges };
  }, [
    treeNodes,
    treeEdges,
    sortConfig,
    applySortToNodes,
    selectedNodeIds,
    aiStateById,
    baseGeoMap,
    onShowDetails,
    onUploadGeometry,
    isUploading,
    uploadError,
  ]);

  // Update React Flow nodes and edges when processed data changes
  useEffect(() => {
    setNodes(processedNodes.nodes);
    setEdges(processedNodes.edges);
  }, [processedNodes, setNodes, setEdges]);

  // Handle edge connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        animated: true,
        style: { stroke: "var(--accent-neutral)", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--accent-neutral)",
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Sort configuration handlers
  const handleSortConfirm = useCallback((config: any) => {
    setSortConfig(config);
    
    // Fit view after sorting
    setTimeout(() => {
      rf?.fitView({ padding: 0.2, duration: 600 });
    }, 100);
  }, [rf, setSortConfig]);

  const handleClearSort = useCallback(() => {
    clearSort();
    setTimeout(() => {
      rf?.fitView({ padding: 0.2, duration: 600 });
    }, 100);
  }, [rf, clearSort]);

  return {
    // React Flow state
    rf,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setRf,
    
    // Node types
    nodeTypes,
    
    // Sorting integration
    sortConfig,
    setSortConfig,
    availableMetrics,
    clearSort: handleClearSort,
    handleSortConfirm,
  };
};