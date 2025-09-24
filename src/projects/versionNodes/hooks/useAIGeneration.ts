// hooks/useAIGeneration.ts - SIMPLIFIED: Version creation and AI stage simulation only
import { useState, useCallback, useEffect, useMemo } from "react";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { SimpleVersionRelationshipStorage } from "./versionRelationshipStorage";
import { extractVersionNumber } from "../../../utilities/Interfaces";

// Constants
const AI_STAGE_MS = 800; // Smooth progression between stages
const AI_STAGES = [
  "Analyzing Requirements", // Simplified stages for AI workflow simulation
  "Pre-processing", 
  "FEA Setup",
  "Solving",
  "Results",
] as const;

type AIGenStage = (typeof AI_STAGES)[number];

// Types - removed PreloadedGeometry, simplified
interface AIState {
  stageIndex: number;
  stage: AIGenStage;
  generating: boolean;
  isActive: boolean;
}

interface GenerationQueue {
  parentId: string;
  nodeIds: string[];
  currentIndex: number;
}

export interface UseAIGenerationReturn {
  // AI generation state
  aiStateById: Record<string, AIState>;
  pendingNodeQueue: GenerationQueue;
  
  // AI generation actions
  handleExplorePaths: (selectedNodeIds: string[], versions: ProjectVersion[]) => void;
  
  // Queue info for UI
  queueInfo: {
    total: number;
    current: number;
    remaining: number;
  } | null;
  
  // Active node info
  activeNodeId: string | null;
  activeNodeStage: AIState | null;
}

interface UseAIGenerationProps {
  projectId: string;
  onAddVersion: (newVersion: ProjectVersion) => void;
  onRefreshGeometry?: () => void;
  setSelectedNodeIds: (ids: string[]) => void;
  onCreateBackendVersion?: () => Promise<void>; // For backend version creation
}

/**
 * Hook for managing AI generation workflow - simplified version creation only
 * Handles generation queue and AI stage simulation
 * Geometry inheritance happens automatically in React Flow Manager
 */
