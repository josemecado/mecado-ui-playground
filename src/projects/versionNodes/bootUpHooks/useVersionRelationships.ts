// hooks/useVersionRelationships.ts
import { useMemo } from "react";
import { Metric } from "../utils/VersionInterfaces";
import { SimpleVersionRelationshipStorage } from "../hooks/versionRelationshipStorage";
import { calculateAllMetricDifferences, getOptimizationTarget } from "../hooks/metricDifferenceCalculator";

interface VersionLabel {
  label: string;
  num: number;
}

interface UseVersionRelationshipsReturn {
  getParentVersionId: (versionId: string) => string | null;
  getChildVersionIds: (versionId: string) => string[];
  isVersionArchived: (versionId: string) => boolean;
  enhanceMetricsWithDifferences: (
    versionId: string,
    versionMetrics: Metric[],
    allVersionsWithMetrics: Map<string, Metric[]>
  ) => Metric[];
}

export const useVersionRelationships = (
  projectId: string,
  sortedVersions: VersionLabel[]
): UseVersionRelationshipsReturn => {
  // Initialize relationships if needed
  useMemo(() => {
    if (projectId && sortedVersions.length > 0) {
      const existingRelationships = SimpleVersionRelationshipStorage.getProjectRelationships(projectId);
      const relationshipMap = SimpleVersionRelationshipStorage.getRelationshipMap()[projectId];

      const usingMockData = !relationshipMap || Object.keys(relationshipMap || {}).length === 0;

      if (usingMockData) {
        console.log("=== USING MOCK RELATIONSHIP DATA ===");
        console.log("Project ID:", projectId);
        console.log("Mock relationships:", existingRelationships);
        console.log("Available version labels:", sortedVersions.map((s) => s.label));
      } else {
        console.log("Using stored relationships for project:", projectId);
      }
    }
  }, [projectId, sortedVersions]);

  const getParentVersionId = (versionId: string): string | null => {
    return SimpleVersionRelationshipStorage.getParentVersionId(projectId, versionId);
  };

  const getChildVersionIds = (versionId: string): string[] => {
    return SimpleVersionRelationshipStorage.getChildVersionIds(projectId, versionId);
  };

  const isVersionArchived = (versionId: string): boolean => {
    return SimpleVersionRelationshipStorage.isVersionArchived(projectId, versionId);
  };

  const enhanceMetricsWithDifferences = (
    versionId: string,
    versionMetrics: Metric[],
    allVersionsWithMetrics: Map<string, Metric[]>
  ): Metric[] => {
    const parentVersionId = getParentVersionId(versionId);

    if (!parentVersionId) {
      // Root version - add optimization targets
      return versionMetrics.map((metric) => ({
        ...metric,
        optimizationTarget: getOptimizationTarget(metric),
        isOptimized: true,
      }));
    }

    const parentMetrics = allVersionsWithMetrics.get(parentVersionId);
    if (!parentMetrics) return versionMetrics;

    // Gather version history for trend calculation
    const versionHistory: Array<{ versionId: string; metrics: Metric[] }> = [];
    let currentVersionId = parentVersionId;

    while (currentVersionId) {
      const currentMetrics = allVersionsWithMetrics.get(currentVersionId);
      if (currentMetrics) {
        versionHistory.unshift({
          versionId: currentVersionId,
          metrics: currentMetrics,
        });
      }

      const parentOfCurrent = getParentVersionId(currentVersionId);
      if (parentOfCurrent) {
        currentVersionId = parentOfCurrent;
      } else {
        break;
      }
    }

    // Calculate differences with historical context
    return calculateAllMetricDifferences(versionMetrics, parentMetrics, versionHistory);
  };

  return {
    getParentVersionId,
    getChildVersionIds,
    isVersionArchived,
    enhanceMetricsWithDifferences,
  };
};