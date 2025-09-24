// hooks/useProjectVersions.ts - Main orchestrator hook with mock data support
import React, { useMemo, useEffect, useState } from "react";
import { ProjectVersion, VersionGeometry, Metric } from "../utils/VersionInterfaces";
import { Equation } from "../../../reusable-components/models/vulcanModels";

// Import specialized hooks
import { useGeometryData, clearGeometryCache } from "./useGeometryData";
import { useAnalysisMetrics, clearAnalysisCache } from "./useAnalysisMetrics";
import { useVersionFiles } from "./useVersionFiles";
import { useVersionRelationships } from "./useVersionRelationships";

// Types
interface VersionLabel {
  label: string;
  num: number;
}

interface UseProjectVersionsProps {
  projectId: string;
  projectVersions: string[] | null;
  pinnedEquations?: Equation[];
  uploadedFilesRefreshKey?: number;
  generatedDocsRefreshKey?: number;
  refreshKey?: number;
  // NEW: Mock data mode
  useMockData?: boolean;
}

interface UseProjectVersionsReturn {
  versions: ProjectVersion[];
  isLoadingGeometry: boolean;
  isLoadingFiles: boolean;
  isLoadingAnalysis: boolean;
  errors: {
    geometry: string | null;
    analysis: string | null;
    files: string | null;
  };
}

// Mock data generators
const createMockMetric = (
  title: string,
  type: string,
  value: number,
  unit: string,
  optimizationTarget: "minimize" | "maximize" = "minimize",
  hasParent: boolean = false
): Metric => {
  const metric: Metric = {
    title,
    type,
    values: [
      { label: "Maximum", value: value * 1.2, unit },
      { label: "Average", value: value, unit },
      { label: "Minimum", value: value * 0.8, unit },
    ],
    primaryValueLabel: "Maximum",
    optimizationTarget,
  };

  if (hasParent) {
    const parentValue = value * (optimizationTarget === "minimize" ? 1.3 : 0.7);
    metric.parentValues = [
      { label: "Maximum", value: parentValue * 1.2, unit },
      { label: "Average", value: parentValue, unit },
      { label: "Minimum", value: parentValue * 0.8, unit },
    ];

    const changeDirection = value > parentValue ? "increase" : "decrease";
    const percentage = Math.abs(((value - parentValue) / parentValue) * 100);

    metric.differences = [
      {
        absolute: Math.abs(value * 1.2 - parentValue * 1.2),
        percentage: percentage,
        direction: changeDirection,
        valueLabel: "Maximum",
      },
      {
        absolute: Math.abs(value - parentValue),
        percentage: percentage,
        direction: changeDirection,
        valueLabel: "Average",
      },
      {
        absolute: Math.abs(value * 0.8 - parentValue * 0.8),
        percentage: percentage,
        direction: changeDirection,
        valueLabel: "Minimum",
      },
    ];
  }

  return metric;
};

const createMockVersions = (pinnedEquations: Equation[]): ProjectVersion[] => {
  const now = new Date().toISOString();
  
  return [
    // Empty version
    {
      id: "v1",
      title: "Version 1",
      parentVersion: null,
      createdAt: now,
      geometries: [],
      geometry: {
        id: "geo-v1",
        data: undefined,
        renderContent: undefined,
        placeholder: "No geometry loaded",
      },
      pinnedEquations,
      uploadedFiles: [],
      generatedFiles: [],
      metrics: [],
      edges: [],
      isArchived: false,
    },

    // Partial version
    {
      id: "v2", 
      title: "Version 2",
      parentVersion: "v1",
      createdAt: now,
      geometries: [],
      geometry: {
        id: "geo-v2",
        data: undefined,
        renderContent: undefined,
        placeholder: "Geometry inherited from parent",
      },
      pinnedEquations,
      uploadedFiles: [],
      generatedFiles: [],
      metrics: [
        createMockMetric("Von Mises Stress", "structural_stress", 245000000, "Pa", "minimize", true),
        createMockMetric("Total Deformation", "displacement", 0.0012, "m", "minimize", true),
      ],
      edges: [],
      isArchived: false,
    },

    // Full version
    {
      id: "v3",
      title: "Version 3", 
      parentVersion: "v2",
      createdAt: now,
      geometries: [],
      geometry: {
        id: "geo-v3",
        data: undefined,
        renderContent: undefined,
        placeholder: "Geometry inherited from parent",
      },
      pinnedEquations,
      uploadedFiles: [],
      generatedFiles: [],
      metrics: [
        createMockMetric("Von Mises Stress", "structural_stress", 198000000, "Pa", "minimize", true),
        createMockMetric("Total Deformation", "displacement", 0.00095, "m", "minimize", true),
        createMockMetric("Safety Factor", "safety_analysis", 2.4, "", "maximize", true),
        createMockMetric("Mass", "physical_property", 0.85, "kg", "minimize", true),
        createMockMetric("Natural Frequency", "modal_analysis", 1420, "Hz", "maximize", true),
      ],
      edges: [],
      isArchived: false,
    },

    // Archived version
    {
      id: "v4",
      title: "Version 4",
      parentVersion: "v3",
      createdAt: now,
      geometries: [],
      geometry: {
        id: "geo-v4",
        data: undefined,
        renderContent: undefined,
        placeholder: "Geometry hidden in archived state",
      },
      pinnedEquations,
      uploadedFiles: [],
      generatedFiles: [],
      metrics: [
        createMockMetric("Von Mises Stress", "structural_stress", 220000000, "Pa", "minimize", true),
        createMockMetric("Total Deformation", "displacement", 0.0011, "m", "minimize", true),
      ],
      edges: [],
      isArchived: true,
    },

    // AI generating version (will show as generating when aiGenerating flag is set)
    {
      id: "v5",
      title: "Version 5",
      parentVersion: "v3", 
      createdAt: now,
      geometries: [],
      geometry: {
        id: "geo-v5",
        data: undefined,
        renderContent: undefined,
        placeholder: "Geometry will be inherited after generation",
      },
      pinnedEquations,
      uploadedFiles: [],
      generatedFiles: [],
      metrics: [],
      edges: [],
      isArchived: false,
    },
  ];
};