export const useAIGeneration = ({
  projectId,
  onAddVersion,
  onRefreshGeometry,
  setSelectedNodeIds,
  onCreateBackendVersion,
}: UseAIGenerationProps): UseAIGenerationReturn => {

  // State - removed all geometry-related state
  const [aiStateById, setAiStateById] = useState<Record<string, AIState>>({});
  const [pendingNodeQueue, setPendingNodeQueue] = useState<GenerationQueue>({
    parentId: "",
    nodeIds: [],
    currentIndex: -1,
  });

  // Helper to allocate next version IDs
  const allocateNextVersionIds = useCallback((count: number, versions: ProjectVersion[]) => {
    const maxN = versions.reduce((max, v) => {
      const n = extractVersionNumber(v.id);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
    return Array.from({ length: count }, (_, i) => `v${maxN + 1 + i}`);
  }, []);

  // Create and persist a child version - SIMPLIFIED (no geometry handling)
  const persistChild = useCallback(
    async (parentId: string, id: string) => {
      const newVersion: ProjectVersion = {
        id,
        title: `Version ${extractVersionNumber(id) || id.toUpperCase()}`,
        parentVersion: parentId,
        createdAt: new Date().toISOString(),
        geometries: [],
        pinnedEquations: [],
        uploadedFiles: [],
        generatedFiles: [],
        metrics: [],
        edges: [],
      };

      // Update relationships in local storage
      const map = SimpleVersionRelationshipStorage.getRelationshipMap();
      if (!map[projectId]) map[projectId] = {};
      if (!map[projectId][parentId]) map[projectId][parentId] = [];
      if (!map[projectId][parentId].includes(id))
        map[projectId][parentId].push(id);
      if (!map[projectId][id]) map[projectId][id] = [];
      SimpleVersionRelationshipStorage.saveRelationshipMap(map);

      // Add version to local state (immediate UI update)
      onAddVersion(newVersion);
      // Note: Geometry inheritance happens automatically in useReactFlowManager
      // based on parent-child relationships, no explicit geometry handling needed here
    },
    [projectId, onAddVersion, onRefreshGeometry, onCreateBackendVersion]
  );

  // AI stage management - automatic progression
  const createNodeAtFirstStage = useCallback((id: string, isActive = false) => {
    setAiStateById((prev) => ({
      ...prev,
      [id]: {
        stageIndex: 0,
        stage: AI_STAGES[0],
        generating: true,
        isActive,
      },
    }));
  }, []);

  // Automatic stage progression for active nodes - SIMPLIFIED
  useEffect(() => {
    const activeNodeId = Object.keys(aiStateById).find((id) => aiStateById[id].isActive);
    if (!activeNodeId) return;

    const currentState = aiStateById[activeNodeId];
    if (!currentState.generating) return;

    // Auto-advance to next stage after delay (no geometry blocking)
    const timer = setTimeout(() => {
      setAiStateById((prev) => {
        const state = prev[activeNodeId];
        if (!state || !state.generating) return prev;

        const nextIndex = Math.min(state.stageIndex + 1, AI_STAGES.length - 1);
        const isComplete = nextIndex === AI_STAGES.length - 1;

        return {
          ...prev,
          [activeNodeId]: {
            ...state,
            stageIndex: nextIndex,
            stage: AI_STAGES[nextIndex],
            generating: !isComplete,
            isActive: !isComplete,
          },
        };
      });
    }, AI_STAGE_MS);

    return () => clearTimeout(timer);
  }, [aiStateById]);

  // Handle explore paths action - FIXED to create all nodes upfront
  const handleExplorePaths = useCallback((selectedNodeIds: string[], versions: ProjectVersion[]) => {
    if (selectedNodeIds.length !== 1) return;
    
    const parentId = selectedNodeIds[0];
    const count = 3; // Fixed count of 3 variations for simplicity

    const ids = allocateNextVersionIds(count, versions);

    // FIXED: Create ALL nodes upfront to prevent duplicates
    ids.forEach(async (id) => {
      await persistChild(parentId, id);
    });

    // Set up queue with all pre-created nodes
    setPendingNodeQueue({
      parentId,
      nodeIds: ids,
      currentIndex: 0,
    });

    // Only activate the first node for AI processing
    createNodeAtFirstStage(ids[0], true);
    setSelectedNodeIds([ids[0]]);
  }, [allocateNextVersionIds, persistChild, createNodeAtFirstStage, setSelectedNodeIds]);

  // Auto-activate next node when current completes - SIMPLIFIED (no node creation)
  useEffect(() => {
    const completedNodeId = Object.keys(aiStateById).find((id) => {
      const state = aiStateById[id];
      return state && !state.isActive && !state.generating && state.stageIndex === AI_STAGES.length - 1;
    });

    if (completedNodeId && pendingNodeQueue.nodeIds.length > 0) {
      const nextIndex = pendingNodeQueue.currentIndex + 1;
      
      if (nextIndex < pendingNodeQueue.nodeIds.length) {
        const nextNodeId = pendingNodeQueue.nodeIds[nextIndex];
        
        // FIXED: Just activate AI state, don't create node (already exists)
        setAiStateById((prev) => ({
          ...prev,
          [nextNodeId]: {
            stageIndex: 0,
            stage: AI_STAGES[0],
            generating: true,
            isActive: true, // Activate immediately
          },
        }));

        // Update queue progress
        setPendingNodeQueue((prev) => ({
          ...prev,
          currentIndex: nextIndex,
        }));

        // Select the new active node
        setSelectedNodeIds([nextNodeId]);
      } else {
        // Queue is complete
        setPendingNodeQueue({
          parentId: "",
          nodeIds: [],
          currentIndex: -1,
        });
      }
    }
  }, [aiStateById, pendingNodeQueue, setSelectedNodeIds]);

  // Computed values
  const queueInfo = useMemo(() => {
    if (pendingNodeQueue.nodeIds.length === 0) return null;
    return {
      total: pendingNodeQueue.nodeIds.length,
      current: pendingNodeQueue.currentIndex + 1,
      remaining: pendingNodeQueue.nodeIds.length - pendingNodeQueue.currentIndex - 1,
    };
  }, [pendingNodeQueue]);

  const activeNodeId = Object.keys(aiStateById).find((id) => aiStateById[id].isActive) || null;
  const activeNodeStage = activeNodeId ? aiStateById[activeNodeId] : null;

  return {
    aiStateById,
    pendingNodeQueue,
    handleExplorePaths,
    queueInfo,
    activeNodeId,
    activeNodeStage,
  };
};