// VersionInterfaces.ts - Generic dynamic metric support
import { Equation } from "../../../reusable-components/models/vulcanModels";

interface FileItem {
  name: string;
  path: string;
}

// Geometry interfaces (matching GeoNode structure)
export interface GeometryData {
  facesFile: ArrayBuffer;
  edgesFile: ArrayBuffer;
  bodiesFile: ArrayBuffer;
  fileName?: string;
}

export interface VersionGeometry {
  id: string;
  data?: GeometryData;
  renderContent?: () => React.ReactElement;
  placeholder?: string;
}

// Original GeometryFile interface (kept for backward compatibility)
export interface GeometryFile {
  name: string;
  size: string;
}

export interface EdgeConfig {
  targetId: string;
  label?: string;
  animated?: boolean;
}

// Individual metric value with label
export interface MetricValue {
  label: string; // "Maximum", "Average", "Minimum", etc.
  value: number;
  unit?: string; // Optional unit, can be inferred or left empty
}

// Difference tracking for individual metric values
export interface MetricValueDifference {
  absolute: number;
  percentage: number;
  direction: "increase" | "decrease" | "unchanged";
  valueLabel: string; // Which value this difference applies to
}

// Legacy difference interface (for backward compatibility during transition)
export interface MetricDifference {
  absolute: number;
  percentage: number;
  direction: "increase" | "decrease" | "unchanged";
}

export interface MetricTrend {
  shortTerm: "improving" | "declining" | "stable"; // Last 3 versions
  longTerm: "improving" | "declining" | "stable"; // All versions in chain
  volatility: "low" | "medium" | "high"; // How much it fluctuates
  valueLabel?: string; // If this trend is for a specific value
}

// UPDATED: Generic Metric interface - no predefined types
export interface Metric {
  // Base fields from analysis data
  title: string;
  type: string; // CHANGED: Free string instead of union type

  // Multi-value support
  values: MetricValue[]; // Array of values (Max, Avg, Min, etc.)

  // LEGACY SUPPORT - will be deprecated
  value?: number; // For backward compatibility
  unit?: string; // For backward compatibility

  // Computed fields for UI - updated to handle multiple values
  parentValue?: number; // Legacy support
  parentValues?: MetricValue[]; // Parent metric values
  difference?: MetricDifference; // Legacy support
  differences?: MetricValueDifference[]; // Array of differences, one per value

  // Computed analysis fields
  trend?: MetricTrend;
  isOptimized?: boolean; // True if this is the best value in the version chain
  optimizationTarget?: "minimize" | "maximize"; // Determined by heuristics
  percentageOfTarget?: number; // If we have a target value
  historicalValues?: Array<{ versionId: string; values: MetricValue[] }>; // Historical tracking
  significance?: "critical" | "important" | "standard"; // Based on change magnitude

  // Which value should be considered "primary" for sorting/comparison
  primaryValueLabel?: string; // "Maximum", "Average", etc.
}

// Generic ANSYS solution item interface - no type restrictions
export interface ANSYSSolutionItem {
  object_id: number;
  name: string;
  type: string; // CHANGED: Free string instead of union
  maximum?: number;
  average?: number;
  minimum?: number;
  display_time?: number;
  scoped_to?: number;
  is_suppressed?: boolean;
  // Allow for any additional numeric fields that might exist
  [key: string]: any;
}

// EXTENDED: ProjectVersion interface with analysis support
export interface ProjectVersion {
  id: string;
  title: string;
  parentVersion: string | null;
  createdAt: string;
  geometries: GeometryFile[];
  geometry?: VersionGeometry;
  pinnedEquations: Equation[];
  uploadedFiles: FileItem[];
  generatedFiles: FileItem[];
  edges?: EdgeConfig[];
  isArchived?: boolean;

  // Analysis data
  analysisGroups?: AnalysisGroup[];
  requirements?: Requirement[]; // Version-level requirements

  // Legacy support
  metrics: Metric[]; // Keep for backwards compatibility

  analysisConfiguration?: {
    sourceVersionId?: string;
    lastModified?: string;
    autoRetryOnFailure?: boolean;
  };
}

