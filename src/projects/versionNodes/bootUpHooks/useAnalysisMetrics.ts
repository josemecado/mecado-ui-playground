// hooks/useAnalysisMetrics.ts
import { useState, useEffect } from "react";
import { Metric } from "../utils/VersionInterfaces";

interface VersionLabel {
  label: string;
  num: number;
}

interface UseAnalysisMetricsReturn {
  metricsByVersion: Map<string, Metric[]>;
  isLoading: boolean;
  error: string | null;
}

// Cache for analysis data
const analysisCache = new Map<string, Metric[]>();

const createCacheKey = (projectId: string, versionNum: number): string =>
  `${projectId}-${versionNum}`;

export const useAnalysisMetrics = (
  projectId: string,
  sortedVersions: VersionLabel[],
  refreshKey: number = 0
): UseAnalysisMetricsReturn => {
  const [metricsByVersion, setMetricsByVersion] = useState<Map<string, Metric[]>>(new Map());
  const [loadingAnalysis, setLoadingAnalysis] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAnalysisForVersion = async (versionNum: number, versionLabel: string) => {
      const cacheKey = createCacheKey(projectId, versionNum);

      // Check cache first (skip if refreshKey changed)
      if (refreshKey === 0 && analysisCache.has(cacheKey)) {
        const cachedData = analysisCache.get(cacheKey);
        setMetricsByVersion((prev) => new Map(prev).set(versionLabel, cachedData || []));
        return;
      }

      if (!projectId || loadingAnalysis.has(cacheKey)) return;

      setLoadingAnalysis((prev) => new Set(prev).add(cacheKey));
      setError(null);

      try {
        // Try to fetch real analysis data first
        let metrics: Metric[] = [];

        try {
          // Attempt to get real analysis state from the project API
          metrics = await window.projectAPI.project.getMetrics(projectId, versionNum);
          console.log(`Loaded real metrics for version ${versionNum}:`, metrics);
        } catch (realDataError) {
          // Fall back to empty metrics if no real data available
          console.log(`No analysis data available for version ${versionNum}`);
          metrics = [];
        }

        if (!mounted) return;

        analysisCache.set(cacheKey, metrics);
        setMetricsByVersion((prev) => new Map(prev).set(versionLabel, metrics));
      } catch (error) {
        console.error(`Error loading analysis for version ${versionNum}:`, error);
        if (!mounted) return;

        setError(`Failed to load analysis data for version ${versionNum}`);
        // Use empty metrics as final fallback
        const fallbackMetrics: Metric[] = [];
        analysisCache.set(cacheKey, fallbackMetrics);
        setMetricsByVersion((prev) => new Map(prev).set(versionLabel, fallbackMetrics));
      } finally {
        setLoadingAnalysis((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
      }
    };

    // Load analysis for all versions
    sortedVersions.forEach((v) => loadAnalysisForVersion(v.num, v.label));

    return () => {
      mounted = false;
    };
  }, [projectId, sortedVersions, refreshKey]);

  return {
    metricsByVersion,
    isLoading: loadingAnalysis.size > 0,
    error,
  };
};

// Export helper to clear analysis cache
export const clearAnalysisCache = () => {
  analysisCache.clear();
};