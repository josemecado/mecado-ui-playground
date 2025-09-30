// hooks/useAnalysisData.ts
import { useState, useEffect, useCallback } from "react";
import {
  AnalysisGroup,
  Analysis,
  Requirement,
  Metric,
} from "../versionNodes/utils/VersionInterfaces";

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

// Mock data generators
const createMockRequirement = (
  name: string,
  category: string,
  targetValue: number,
  unit: string,
  comparator: ">" | "<" | ">=" | "<=" | "==" | "!=",
  priority: "critical" | "important" | "standard" = "important",
  currentValue?: number
): Requirement => ({
  id: `req-${name.toLowerCase().replace(/\s+/g, "-")}-${Math.random()
    .toString(36)
    .substr(2, 9)}`,
  name,
  description: `System must meet ${name} requirement for ${category} analysis`,
  targetValue,
  unit,
  comparator,
  category,
  priority,
  currentValue,
  status:
    currentValue !== undefined
      ? (comparator === ">" && currentValue > targetValue) ||
        (comparator === "<" && currentValue < targetValue) ||
        (comparator === ">=" && currentValue >= targetValue) ||
        (comparator === "<=" && currentValue <= targetValue)
        ? "pass"
        : "fail"
      : "pending",
});

const createMockAnalysis = (
  name: string,
  type: string,
  status: "pending" | "running" | "completed" | "failed",
  requirements: Requirement[],
  config: {
    hasMetrics?: boolean;
    metricValues?: { max: number; avg: number; min: number };
    errors?: string[];
    warnings?: string[];
  } = {}
): Analysis => {
  const analysis: Analysis = {
    id: `analysis-${name.toLowerCase().replace(/\s+/g, "-")}`,
    name,
    type,
    status,
    metrics: [],
    requirements,
    progress:
      status === "running" ? Math.floor(Math.random() * 80) + 20 : undefined,
  };

  // Add metrics if specified
  if (config.hasMetrics && (status === "completed" || status === "running")) {
    const values = config.metricValues || { max: 100, avg: 75, min: 50 };

    if (type === "stress") {
      analysis.metrics = [
        {
          title: "Von Mises Stress",
          type: "structural_stress",
          values: [
            { label: "Maximum", value: values.max * 1e6, unit: "Pa" },
            { label: "Average", value: values.avg * 1e6, unit: "Pa" },
            { label: "Minimum", value: values.min * 1e6, unit: "Pa" },
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize",
        },
      ];
    } else if (type === "deformation") {
      analysis.metrics = [
        {
          title: "Total Deformation",
          type: "displacement",
          values: [
            { label: "Maximum", value: values.max * 0.00001, unit: "m" },
            { label: "Average", value: values.avg * 0.00001, unit: "m" },
            { label: "Minimum", value: values.min * 0.00001, unit: "m" },
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize",
        },
      ];
    } else if (type === "thermal") {
      analysis.metrics = [
        {
          title: "Temperature Distribution",
          type: "temperature",
          values: [
            { label: "Maximum", value: values.max, unit: "°C" },
            { label: "Average", value: values.avg, unit: "°C" },
            { label: "Minimum", value: values.min, unit: "°C" },
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize",
        },
      ];
    } else if (type === "safety") {
      analysis.metrics = [
        {
          title: "Safety Factor",
          type: "safety_factor",
          values: [
            { label: "Minimum", value: values.min / 20, unit: "" },
            { label: "Average", value: values.avg / 20, unit: "" },
          ],
          primaryValueLabel: "Minimum",
          optimizationTarget: "maximize",
        },
      ];
    } else if (type === "buckling") {
      analysis.metrics = [
        {
          title: "Load Multiplier",
          type: "buckling_factor",
          values: [
            { label: "First Mode", value: values.min / 10, unit: "" },
            { label: "Average", value: values.avg / 10, unit: "" },
          ],
          primaryValueLabel: "First Mode",
          optimizationTarget: "maximize",
        },
      ];
    } else if (type === "modal_frequency") {
      analysis.metrics = [
        {
          title: "Natural Frequency",
          type: "frequency",
          values: [
            { label: "First Mode", value: values.min, unit: "Hz" },
            { label: "Second Mode", value: values.avg, unit: "Hz" },
          ],
          primaryValueLabel: "First Mode",
          optimizationTarget: "maximize",
        },
      ];
    }
  }

  // Add errors/warnings
  if (config.errors) {
    analysis.errors = config.errors;
  }
  if (config.warnings) {
    analysis.warnings = config.warnings;
  }

  return analysis;
};

const createMockAnalysisGroups = (): AnalysisGroup[] => {
  return [
    // STRUCTURAL GROUP - Will pass all analyses (3 analyses, 5 total requirements)
    {
      id: "structural-group",
      name: "Structural Analysis",
      status: "pending",
      analyses: [
        createMockAnalysis("Static Structural", "stress", "pending", [
          createMockRequirement(
            "Max Von Mises Stress",
            "structural",
            250e6,
            "Pa",
            "<",
            "critical"
          ),
          createMockRequirement(
            "Yield Safety Margin",
            "structural",
            1.5,
            "",
            ">",
            "important"
          ),
        ]),
        createMockAnalysis("Deformation", "deformation", "pending", [
          createMockRequirement(
            "Max Total Deformation",
            "structural",
            0.002,
            "m",
            "<",
            "critical"
          ),
          createMockRequirement(
            "Displacement Uniformity",
            "structural",
            0.8,
            "",
            ">",
            "standard"
          ),
        ]),
        createMockAnalysis("Safety Factor", "safety", "pending", [
          createMockRequirement(
            "Minimum Safety Factor",
            "structural",
            2.0,
            "",
            ">",
            "critical"
          ),
        ]),
      ],
    },

    // THERMAL GROUP - Will fail one analysis (4 analyses, 7 total requirements)
    {
      id: "thermal-group",
      name: "Thermal Analysis",
      status: "pending",
      analyses: [
        createMockAnalysis("Steady-State Thermal", "thermal", "pending", [
          createMockRequirement(
            "Max Operating Temperature",
            "thermal",
            100,
            "°C",
            "<",
            "critical"
          ),
          createMockRequirement(
            "Temperature Uniformity",
            "thermal",
            0.85,
            "",
            ">",
            "important"
          ),
        ]),
        createMockAnalysis("Transient Thermal", "thermal", "pending", [
          createMockRequirement(
            "Temperature Rate of Change",
            "thermal",
            50,
            "°C/min",
            "<",
            "important"
          ),
          createMockRequirement(
            "Thermal Settling Time",
            "thermal",
            300,
            "s",
            "<",
            "standard"
          ),
        ]),
        createMockAnalysis(
          "Thermal Stress",
          "thermal",
          "pending",
          [
            createMockRequirement(
              "Thermal Expansion Stress",
              "thermal",
              150e6,
              "Pa",
              "<",
              "important"
            ),
            createMockRequirement(
              "Thermal Gradient Limit",
              "thermal",
              100,
              "°C/m",
              "<",
              "critical"
            ),
          ],
          {
            warnings: [
              "Material properties may vary at extreme temperatures",
              "Consider adding thermal barriers in high-stress regions",
            ],
          }
        ),
        createMockAnalysis("Heat Transfer", "thermal", "pending", [
          createMockRequirement(
            "Heat Dissipation Rate",
            "thermal",
            500,
            "W",
            ">",
            "critical"
          ),
        ]),
      ],
    },

    // MODAL GROUP - Mixed results (3 analyses, 6 total requirements)
    {
      id: "modal-group",
      name: "Modal Analysis",
      status: "pending",
      analyses: [
        createMockAnalysis("Natural Frequency", "modal_frequency", "pending", [
          createMockRequirement(
            "First Natural Frequency",
            "modal",
            50,
            "Hz",
            ">",
            "critical"
          ),
          createMockRequirement(
            "Frequency Separation",
            "modal",
            10,
            "%",
            ">",
            "important"
          ),
          createMockRequirement(
            "Modal Mass Participation",
            "modal",
            0.9,
            "",
            ">",
            "standard"
          ),
        ]),
        createMockAnalysis("Mode Shapes", "modal_shapes", "pending", [
          createMockRequirement(
            "Mode Shape Linearity",
            "modal",
            0.95,
            "",
            ">",
            "standard"
          ),
        ]),
        createMockAnalysis(
          "Harmonic Response",
          "harmonic",
          "pending",
          [
            createMockRequirement(
              "Resonance Peak Amplitude",
              "modal",
              5.0,
              "mm",
              "<",
              "critical"
            ),
            createMockRequirement(
              "Damping Ratio",
              "modal",
              0.02,
              "",
              ">",
              "important"
            ),
          ],
          {
            warnings: [
              "Potential resonance detected near operating frequency",
              "Consider damping mechanism",
            ],
          }
        ),
      ],
    },
  ];
};

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
      const mockGroups = createMockAnalysisGroups();
      setAnalysisGroups(mockGroups);

      // Aggregate ALL requirements from all analyses across all groups
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

  const updateAnalysisGroup = useCallback(
    (groupId: string, updatedGroup: AnalysisGroup) => {
      setAnalysisGroups((prev) => {
        const updated = prev.map((g) => (g.id === groupId ? updatedGroup : g));

        // Update aggregated requirements using the UPDATED groups, not stale ones
        const allRequirements = updated.flatMap((g) =>
          g.analyses.flatMap((a) => a.requirements || [])
        );
        setRequirements(allRequirements);

        return updated;
      });
    },
    [] // Remove analysisGroups dependency - we use the setter function pattern
  );

  return {
    analysisGroups,
    requirements,
    isLoading,
    error,
    updateAnalysisGroup, // NEW: Expose update method
  };
};

export const clearAnalysisDataCache = () => {
  // TODO: Implement cache clearing if needed
};