// NEW: Requirement interface for pass/fail criteria
export interface Requirement {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  comparator: ">" | "<" | ">=" | "<=" | "==" | "!=";
  category: string; // Changed to generic string ✅
  priority: "critical" | "important" | "standard";

  // For tracking actual values
  currentValue?: number;
  status?: "pass" | "fail" | "pending";
}

// NEW: Analysis Group interface
export interface AnalysisGroup {
  id: string;
  name: string; // Changed from union to generic string ✅
  status: "pending" | "running" | "passed" | "failed" | "partial";
  analyses: Analysis[];
  requirements?: Requirement[]; // Group-level requirements
}

// Step definition for analysis progress
export interface AnalysisStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed";
  progress?: number; // 0-100 for the current step
}

// Predefined analysis steps
export const DEFAULT_ANALYSIS_STEPS: AnalysisStep[] = [
  { id: "preprocessing", name: "Pre-processing", status: "pending" },
  { id: "fea-setup", name: "FEA Setup", status: "pending" },
  { id: "solving", name: "Solving", status: "pending" },
];

// UPDATE: Individual Analysis interface with steps support
export interface Analysis {
  id: string;
  name: string;
  type: string;
  status: "pending" | "running" | "completed" | "failed";

  metrics: Metric[];
  requirements?: Requirement[];

  // Progress tracking - now with steps
  progress?: number; // Overall 0-100, kept for backward compatibility
  steps?: AnalysisStep[]; // NEW: Step-based progress tracking
  currentStepIndex?: number; // NEW: Which step is currently active (0-based)

  // Shared step configuration
  sharedSteps?: SharedStepConfig[]; // NEW: Defines which steps are shared with other analyses
  sharedStepRunning?: boolean; // NEW: Indicates if a shared step is being animated by another analysis
  sharedStepsCompleted?: number[]; // Track which step indices were completed via sharing

  // Only if failed
  errors?: string[];
  warnings?: string[];
}

// NEW: Configuration for shared steps between analyses
export interface SharedStepConfig {
  stepIndex: number; // Which step index in this analysis is shared (0 = preprocessing, etc.)
  sharedWithAnalyses: string[]; // Array of analysis IDs that share this step
  sharedStepId?: string; // Optional unique ID for the shared step across all analyses
}

export interface CurrentStepInfo {
  primaryAnalysisId: string;
  groupId: string;
  stepIndex: number;
  stepName: string;
  isSharedStep: boolean;
  sharedWithAnalysisIds: string[]; // Secondary analyses sharing this step
  progress: number;
  status: 'running' | 'completed' | 'pending';
}

// Utility type for metric value operations
export type MetricValueOperation = "maximum" | "minimum" | "average" | "sum";

