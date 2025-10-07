// hooks/useAnalysisData.ts
import { useState, useEffect } from "react";
import {
  AnalysisGroup,
  Requirement,
} from "../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { createMockAnalysisGroups } from "./utils/mockAnalysisData";

interface UseAnalysisDataProps {
  projectId: string;
  versionId: string;
  refreshKey?: number;
  useMockData?: boolean;
  customConfiguration?: {
    requirements: Requirement[];
    analysisGroups: AnalysisGroup[];
  } | null;
}

interface UseAnalysisDataReturn {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;
}

export const useAnalysisData = ({
  projectId,
  versionId,
  refreshKey = 0,
  useMockData = true,
  customConfiguration = null,
}: UseAnalysisDataProps): UseAnalysisDataReturn => {
  const [analysisGroups, setAnalysisGroups] = useState<AnalysisGroup[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load analysis data - READ ONLY
  useEffect(() => {
    // Priority 1: Use custom configuration if provided
    if (customConfiguration) {
      setAnalysisGroups(customConfiguration.analysisGroups);
      setRequirements(customConfiguration.requirements);
      return;
    }

    // Priority 2: Try to load from localStorage for this version
    const storageKey = `analysis-config-${projectId}-${versionId}`;
    const savedConfig = localStorage.getItem(storageKey);
    
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setAnalysisGroups(parsed.analysisGroups);
        setRequirements(parsed.requirements);
        return;
      } catch (e) {
        console.error("Failed to parse saved configuration:", e);
      }
    }

    // Priority 3: Fall back to mock data
    if (useMockData) {
      const mockGroups = createMockAnalysisGroups();
      setAnalysisGroups(mockGroups);

      const allRequirements = mockGroups.flatMap((g) =>
        g.analyses.flatMap((a) => a.requirements || [])
      );
      setRequirements(allRequirements);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setAnalysisGroups([]);
        setRequirements([]);
        setIsLoading(false);
      }, 1000);
    }
  }, [projectId, versionId, refreshKey, useMockData, customConfiguration]);

  return {
    analysisGroups,
    requirements,
    isLoading,
    error,
  };
};

// Helper to save configuration to localStorage
export const saveAnalysisConfiguration = (
  projectId: string,
  versionId: string,
  config: {
    requirements: Requirement[];
    analysisGroups: AnalysisGroup[];
  }
) => {
  const storageKey = `analysis-config-${projectId}-${versionId}`;
  localStorage.setItem(storageKey, JSON.stringify(config));
};

// Helper to clear configuration
export const clearAnalysisConfiguration = (
  projectId: string,
  versionId: string
) => {
  const storageKey = `analysis-config-${projectId}-${versionId}`;
  localStorage.removeItem(storageKey);
};