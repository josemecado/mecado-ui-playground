// hooks/useAnalysisData.ts
import { useState, useEffect, useCallback } from "react";
import {
  AnalysisGroup,
  Analysis,
  Requirement,
  Metric,
} from "../versionNodes/utils/VersionInterfaces";
import { createMockAnalysisGroups } from "./utils/mockAnalysisData";

interface UseAnalysisDataProps {
  projectId: string;
  versionId: string;
  refreshKey?: number;
  useMockData?: boolean;
}

interface UseAnalysisDataReturn {
  analysisGroups: AnalysisGroup[];
  requirements: Requirement[];
  isLoading: boolean;
  error: string | null;
  updateAnalysisGroup: (groupId: string, updatedGroup: AnalysisGroup) => void;
}

export const useAnalysisData = ({
  projectId,
  versionId,
  refreshKey = 0,
  useMockData = true,
}: UseAnalysisDataProps): UseAnalysisDataReturn => {
  const [analysisGroups, setAnalysisGroups] = useState<AnalysisGroup[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load analysis data
  useEffect(() => {
    if (useMockData) {
      // Import from centralized mock data
      const mockGroups = createMockAnalysisGroups();
      setAnalysisGroups(mockGroups);

      // Aggregate ALL requirements from all analyses across all groups
      const allRequirements = mockGroups.flatMap((g) =>
        g.analyses.flatMap((a) => a.requirements || [])
      );
      setRequirements(allRequirements);
    } else {
      // Real data fetching logic would go here
      setIsLoading(true);
      // TODO: Fetch real data from API
      setTimeout(() => {
        setAnalysisGroups([]);
        setRequirements([]);
        setIsLoading(false);
      }, 1000);
    }
  }, [projectId, versionId, refreshKey, useMockData]);

  const updateAnalysisGroup = useCallback(
    (groupId: string, updatedGroup: AnalysisGroup) => {
      setAnalysisGroups((prev) => {
        const updated = prev.map((g) => (g.id === groupId ? updatedGroup : g));

        // Update aggregated requirements using the UPDATED groups
        const allRequirements = updated.flatMap((g) =>
          g.analyses.flatMap((a) => a.requirements || [])
        );
        setRequirements(allRequirements);

        return updated;
      });
    },
    []
  );

  return {
    analysisGroups,
    requirements,
    isLoading,
    error,
    updateAnalysisGroup,
  };
};

export const clearAnalysisDataCache = () => {
  // TODO: Implement cache clearing if needed
};