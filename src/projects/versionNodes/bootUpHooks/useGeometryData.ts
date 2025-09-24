// hooks/useGeometryData.ts
import { useState, useEffect } from "react";
import { GeometryData } from "../utils/VersionInterfaces";

interface VersionLabel {
  label: string;
  num: number;
}

interface UseGeometryDataReturn {
  geometryByVersion: Map<string, GeometryData | null>;
  isLoading: boolean;
  error: string | null;
}

// Cache for geometry data
const geometryCache = new Map<string, GeometryData | null>();

const createCacheKey = (projectId: string, versionNum: number): string =>
  `${projectId}-${versionNum}`;

export const useGeometryData = (
  projectId: string,
  sortedVersions: VersionLabel[],
  refreshKey: number = 0
): UseGeometryDataReturn => {
  const [geometryByVersion, setGeometryByVersion] = useState<Map<string, GeometryData | null>>(
    new Map()
  );
  const [loadingGeometry, setLoadingGeometry] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadGeometryForVersion = async (versionNum: number, versionLabel: string) => {
      const cacheKey = createCacheKey(projectId, versionNum);

      // Check cache first (skip if refreshKey changed)
      if (refreshKey === 0 && geometryCache.has(cacheKey)) {
        const cachedData = geometryCache.get(cacheKey);
        setGeometryByVersion((prev) => new Map(prev).set(versionLabel, cachedData || null));
        return;
      }

      if (!projectId || loadingGeometry.has(cacheKey)) return;

      setLoadingGeometry((prev) => new Set(prev).add(cacheKey));
      setError(null);

      try {
        const geometryStatus = await window.projectAPI.geometry.checkGeometryStatus(
          projectId,
          versionNum
        );

        if (!geometryStatus.hasStep || !geometryStatus.hasViz) {
          setGeometryByVersion((prev) => new Map(prev).set(versionLabel, null));
          geometryCache.set(cacheKey, null);
          return;
        }

        const vizResult = await window.projectAPI.geometry.getVisualizationFiles(
          projectId,
          versionNum
        );

        if (!mounted) return;

        if (vizResult.success && vizResult.faces && vizResult.edges && vizResult.bodies) {
          const geometryData: GeometryData = {
            facesFile: vizResult.faces,
            edgesFile: vizResult.edges,
            bodiesFile: vizResult.bodies,
            fileName: `Version ${versionNum} Geometry`,
          };

          geometryCache.set(cacheKey, geometryData);
          setGeometryByVersion((prev) => new Map(prev).set(versionLabel, geometryData));
        } else {
          setGeometryByVersion((prev) => new Map(prev).set(versionLabel, null));
          geometryCache.set(cacheKey, null);
        }
      } catch (error) {
        console.error(`Error loading geometry for version ${versionNum}:`, error);
        if (!mounted) return;
        setError(`Failed to load geometry for version ${versionNum}`);
        setGeometryByVersion((prev) => new Map(prev).set(versionLabel, null));
        geometryCache.set(cacheKey, null);
      } finally {
        setLoadingGeometry((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
      }
    };

    // Load geometry for all versions
    sortedVersions.forEach((v) => loadGeometryForVersion(v.num, v.label));

    return () => {
      mounted = false;
    };
  }, [projectId, sortedVersions, refreshKey]);

  return {
    geometryByVersion,
    isLoading: loadingGeometry.size > 0,
    error,
  };
};

// Export helper to clear geometry cache
export const clearGeometryCache = () => {
  geometryCache.clear();
};