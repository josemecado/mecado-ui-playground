// hooks/useAnalysisData.ts
import { useState, useEffect } from "react";
import {
  AnalysisGroup,
  Requirement,
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
  // REMOVED: updateAnalysisGroup
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

  // Load analysis data - READ ONLY
  useEffect(() => {
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
  }, [projectId, versionId, refreshKey, useMockData]);

  return {
    analysisGroups,
    requirements,
    isLoading,
    error,
    // No updateAnalysisGroup - read only!
  };
};