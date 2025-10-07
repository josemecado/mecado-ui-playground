// utils/mockAnalysisData.ts
import {
  Metric,
  Requirement,
  Analysis,
  AnalysisGroup,
} from "../../nodeVisuals/versionNodes/utils/VersionInterfaces";

// Define available metric variables that can be used in expressions
export interface MetricVariable {
  name: string;
  label: string;
  type: string;
  unit: string;
  analysisTypes: string[];
}

// Registry of all available metric variables across all analysis types
export const METRIC_VARIABLES: MetricVariable[] = [
  // Structural/Stress
  {
    name: "Stress_max",
    label: "Maximum Stress",
    type: "structural_stress",
    unit: "Pa",
    analysisTypes: ["stress"],
  },
  {
    name: "Stress_min",
    label: "Minimum Stress",
    type: "structural_stress",
    unit: "Pa",
    analysisTypes: ["stress"],
  },

  // Deformation
  {
    name: "Deformation_max",
    label: "Maximum Deformation",
    type: "displacement",
    unit: "m",
    analysisTypes: ["deformation"],
  },
  {
    name: "Deformation_min",
    label: "Minimum Deformation",
    type: "displacement",
    unit: "m",
    analysisTypes: ["deformation"],
  },

  // Safety
  {
    name: "Safety_Factor",
    label: "Safety Factor",
    type: "safety_factor",
    unit: "",
    analysisTypes: ["safety"],
  },

  // Thermal
  {
    name: "T_max",
    label: "Maximum Temperature",
    type: "temperature",
    unit: "°C",
    analysisTypes: ["thermal"],
  },
  {
    name: "T_min",
    label: "Minimum Temperature",
    type: "temperature",
    unit: "°C",
    analysisTypes: ["thermal"],
  },

  // Modal/Frequency
  {
    name: "Frequency",
    label: "Natural Frequency",
    type: "frequency",
    unit: "Hz",
    analysisTypes: ["modal_frequency"],
  },
  {
    name: "Frequency_Separation",
    label: "Frequency Separation",
    type: "frequency",
    unit: "%",
    analysisTypes: ["modal_frequency"],
  },
  {
    name: "Mass_Participation",
    label: "Mass Participation",
    type: "frequency",
    unit: "",
    analysisTypes: ["modal_frequency"],
  },

  // Mode Shapes
  {
    name: "Mode_Linearity",
    label: "Mode Shape Linearity",
    type: "modal_shape",
    unit: "",
    analysisTypes: ["modal_shapes"],
  },

  // Harmonic
  {
    name: "Harmonic_Amplitude",
    label: "Peak Amplitude",
    type: "harmonic",
    unit: "mm",
    analysisTypes: ["harmonic"],
  },
  {
    name: "Damping_Ratio",
    label: "Damping Ratio",
    type: "harmonic",
    unit: "",
    analysisTypes: ["harmonic"],
  },
];

// Fixed mock metrics (updated with consistent structure)
const FIXED_MOCK_METRICS: Record<string, Metric[]> = {
  stress: [
    {
      title: "Von Mises Stress",
      type: "structural_stress",
      values: [
        { label: "Maximum", value: 220e6, unit: "Pa" },
        { label: "Minimum", value: 1.8e6, unit: "Pa" },
      ],
      primaryValueLabel: "Maximum",
      optimizationTarget: "minimize",
    },
  ],

  deformation: [
    {
      title: "Total Deformation",
      type: "displacement",
      values: [
        { label: "Maximum", value: 0.00165, unit: "m" },
        { label: "Minimum", value: 0.0, unit: "m" },
      ],
      primaryValueLabel: "Maximum",
      optimizationTarget: "minimize",
    },
  ],

  safety: [
    {
      title: "Safety Factor",
      type: "safety_factor",
      values: [{ label: "Minimum", value: 2.3, unit: "" }],
      primaryValueLabel: "Minimum",
      optimizationTarget: "maximize",
    },
  ],

  thermal: [
    {
      title: "Temperature Distribution",
      type: "temperature",
      values: [
        { label: "Maximum", value: 92, unit: "°C" },
        { label: "Minimum", value: 25, unit: "°C" },
      ],
      primaryValueLabel: "Maximum",
      optimizationTarget: "minimize",
    },
  ],

  modal_frequency: [
    {
      title: "Natural Frequency",
      type: "frequency",
      values: [
        { label: "Minimum", value: 58, unit: "Hz" },
        { label: "Separation", value: 15, unit: "%" },
        { label: "Mass Participation", value: 0.94, unit: "" },
      ],
      primaryValueLabel: "Minimum",
      optimizationTarget: "maximize",
    },
  ],

  modal_shapes: [
    {
      title: "Mode Shape Analysis",
      type: "modal_shape",
      values: [{ label: "Minimum", value: 0.96, unit: "" }],
      primaryValueLabel: "Minimum",
      optimizationTarget: "maximize",
    },
  ],

  harmonic: [
    {
      title: "Harmonic Response",
      type: "harmonic",
      values: [
        { label: "Maximum", value: 4.8, unit: "mm" },
        { label: "Minimum", value: 0.028, unit: "" },
      ],
      primaryValueLabel: "Maximum",
      optimizationTarget: "minimize",
    },
  ],
};