// UPDATED: Helper functions for working with dynamic multi-value metrics
export const MetricUtils = {
  /**
   * Get the primary value from a metric (used for sorting/comparison)
   */
  getPrimaryValue(metric: Metric): number {
    // If legacy single value exists, use it
    if (metric.value !== undefined) return metric.value;

    // Find the primary value based on primaryValueLabel
    if (metric.primaryValueLabel) {
      const primaryValue = metric.values.find(
        (v) => v.label === metric.primaryValueLabel
      );
      if (primaryValue) return primaryValue.value;
    }

    // Dynamic fallback - prefer Maximum, then Average, then first available
    const defaultPrimary = this.getDefaultPrimaryValue(metric);
    return defaultPrimary?.value || 0;
  },

  /**
   * Get the default primary value using generic heuristics
   */
  getDefaultPrimaryValue(metric: Metric): MetricValue | undefined {
    // Always prefer Maximum if available (most critical for analysis metrics)
    const maximum = metric.values.find((v) => v.label === "Maximum");
    if (maximum) return maximum;

    // Fallback to Average if no Maximum
    const average = metric.values.find((v) => v.label === "Average");
    if (average) return average;

    // Final fallback to first value
    return metric.values[0];
  },

  /**
   * Get unit for primary value (backward compatibility)
   */
  getPrimaryUnit(metric: Metric): string | undefined {
    if (metric.unit) return metric.unit; // Legacy

    const primaryValue = this.getDefaultPrimaryValue(metric);
    return primaryValue?.unit;
  },

  /**
   * Convert legacy single-value metric to multi-value format
   */
  convertLegacyMetric(metric: Metric): Metric {
    if (metric.values && metric.values.length > 0) {
      return metric; // Already converted
    }

    if (metric.value !== undefined) {
      return {
        ...metric,
        values: [
          {
            label: "Value",
            value: metric.value,
            unit: metric.unit,
          },
        ],
        primaryValueLabel: "Value",
      };
    }

    return metric;
  },

  /**
   * Generate a color for a metric based on its type and optimization target
   */
  getMetricColor(
    metricType: string,
    optimizationTarget?: "minimize" | "maximize"
  ): string {
    // Hash the type string to get consistent colors
    const hash = metricType.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Define color palettes
    const minimizeColors = ["#f45"];

    const maximizeColors = [
      "#22c55e", // Green variations (good things we want to maximize)
    ];

    const neutralColors = [
      "#6366f1", // Purple variations (neutral metrics)
    ];

    // Select color based on optimization target
    let colorPalette = neutralColors;
    if (optimizationTarget === "minimize") {
      colorPalette = minimizeColors;
    } else if (optimizationTarget === "maximize") {
      colorPalette = maximizeColors;
    }

    // Use hash to pick consistent color from palette
    const colorIndex = Math.abs(hash) % colorPalette.length;
    return colorPalette[colorIndex];
  },

  /**
   * Get the semantic color for a value difference based on optimization target
   * Green = change aligns with optimization target (good)
   * Red = change goes against optimization target (bad)
   * Gray = no change or no parent to compare to
   */
  getValueDifferenceColor(
    metric: Metric,
    valueLabel?: string
  ): "#22c55e" | "#ef4444" | "var(--primary-alternate)" {
    // Find the relevant difference
    let difference;
    if (valueLabel && metric.differences) {
      difference = metric.differences.find((d) => d.valueLabel === valueLabel);
    } else if (metric.differences?.length) {
      // Use primary value difference
      difference =
        metric.differences.find(
          (d) => d.valueLabel === metric.primaryValueLabel
        ) || metric.differences[0];
    } else {
      // Fallback to legacy difference
      difference = metric.difference;
    }

    // If no difference or no change, return neutral color
    if (!difference || difference.direction === "unchanged") {
      return "var(--primary-alternate)";
    }

    // Determine if the change aligns with the optimization target
    const target = metric.optimizationTarget || "minimize";
    const isAlignedWithTarget =
      target === "maximize"
        ? difference.direction === "increase" // For maximize: increase is good
        : difference.direction === "decrease"; // For minimize: decrease is good

    // Green if aligned with target, red if not aligned
    return isAlignedWithTarget ? "#22c55e" : "#ef4444";
  },

  /**
   * Infer unit from metric name/type (basic heuristics)
   */
  inferUnit(metric: Metric): string | undefined {
    const searchText = `${metric.title} ${metric.type}`.toLowerCase();

    // Common engineering units
    if (searchText.includes("stress") || searchText.includes("pressure")) {
      return "Pa";
    }
    if (
      searchText.includes("deformation") ||
      searchText.includes("displacement")
    ) {
      return "m";
    }
    if (searchText.includes("temperature") || searchText.includes("thermal")) {
      return "°C";
    }
    if (searchText.includes("mass") || searchText.includes("weight")) {
      return "kg";
    }
    if (searchText.includes("force")) {
      return "N";
    }
    if (searchText.includes("time") || searchText.includes("duration")) {
      return "s";
    }
    if (searchText.includes("frequency")) {
      return "Hz";
    }
    if (searchText.includes("power")) {
      return "W";
    }
    if (searchText.includes("energy")) {
      return "J";
    }

    return undefined; // No unit inferred
  },

  /**
   * Format value with appropriate precision and units
   */
  formatValue(value: number, unit?: string): string {
    // Handle very large or very small values with appropriate formatting
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M${unit ? ` ${unit}` : ""}`;
    } else if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(1)}k${unit ? ` ${unit}` : ""}`;
    } else if (Math.abs(value) < 0.01 && Math.abs(value) > 0) {
      return `${value.toExponential(2)}${unit ? ` ${unit}` : ""}`;
    } else {
      return `${value.toFixed(3)}${unit ? ` ${unit}` : ""}`;
    }
  },
};
