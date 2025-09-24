import { useMemo } from "react";
import { Node, Edge, MarkerType } from "@xyflow/react";
import { ProjectVersion } from "../utils/VersionInterfaces";

interface TreeLayoutConfig {
  verticalSpacing?: number; // px between depths
  horizontalSpacing?: number; // px per unit (min gap between siblings)
  centerX?: number; // forest center in pixels
  startY?: number; // top Y
  nodeType?: string;
  gapUnitsBetweenRoots?: number; // unit gap between independent roots
}

interface UseVersionTreeLayoutReturn {
  nodes: Node[];
  edges: Edge[];
  depths: Map<string, number>;
}

// Predefined configurations
export const TREE_LAYOUT_CONFIGS = {
  DETAIL: {
    verticalSpacing: 450,
    horizontalSpacing: 300,
    centerX: 0,
    startY: 0,
    nodeType: "versionNode",
    gapUnitsBetweenRoots: 2,
  },
  MINI: {
    verticalSpacing: 80,
    horizontalSpacing: 30,
    centerX: 0,
    startY: 0,
    nodeType: "versionBubble",
    gapUnitsBetweenRoots: 1,
  },
} as const;

export type TreeLayoutMode = keyof typeof TREE_LAYOUT_CONFIGS;

/**
 * Tidy-tree layout with only parent→child edges.
 * - Each leaf is width=1 unit.
 * - A parent's width is the sum of its children (+ unit gaps).
 * - Children are placed left→right across the parent's width;
 *   the parent sits at the center of that strip.
 * 
 * @param versions - Array of project versions to layout
 * @param modeOrConfig - Either a predefined mode ('DETAIL' | 'MINI') or a custom config object
 */
export const useVersionTreeLayout = (
  versions: ProjectVersion[],
  modeOrConfig: TreeLayoutMode | TreeLayoutConfig = 'DETAIL'
): UseVersionTreeLayoutReturn => {
  // Determine the config to use
  const config: TreeLayoutConfig = 
    typeof modeOrConfig === 'string' 
      ? TREE_LAYOUT_CONFIGS[modeOrConfig]
      : modeOrConfig;

  const {
    verticalSpacing = TREE_LAYOUT_CONFIGS.DETAIL.verticalSpacing,
    horizontalSpacing = TREE_LAYOUT_CONFIGS.DETAIL.horizontalSpacing,
    centerX = TREE_LAYOUT_CONFIGS.DETAIL.centerX,
    startY = TREE_LAYOUT_CONFIGS.DETAIL.startY,
    nodeType = TREE_LAYOUT_CONFIGS.DETAIL.nodeType,
    gapUnitsBetweenRoots = TREE_LAYOUT_CONFIGS.DETAIL.gapUnitsBetweenRoots,
  } = config;

  const { nodes, edges, depths } = useMemo(() => {
    // ---- Build maps ----
    const vMap = new Map<string, ProjectVersion>();
    const kids = new Map<string, string[]>();
    versions.forEach((v) => {
      vMap.set(v.id, v);
      if (!kids.has(v.id)) kids.set(v.id, []);
    });
    versions.forEach((v) => {
      const p = v.parentVersion;
      if (p && vMap.has(p)) kids.get(p)!.push(v.id);
    });

    // Roots (forest): nodes without valid parent
    const roots = versions
      .filter((v) => !v.parentVersion || !vMap.has(v.parentVersion))
      .map((v) => v.id);

    // Depths
    const depths = new Map<string, number>();
    const depthOf = (id: string): number => {
      if (depths.has(id)) return depths.get(id)!;
      const v = vMap.get(id);
      if (!v || !v.parentVersion || !vMap.has(v.parentVersion)) {
        depths.set(id, 0);
        return 0;
      }
      const d = depthOf(v.parentVersion) + 1;
      depths.set(id, d);
      return d;
    };
    versions.forEach((v) => depthOf(v.id));

    // ---- Measure subtree widths in "units" ----
    const width = new Map<string, number>();
    const measure = (id: string): number => {
      if (width.has(id)) return width.get(id)!;
      const c = kids.get(id) ?? [];
      if (c.length === 0) {
        width.set(id, 1); // leaf
        return 1;
      }
      // sum child widths + 1 unit gap between each adjacent pair
      let total = 0;
      c.forEach((child, i) => {
        total += measure(child);
        if (i < c.length - 1) total += 1; // unit gap
      });
      width.set(id, Math.max(1, total));
      return total;
    };
    roots.forEach((r) => measure(r));

    // ---- Assign x in unit space (centered per parent) ----
    const xUnit = new Map<string, number>();
    const place = (id: string, leftUnit: number) => {
      const w = width.get(id)!;
      const center = leftUnit + w / 2;
      xUnit.set(id, center);

      const c = kids.get(id) ?? [];
      if (c.length === 0) return;

      let cursor = leftUnit;
      c.forEach((child, i) => {
        const cw = width.get(child)!;
        place(child, cursor);
        cursor += cw;
        if (i < c.length - 1) cursor += 1;
      });
    };

    // Forest layout (place roots left→right)
    const totalUnits =
      roots.reduce((acc, r) => acc + width.get(r)!, 0) +
      Math.max(roots.length - 1, 0) * gapUnitsBetweenRoots;

    let cursor = -totalUnits / 2;
    roots.forEach((r, i) => {
      place(r, cursor);
      cursor += width.get(r)!;
      if (i < roots.length - 1) cursor += gapUnitsBetweenRoots;
    });

    // ---- Convert to pixel nodes ----
    const unitToPx = (u: number) => u * horizontalSpacing;
    const nodes: Node[] = versions.map((v) => ({
      id: v.id,
      type: nodeType,
      position: {
        x: centerX + unitToPx(xUnit.get(v.id)!),
        y: startY + (depths.get(v.id) || 0) * verticalSpacing,
      },
      data: v,
    }));

    // ---- Only parent→child edges ----
    // Adjust edge styling based on mode
    const isDetailMode = nodeType === "versionNode";
    const edgeStyle = isDetailMode
      ? {
          stroke: "var(--primary-alternate)",
          strokeWidth: 3,
          opacity: 0.7,
        }
      : {
          stroke: "var(--primary-alternate)",
          strokeWidth: 1,
          opacity: 0.6,
        };
    
    const markerSize = isDetailMode ? 12 : 16;

    const edges: Edge[] = versions
      .filter((v) => v.parentVersion && vMap.has(v.parentVersion))
      .map((v) => ({
        id: `e-${v.parentVersion}-${v.id}`,
        source: v.parentVersion!,
        target: v.id,
        sourceHandle: "bottom",
        targetHandle: "top",
        animated: true,
        style: edgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--primary-alternate)",
          width: markerSize,
          height: markerSize,
        },
      }));

    return { nodes, edges, depths };
  }, [
    versions,
    verticalSpacing,
    horizontalSpacing,
    centerX,
    startY,
    nodeType,
    gapUnitsBetweenRoots,
  ]);

  return { nodes, edges, depths };
};