export const getMockMetricsForAnalysis = (
  analysisId: string,
  analysisType: string
): Metric[] => {
  const metrics = FIXED_MOCK_METRICS[analysisType];
  if (!metrics) {
    console.warn(`No mock metrics found for analysis type: ${analysisType}`);
    return [];
  }
  return metrics;
};

// Enhanced expression evaluator supporting math operations
export const evaluateExpression = (
  expression: string,
  metrics: Metric[]
): number | null => {
  try {
    // Build a variable map from metrics
    const variableMap: Record<string, number> = {};

    for (const metric of metrics) {
      // Map each metric type to its variable names
      const metricType = metric.type;

      for (const value of metric.values) {
        // Find corresponding variable name
        const variable = METRIC_VARIABLES.find(
          (v) =>
            v.type === metricType &&
            ((value.label === "Maximum" && v.name.includes("max")) ||
              (value.label === "Minimum" && v.name.includes("min")) ||
              (value.label === "Separation" && v.name.includes("Separation")) ||
              (value.label === "Mass Participation" &&
                v.name.includes("Mass")) ||
              (!v.name.includes("max") &&
                !v.name.includes("min") &&
                !v.name.includes("Separation") &&
                !v.name.includes("Mass")))
        );

        if (variable) {
          variableMap[variable.name] = value.value;
        }
      }
    }

    // Replace variables in expression with their values
    let evalExpression = expression;
    for (const [varName, varValue] of Object.entries(variableMap)) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${varName}\\b`, "g");
      evalExpression = evalExpression.replace(regex, String(varValue));
    }

    // Evaluate the mathematical expression
    // Safe eval using Function constructor (only contains numbers and operators at this point)
    const result = Function(`"use strict"; return (${evalExpression})`)();

    return typeof result === "number" && !isNaN(result) ? result : null;
  } catch (error) {
    console.error(`Failed to evaluate expression: ${expression}`, error);
    return null;
  }
};

// Validate expression before saving
export const validateExpression = (
  expression: string
): {
  isValid: boolean;
  error?: string;
  usedVariables?: string[];
} => {
  if (!expression || expression.trim() === "") {
    return { isValid: false, error: "Expression cannot be empty" };
  }

  // Extract variable names from expression
  const usedVariables: string[] = [];
  for (const variable of METRIC_VARIABLES) {
    const regex = new RegExp(`\\b${variable.name}\\b`);
    if (regex.test(expression)) {
      usedVariables.push(variable.name);
    }
  }

  if (usedVariables.length === 0) {
    return {
      isValid: false,
      error: "Expression must contain at least one metric variable",
    };
  }

  // Check for valid characters (variables, numbers, operators, parentheses, spaces)
  const validPattern = /^[a-zA-Z_0-9+\-*/(). ]+$/;
  if (!validPattern.test(expression)) {
    return { isValid: false, error: "Expression contains invalid characters" };
  }

  // Try to evaluate with dummy values to check syntax
  try {
    let testExpression = expression;
    for (const varName of usedVariables) {
      const regex = new RegExp(`\\b${varName}\\b`, "g");
      testExpression = testExpression.replace(regex, "1");
    }

    Function(`"use strict"; return (${testExpression})`)();
    return { isValid: true, usedVariables };
  } catch (error) {
    return { isValid: false, error: "Invalid mathematical expression syntax" };
  }
};

export const evaluateRequirementsWithMockData = (
  analysis: Analysis
): Requirement[] | undefined => {
  if (!analysis.requirements || analysis.requirements.length === 0) {
    return undefined;
  }

  const metrics = getMockMetricsForAnalysis(analysis.id, analysis.type);
  if (metrics.length === 0) {
    return analysis.requirements;
  }

  return analysis.requirements.map((req) => {
    const metricValue = evaluateExpression(req.expression, metrics);

    if (metricValue === null) {
      console.warn(
        `Could not evaluate expression: ${req.expression} for requirement: ${req.name}`
      );
      return req;
    }

    let passed = false;
    switch (req.comparator) {
      case ">":
        passed = metricValue > req.targetValue;
        break;
      case "<":
        passed = metricValue < req.targetValue;
        break;
      case ">=":
        passed = metricValue >= req.targetValue;
        break;
      case "<=":
        passed = metricValue <= req.targetValue;
        break;
      case "==":
        passed = Math.abs(metricValue - req.targetValue) < 0.0001;
        break;
      case "!=":
        passed = Math.abs(metricValue - req.targetValue) >= 0.0001;
        break;
    }

    return {
      ...req,
      currentValue: metricValue,
      status: passed ? ("pass" as const) : ("fail" as const),
    };
  });
};
// Mock analysis groups with updated requirement structure
export const createMockAnalysisGroups = (): AnalysisGroup[] => {
  return [
    {
      id: "structural-group",
      name: "Structural Analysis",
      status: "pending",
      analyses: [
        {
          id: "analysis-static-structural",
          name: "Static Structural",
          type: "stress",
          status: "pending",
          metrics: [],
          sharedSteps: [
            {
              stepIndex: 0,
              sharedWithAnalyses: ["analysis-deformation"],
              sharedStepId: "shared-structural-preprocessing",
            },
          ],
          requirements: [
            {
              id: "req-stress-1",
              name: "Max Von Mises Stress",
              description: "Maximum stress must be below yield strength",
              expression: "Stress_max",
              targetValue: 250e6,
              unit: "Pa",
              comparator: "<",
              evaluationScope: { type: "analysis" },
              category: "structural",
              priority: "critical",
              status: "pending",
            },
            {
              id: "req-stress-2",
              name: "Minimum Stress Safety",
              description: "Minimum stress check",
              expression: "Stress_min",
              targetValue: 1.5e6,
              unit: "Pa",
              comparator: ">",
              evaluationScope: { type: "analysis" },
              category: "structural",
              priority: "important",
              status: "pending",
            },
          ],
        },
        {
          id: "analysis-deformation",
          name: "Deformation",
          type: "deformation",
          status: "pending",
          metrics: [],
          sharedSteps: [
            {
              stepIndex: 0,
              sharedWithAnalyses: ["analysis-static-structural"],
              sharedStepId: "shared-structural-preprocessing",
            },
          ],
          requirements: [
            {
              id: "req-deform-1",
              name: "Max Total Deformation",
              description: "Maximum deformation limit",
              expression: "Deformation",
              targetValue: 0.002,
              unit: "m",
              comparator: "<",
              evaluationScope: { type: "analysis" },
              category: "structural",
              priority: "critical",
              status: "pending",
            },
          ],
        },
        {
          id: "analysis-safety-factor",
          name: "Safety Factor",
          type: "safety",
          status: "pending",
          metrics: [],
          requirements: [
            {
              id: "req-safety-1",
              name: "Minimum Safety Factor",
              description: "Maintain minimum safety factor",
              expression: "Safety_Factor",
              targetValue: 2.0,
              unit: "",
              comparator: ">",
              evaluationScope: { type: "analysis" },
              category: "structural",
              priority: "critical",
              status: "pending",
            },
          ],
        },
      ],
    },
    {
      id: "thermal-group",
      name: "Thermal Analysis",
      status: "pending",
      analyses: [
        {
          id: "analysis-steady-state-thermal",
          name: "Steady-State Thermal",
          type: "thermal",
          status: "pending",
          metrics: [],
          requirements: [
            {
              id: "req-thermal-1",
              name: "Max Operating Temperature",
              description: "Keep temperature below limit",
              expression: "T_max",
              targetValue: 100,
              unit: "°C",
              comparator: "<",
              evaluationScope: { type: "analysis" },
              category: "thermal",
              priority: "critical",
              status: "pending",
            },
          ],
        },
      ],
    },
    {
      id: "modal-group",
      name: "Modal Analysis",
      status: "pending",
      analyses: [
        {
          id: "analysis-natural-frequency",
          name: "Natural Frequency",
          type: "modal_frequency",
          status: "pending",
          metrics: [],
          requirements: [
            {
              id: "req-freq-1",
              name: "First Natural Frequency",
              description: "Minimum first mode frequency",
              expression: "Frequency",
              targetValue: 50,
              unit: "Hz",
              comparator: ">",
              evaluationScope: { type: "analysis" },
              category: "modal",
              priority: "critical",
              status: "pending",
            },
          ],
        },
      ],
    },
  ];
};
