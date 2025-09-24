// hooks/useTreeAnimation.ts
import { useState, useCallback, useEffect } from "react";
import { ReactFlowInstance, Node } from "@xyflow/react";
import { ProjectVersion } from "../utils/VersionInterfaces";

interface UseTreeAnimationReturn {
  isAnimating: boolean;
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
  animateTree: () => Promise<void>;
  resetAnimation: () => void;
}

interface AnimationConfig {
  rootDelay?: number;
  zoomOutDuration?: number;
  levelStagger?: number;
  nodeStagger?: number;
  finalZoomDuration?: number;
}

/**
 * Hook for managing tree reveal animation
 * Can be reused in different flow visualizations
 */
export const useTreeAnimation = (
  versions: ProjectVersion[],
  nodes: Node[],
  rf: ReactFlowInstance | null,
  config: AnimationConfig = {}
): UseTreeAnimationReturn => {
  const {
    rootDelay = 3000,
    zoomOutDuration = 600,
    levelStagger = 500,
    nodeStagger = 500,
    finalZoomDuration = 800,
  } = config;

  const [isAnimating, setIsAnimating] = useState(false);
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(
    new Set(versions.map((v) => v.id))
  );
  const [visibleEdgeIds, setVisibleEdgeIds] = useState<Set<string>>(new Set());

  // Reset animation state
  const resetAnimation = useCallback(() => {
    setVisibleNodeIds(new Set(versions.map((v) => v.id)));
    setVisibleEdgeIds(new Set());
    setIsAnimating(false);
  }, [versions]);

  // Main animation sequence
  const animateTree = useCallback(async () => {
    if (isAnimating || !rf) return;

    setIsAnimating(true);

    // Build tree structure
    const childrenMap = new Map<string | null, string[]>();
    versions.forEach((v) => {
      const parent = v.parentVersion;
      if (!childrenMap.has(parent)) {
        childrenMap.set(parent, []);
      }
      childrenMap.get(parent)!.push(v.id);
    });

    // Find root nodes
    const roots = versions.filter((v) => !v.parentVersion).map((v) => v.id);
    const nodePositionMap = new Map(nodes.map((n) => [n.id, n.position.x]));

    // SEQUENCE 1: Show only roots
    setVisibleNodeIds(new Set(roots));
    setVisibleEdgeIds(new Set());
    await delay(rootDelay);

    // SEQUENCE 2: Zoom out to fit full tree
    const bounds = calculateTreeBounds(nodes);
    rf.fitBounds(bounds, { padding: 0.1, duration: zoomOutDuration });
    await delay(zoomOutDuration + 300);

    // SEQUENCE 3: Reveal tree level by level
    const levels = buildLevels(roots, childrenMap);
    let lastNodeId: string | null = null;

    for (let i = 1; i < levels.length; i++) {
      const level = levels[i];
      const sortedLevel = sortByPosition(level, nodePositionMap);

      // Animate nodes in this level
      const levelPromises = sortedLevel.map((nodeId, j) => {
        lastNodeId = nodeId;
        return animateNodeAppearance(
          nodeId,
          j,
          sortedLevel,
          versions,
          nodeStagger
        );
      });

      await Promise.all(levelPromises);
      await delay(levelStagger);
    }

    // Show all edges
    const allEdgeIds = buildAllEdgeIds(versions, childrenMap, nodePositionMap);
    setVisibleEdgeIds(allEdgeIds);
    await delay(2000);

    // SEQUENCE 4: Zoom to last node
    if (lastNodeId) {
      const lastNode = nodes.find((n) => n.id === lastNodeId);
      if (lastNode) {
        rf.setCenter(
          lastNode.position.x + 250,
          lastNode.position.y + 150,
          { zoom: 1.2, duration: finalZoomDuration }
        );
      }
    }

    await delay(finalZoomDuration);
    setIsAnimating(false);
  }, [
    versions,
    nodes,
    rf,
    isAnimating,
    rootDelay,
    zoomOutDuration,
    levelStagger,
    nodeStagger,
    finalZoomDuration,
  ]);

  // Helper function for node appearance
  const animateNodeAppearance = (
    nodeId: string,
    index: number,
    sortedLevel: string[],
    versions: ProjectVersion[],
    stagger: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setVisibleNodeIds((prev) => new Set(prev).add(nodeId));

        setTimeout(() => {
          setVisibleEdgeIds((prev) => {
            const newSet = new Set(prev);
            const node = versions.find((v) => v.id === nodeId);

            if (node?.parentVersion) {
              newSet.add(`parent-${node.parentVersion}-${nodeId}`);
            }

            if (index > 0) {
              const prevSibling = sortedLevel[index - 1];
              newSet.add(`sibling-${prevSibling}-${nodeId}`);
            }

            return newSet;
          });
          resolve();
        }, 100);
      }, index * stagger);
    });
  };

  return {
    isAnimating,
    visibleNodeIds,
    visibleEdgeIds,
    animateTree,
    resetAnimation,
  };
};

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateTreeBounds = (nodes: Node[]) => {
  const nodeWidth = 500;
  const nodeHeight = 300;
  const padding = 100;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x + nodeWidth);
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y + nodeHeight);
  });

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
};

const buildLevels = (
  roots: string[],
  childrenMap: Map<string | null, string[]>
): string[][] => {
  const levels: string[][] = [];
  let currentLevel = [...roots];

  while (currentLevel.length > 0) {
    levels.push([...currentLevel]);
    const nextLevel: string[] = [];
    currentLevel.forEach((nodeId) => {
      const children = childrenMap.get(nodeId) || [];
      nextLevel.push(...children);
    });
    currentLevel = nextLevel;
  }

  return levels;
};

const sortByPosition = (
  nodeIds: string[],
  positionMap: Map<string, number>
): string[] => {
  return [...nodeIds].sort((a, b) => {
    const posA = positionMap.get(a) || 0;
    const posB = positionMap.get(b) || 0;
    return posA - posB;
  });
};

const buildAllEdgeIds = (
  versions: ProjectVersion[],
  childrenMap: Map<string | null, string[]>,
  nodePositionMap: Map<string, number>
): Set<string> => {
  const allEdgeIds = new Set<string>();

  // Parent-child edges
  versions.forEach((v) => {
    if (v.parentVersion) {
      allEdgeIds.add(`parent-${v.parentVersion}-${v.id}`);
    }
  });

  // Sibling edges
  childrenMap.forEach((children) => {
    const sortedChildren = sortByPosition(children, nodePositionMap);
    for (let i = 0; i < sortedChildren.length - 1; i++) {
      allEdgeIds.add(`sibling-${sortedChildren[i]}-${sortedChildren[i + 1]}`);
    }
  });

  return allEdgeIds;
};