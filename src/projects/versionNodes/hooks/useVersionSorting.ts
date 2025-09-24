// hooks/useVersionSorting.ts
import { useState, useMemo, useCallback } from "react";
import { ProjectVersion, Metric } from "../utils/VersionInterfaces";
import { calculateAllMetricDifferences } from "./metricDifferenceCalculator";
import { Node } from "@xyflow/react";
import { generateSortedNodes, generateSortedEdges } from "./useVersionTreeLayout";

export interface SortingConfig {
  metricTitle: string;
  order: "asc" | "desc";
  comparisonType: "baseline" | "sequential";
}

interface UseVersionSortingReturn {
  sortConfig: SortingConfig | null;
  setSortConfig: (config: SortingConfig | null) => void;
  sortedVersions: ProjectVersion[];
  availableMetrics: Metric[];
  clearSort: () => void;
  applySortToNodes: (baseNodes: Node[]) => { nodes: Node[]; edges: any[] };
}

/**
 * Hook for managing version sorting by metrics
 * Handles metric-based reordering and difference calculations
 */
export const useVersionSorting = (
  versions: ProjectVersion[]
): UseVersionSortingReturn => {
  const [sortConfig, setSortConfig] = useState<SortingConfig | null>(null);

  // Extract all unique metrics from all versions
  const availableMetrics = useMemo(() => {
    const metricsMap = new Map<string, Metric>();
    
    versions.forEach((version) => {
      version.metrics.forEach((metric) => {
        const key = `${metric.title}-${metric.type}`;
        if (!metricsMap.has(key)) {
          metricsMap.set(key, metric);
        }
      });
    });
    
    return Array.from(metricsMap.values());
  }, [versions]);

  // Apply sorting and recalculate differences
  const sortedVersions = useMemo(() => {
    if (!sortConfig) return versions;

    // Sort versions by selected metric
    const sorted = [...versions].sort((a, b) => {
      const aMetric = a.metrics?.find((m) => m.title === sortConfig.metricTitle);
      const bMetric = b.metrics?.find((m) => m.title === sortConfig.metricTitle);

      const aValue = aMetric?.value ?? 0;
      const bValue = bMetric?.value ?? 0;

      const comparison = aValue - bValue;
      return sortConfig.order === "asc" ? comparison : -comparison;
    });

    // Recalculate differences based on comparison type
    return applyDifferencesBasedOnSort(sorted, sortConfig);
  }, [versions, sortConfig]);

  // Clear sorting
  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  // Generate sorted nodes and edges when sorting is active
  const applySortToNodes = useCallback(
    (baseNodes: Node[]) => {
      if (!sortConfig) {
        // Return original nodes if no sorting
        return { nodes: baseNodes, edges: [] };
      }

      // Generate sorted layout
      const sortedNodes = generateSortedNodes(sortedVersions, {
        verticalSpacing: 400,
        centerX: 400,
        startY: 100,
        nodeType: baseNodes[0]?.type || "versionNode",
      });

      // Add sort config and other data to nodes
      const nodesWithData = sortedNodes.map((node) => {
        const originalNode = baseNodes.find((n) => n.id === node.id);
        const version = sortedVersions.find((v) => v.id === node.id);
        
        return {
          ...node,
          data: {
            ...version,
            sortConfig,
            ...(originalNode?.data || {}),
          },
          selected: originalNode?.selected,
        };
      });

      const sortedEdges = generateSortedEdges(nodesWithData);

      return { nodes: nodesWithData, edges: sortedEdges };
    },
    [sortConfig, sortedVersions]
  );

  return {
    sortConfig,
    setSortConfig,
    sortedVersions,
    availableMetrics,
    clearSort,
    applySortToNodes,
  };
};

/**
 * Apply metric differences based on sort configuration
 */
function applyDifferencesBasedOnSort(
  sortedVersions: ProjectVersion[],
  sortConfig: SortingConfig
): ProjectVersion[] {
  if (sortedVersions.length === 0) return sortedVersions;

  if (sortConfig.comparisonType === "baseline") {
    // Compare all to first (best/worst based on sort)
    const baseline = sortedVersions[0];
    const baselineWithNoDiff: ProjectVersion = {
      ...baseline,
      metrics: baseline.metrics.map((m) => ({
        ...m,
        difference: undefined,
        parentValue: undefined,
      })),
    };

    const versionsWithDifferences = [baselineWithNoDiff];

    for (let i = 1; i < sortedVersions.length; i++) {
      const currentVersion = sortedVersions[i];
      const metricsWithDifferences = calculateAllMetricDifferences(
        currentVersion.metrics,
        baseline.metrics
      );

      versionsWithDifferences.push({
        ...currentVersion,
        metrics: metricsWithDifferences,
      });
    }

    return versionsWithDifferences;
  } else {
    // Sequential comparison - each to previous
    return sortedVersions.map((version, i) => {
      if (i === 0) {
        // First version has no differences
        return {
          ...version,
          metrics: version.metrics.map((m) => ({
            ...m,
            difference: undefined,
            parentValue: undefined,
          })),
        };
      } else {
        // Compare to previous version
        const previousVersion = sortedVersions[i - 1];
        const metricsWithDifferences = calculateAllMetricDifferences(
          version.metrics,
          previousVersion.metrics
        );

        return {
          ...version,
          metrics: metricsWithDifferences,
        };
      }
    });
  }
}