const createCacheKey = (projectId: string, versionNum: number): string =>
  `${projectId}-${versionNum}`;

// Helper to extract version number from ID
const extractVersionNumber = (id: string): number => {
  const match = id.match(/v(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Main hook
export const useProjectVersions = ({
  projectId,
  projectVersions,
  pinnedEquations = [],
  uploadedFilesRefreshKey,
  generatedDocsRefreshKey,
  refreshKey = 0,
  useMockData = false, // NEW: Enable mock data mode
}: UseProjectVersionsProps): UseProjectVersionsReturn => {

  // NEW: Return mock data when requested or when no real project versions exist
  const shouldUseMockData = useMockData || !projectVersions || projectVersions.length === 0;

  if (shouldUseMockData) {
    const mockVersions = useMemo(() => createMockVersions(pinnedEquations), [pinnedEquations]);
    
    return {
      versions: mockVersions,
      isLoadingGeometry: false,
      isLoadingFiles: false,
      isLoadingAnalysis: false,
      errors: {
        geometry: null,
        analysis: null,
        files: null,
      },
    };
  }

  // Original implementation for real data...
  const sortedVersions = useMemo(() => {
    if (!projectVersions) return [];
    return projectVersions
      .map((label) => ({ label, num: extractVersionNumber(label) }))
      .filter((x) => Number.isFinite(x.num))
      .sort((a, b) => a.num - b.num);
  }, [projectVersions]);

  // 2. DATA FETCHING (delegated to specialized hooks)
  const geometry = useGeometryData(projectId, sortedVersions, refreshKey);
  const metrics = useAnalysisMetrics(projectId, sortedVersions, refreshKey);
  const files = useVersionFiles(
    projectId,
    sortedVersions,
    uploadedFilesRefreshKey,
    generatedDocsRefreshKey
  );
  const relationships = useVersionRelationships(projectId, sortedVersions);

  // 3. VERSION ASSEMBLY
  const baseVersions = useMemo(() => {
    const now = new Date().toISOString();

    return sortedVersions.map((v) => {
      const versionNum = v.num;
      const uploadedFiles = files.uploadedFilesByVersion.get(versionNum) || [];
      const generatedFiles = files.generatedFilesByVersion.get(versionNum) || [];
      const geometryData = geometry.geometryByVersion.get(v.label);
      const parentVersionId = relationships.getParentVersionId(v.label);
      const baseMetrics = metrics.metricsByVersion.get(v.label) || [];

      // Create version geometry
      let versionGeometry: VersionGeometry;
      if (geometryData) {
        versionGeometry = {
          id: `geo-${v.label}`,
          data: geometryData,
          renderContent: () => <></>,
          placeholder: `Geometry for Version ${versionNum}`,
        };
      } else {
        const cacheKey = createCacheKey(projectId, versionNum);
        const isLoading = geometry.isLoading;
        versionGeometry = {
          id: `geo-${v.label}`,
          data: undefined,
          renderContent: undefined,
          placeholder: isLoading
            ? `Loading geometry for Version ${versionNum}...`
            : `No geometry available for Version ${versionNum}`,
        };
      }

      return {
        id: v.label,
        title: `Version ${v.num}`,
        parentVersion: parentVersionId,
        createdAt: now,
        geometries: [],
        geometry: versionGeometry,
        pinnedEquations,
        uploadedFiles,
        generatedFiles,
        metrics: baseMetrics,
        edges: [],
        isArchived: relationships.isVersionArchived(v.label),
      } as ProjectVersion;
    });
  }, [
    sortedVersions,
    projectId,
    pinnedEquations,
    files.uploadedFilesByVersion,
    files.generatedFilesByVersion,
    geometry.geometryByVersion,
    metrics.metricsByVersion,
    geometry.isLoading,
    relationships,
  ]);

  // 4. METRIC ENHANCEMENT (differences, trends, optimization)
  const enhancedVersions = useMemo(() => {
    // Create metrics map for lookup during enhancement
    const allVersionsWithMetrics = new Map<string, typeof baseVersions[0]["metrics"]>();
    baseVersions.forEach((version) => {
      allVersionsWithMetrics.set(version.id, version.metrics);
    });

    // Enhance each version's metrics with differences and relationships
    return baseVersions.map((version) => ({
      ...version,
      metrics: relationships.enhanceMetricsWithDifferences(
        version.id,
        version.metrics,
        allVersionsWithMetrics
      ),
    }));
  }, [baseVersions, relationships]);

  // Clear caches when project changes
  useEffect(() => {
    clearGeometryCache();
    clearAnalysisCache();
  }, [projectId]);

  // 5. RETURN STATE
  return {
    versions: enhancedVersions,
    isLoadingGeometry: geometry.isLoading,
    isLoadingFiles: files.isLoading,
    isLoadingAnalysis: metrics.isLoading,
    errors: {
      geometry: geometry.error,
      analysis: metrics.error,
      files: files.error,
    },
  };
};

// Export helper to clear all caches
export const clearAllCaches = () => {
  clearGeometryCache();
  clearAnalysisCache();
};