/**
 * Generate nodes for sorted metric view
 */
export const generateSortedNodes = (
  versions: ProjectVersion[],
  modeOrConfig: TreeLayoutMode | TreeLayoutConfig = 'DETAIL'
): Node[] => {
  // Determine the config to use
  const config: TreeLayoutConfig = 
    typeof modeOrConfig === 'string' 
      ? TREE_LAYOUT_CONFIGS[modeOrConfig]
      : modeOrConfig;

  const {
    verticalSpacing = TREE_LAYOUT_CONFIGS.DETAIL.verticalSpacing,
    centerX = TREE_LAYOUT_CONFIGS.DETAIL.centerX,
    startY = TREE_LAYOUT_CONFIGS.DETAIL.startY,
    nodeType = TREE_LAYOUT_CONFIGS.DETAIL.nodeType,
  } = config;

  return versions.map((version, index) => ({
    id: version.id,
    type: nodeType,
    position: {
      x: centerX,
      y: startY + index * verticalSpacing,
    },
    data: version,
  }));
};

/**
 * Generate edges for sorted metric view
 */
export const generateSortedEdges = (
  nodes: Node[],
  modeOrConfig: TreeLayoutMode | TreeLayoutConfig = 'DETAIL'
): Edge[] => {
  // Determine if we're in MINI or DETAIL mode
  const config: TreeLayoutConfig = 
    typeof modeOrConfig === 'string' 
      ? TREE_LAYOUT_CONFIGS[modeOrConfig]
      : modeOrConfig;
  
  const isDetailMode = config.nodeType === "versionNode" || 
                       (typeof modeOrConfig === 'string' && modeOrConfig === 'DETAIL');

  // Different edge styles for MINI vs DETAIL
  const edgeStyle = isDetailMode
    ? {
          stroke: "var(--primary-alternate)",
          strokeWidth: 3,
          opacity: 0.7,
        strokeDasharray: "8 4",
      }
    : {
          stroke: "var(--primary-alternate)",
          strokeWidth: 1,
          opacity: 0.6,
        strokeDasharray: "4 2",
      };

  const markerSize = isDetailMode ? 12 : 16;

  const edges: Edge[] = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `sort-${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      sourceHandle: "bottom",
      targetHandle: "top",
      animated: false,
      style: edgeStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "var(--primary-alternate)",
        width: markerSize,
        height: markerSize,
      },
    });
  }

  return edges;
};