// hooks/useAnalysisData.ts
import { useState, useEffect, useMemo } from "react";
import { AnalysisGroup, Analysis, Requirement, Metric } from "../versionNodes/utils/VersionInterfaces";

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
  runAnalysis: (analysisId: string) => Promise<void>;
  retryFailedAnalyses: () => Promise<void>;
}

// Mock data generators
const createMockRequirement = (
  name: string,
  category: "structural" | "thermal" | "modal",
  targetValue: number,
  unit: string,
  comparator: ">" | "<" | ">=" | "<=" | "==" | "!=",
  currentValue?: number
): Requirement => ({
  id: `req-${name.toLowerCase().replace(/\s+/g, '-')}`,
  name,
  description: `System must meet ${name} requirement`,
  targetValue,
  unit,
  comparator,
  category,
  priority: Math.random() > 0.5 ? "critical" : "important",
  currentValue,
  status: currentValue 
    ? (comparator === ">" && currentValue > targetValue) ||
      (comparator === "<" && currentValue < targetValue) ||
      (comparator === ">=" && currentValue >= targetValue) ||
      (comparator === "<=" && currentValue <= targetValue)
      ? "pass" 
      : "fail"
    : "pending"
});

const createMockAnalysis = (
  name: string,
  type: string,
  status: "pending" | "running" | "completed" | "failed",
  hasMetrics: boolean = true
): Analysis => {
  const analysis: Analysis = {
    id: `analysis-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    type,
    status,
    metrics: [],
    executedAt: status === "completed" || status === "failed" 
      ? new Date(Date.now() - Math.random() * 86400000).toISOString() 
      : undefined,
    duration: status === "completed" || status === "failed"
      ? Math.floor(Math.random() * 3600) 
      : undefined,
    progress: status === "running" ? Math.floor(Math.random() * 80) + 20 : undefined
  };

  if (hasMetrics && (status === "completed" || status === "running")) {
    // Add some mock metrics based on analysis type
    if (type === "stress") {
      analysis.metrics = [
        {
          title: "Von Mises Stress",
          type: "structural_stress",
          values: [
            { label: "Maximum", value: 245e6, unit: "Pa" },
            { label: "Average", value: 180e6, unit: "Pa" },
            { label: "Minimum", value: 95e6, unit: "Pa" }
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize"
        }
      ];
    } else if (type === "deformation") {
      analysis.metrics = [
        {
          title: "Total Deformation",
          type: "displacement",
          values: [
            { label: "Maximum", value: 0.0012, unit: "m" },
            { label: "Average", value: 0.0008, unit: "m" },
            { label: "Minimum", value: 0.0001, unit: "m" }
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize"
        }
      ];
    } else if (type === "thermal") {
      analysis.metrics = [
        {
          title: "Temperature Distribution",
          type: "temperature",
          values: [
            { label: "Maximum", value: 85, unit: "°C" },
            { label: "Average", value: 65, unit: "°C" },
            { label: "Minimum", value: 25, unit: "°C" }
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize"
        }
      ];
    }
  }

  if (status === "failed") {
    analysis.errors = ["Analysis convergence failed at iteration 245", "Maximum iterations reached"];
  }

  return analysis;
};

const createMockAnalysisGroups = (): AnalysisGroup[] => {
  return [
    {
      id: "structural-group",
      name: "Structural",
      status: "partial",
      analyses: [
        createMockAnalysis("Static Structural Analysis", "stress", "completed"),
        createMockAnalysis("Deformation Analysis", "deformation", "completed"),
        createMockAnalysis("Safety Factor Analysis", "safety", "failed"),
        createMockAnalysis("Buckling Analysis", "buckling", "running"),
        createMockAnalysis("Fatigue Analysis", "fatigue", "pending")
      ],
      requirements: [
        createMockRequirement("Maximum Stress", "structural", 250e6, "Pa", "<", 245e6),
        createMockRequirement("Maximum Deformation", "structural", 0.002, "m", "<", 0.0012),
        createMockRequirement("Minimum Safety Factor", "structural", 2.0, "", ">", 1.8)
      ]
    },
    {
      id: "thermal-group",
      name: "Thermal",
      status: "passed",
      analyses: [
        createMockAnalysis("Steady-State Thermal", "thermal", "completed"),
        createMockAnalysis("Transient Thermal", "thermal_transient", "completed"),
        createMockAnalysis("Thermal Stress", "thermal_stress", "completed")
      ],
      requirements: [
        createMockRequirement("Maximum Temperature", "thermal", 100, "°C", "<", 85),
        createMockRequirement("Temperature Gradient", "thermal", 50, "°C/m", "<", 42)
      ]
    },
    {
      id: "modal-group",
      name: "Modal",
      status: "pending",
      analyses: [
        createMockAnalysis("Natural Frequency", "modal_frequency", "pending"),
        createMockAnalysis("Mode Shapes", "modal_shapes", "pending"),
        createMockAnalysis("Harmonic Response", "harmonic", "pending")
      ],
      requirements: [
        createMockRequirement("First Natural Frequency", "modal", 1000, "Hz", ">"),
        createMockRequirement("Frequency Separation", "modal", 10, "%", ">")
      ]
    }
  ];
};

export const useAnalysisData = ({
  projectId,
  versionId,
  refreshKey = 0,
  useMockData = true
}: UseAnalysisDataProps): UseAnalysisDataReturn => {
  const [analysisGroups, setAnalysisGroups] = useState<AnalysisGroup[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load analysis data
  useEffect(() => {
    if (useMockData) {
      // Use mock data
      const mockGroups = createMockAnalysisGroups();
      setAnalysisGroups(mockGroups);
      
      // Collect all requirements from groups
      const allRequirements = mockGroups.flatMap(g => g.requirements || []);
      setRequirements(allRequirements);
    } else {
      // TODO: Implement real data fetching
      setIsLoading(true);
      // Simulate async loading
      setTimeout(() => {
        setAnalysisGroups([]);
        setRequirements([]);
        setIsLoading(false);
      }, 1000);
    }
  }, [projectId, versionId, refreshKey, useMockData]);

  // Analysis execution handlers
  const runAnalysis = async (analysisId: string) => {
    // TODO: Implement actual analysis execution
    console.log(`Running analysis: ${analysisId}`);
    
    // Update the status to running
    setAnalysisGroups(prev => prev.map(group => ({
      ...group,
      analyses: group.analyses.map(analysis =>
        analysis.id === analysisId
          ? { ...analysis, status: "running" as const, progress: 0 }
          : analysis
      )
    })));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setAnalysisGroups(prev => prev.map(group => ({
        ...group,
        analyses: group.analyses.map(analysis =>
          analysis.id === analysisId
            ? { ...analysis, progress }
            : analysis
        )
      })));

      if (progress >= 100) {
        clearInterval(interval);
        // Complete the analysis
        setAnalysisGroups(prev => prev.map(group => ({
          ...group,
          analyses: group.analyses.map(analysis =>
            analysis.id === analysisId
              ? { 
                  ...analysis, 
                  status: "completed" as const, 
                  progress: undefined,
                  executedAt: new Date().toISOString(),
                  duration: Math.floor(Math.random() * 600) + 60
                }
              : analysis
          )
        })));
      }
    }, 500);
  };

  const retryFailedAnalyses = async () => {
    // Find all failed analyses and retry them
    analysisGroups.forEach(group => {
      group.analyses.forEach(analysis => {
        if (analysis.status === "failed") {
          runAnalysis(analysis.id);
        }
      });
    });
  };

  return {
    analysisGroups,
    requirements,
    isLoading,
    error,
    runAnalysis,
    retryFailedAnalyses
  };
};

// Export helper to clear analysis cache if needed
export const clearAnalysisDataCache = () => {
  // TODO: Implement cache clearing if needed
};