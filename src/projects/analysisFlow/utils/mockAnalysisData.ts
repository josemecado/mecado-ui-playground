// utils/mockAnalysisData.ts
import { Metric, Requirement, Analysis, AnalysisGroup } from "../../versionNodes/utils/VersionInterfaces";

// Define specific metric values for each analysis type - ONLY matching requirements
export const MOCK_METRICS: Record<string, Metric[]> = {
  "analysis-static-structural": [{
    title: "Von Mises Stress",
    type: "structural_stress",
    values: [
      { label: "Maximum", value: 180e6, unit: "Pa" }, // Will pass (< 250e6)
      { label: "Minimum", value: 2.1, unit: "" }, // For Yield Safety Margin (> 1.5)
    ],
    primaryValueLabel: "Maximum",
    optimizationTarget: "minimize" as const,
  }],
  
  "analysis-deformation": [{
    title: "Total Deformation",
    type: "displacement",
    values: [
      { label: "Maximum", value: 0.0018, unit: "m" }, // Will pass (< 0.002)
      { label: "Minimum", value: 0.85, unit: "" }, // For Displacement Uniformity (> 0.8)
    ],
    primaryValueLabel: "Maximum",
    optimizationTarget: "minimize" as const,
  }],
  
  "analysis-safety-factor": [{
    title: "Safety Factor",
    type: "safety_factor",
    values: [
      { label: "Minimum", value: 2.5, unit: "" }, // Will pass (> 2.0)
    ],
    primaryValueLabel: "Minimum",
    optimizationTarget: "maximize" as const,
  }],
  
  "analysis-steady-state-thermal": [{
    title: "Temperature Distribution",
    type: "temperature",
    values: [
      { label: "Maximum", value: 95, unit: "°C" }, // Will pass (< 100)
      { label: "Minimum", value: 0.88, unit: "" }, // For Temperature Uniformity (> 0.85)
    ],
    primaryValueLabel: "Maximum",
    optimizationTarget: "minimize" as const,
  }],
  
  "analysis-transient-thermal": [{
    title: "Temperature Analysis",
    type: "temperature",
    values: [
      { label: "Maximum", value: 45, unit: "°C/min" }, // Rate of Change - Will pass (< 50)
      { label: "Settling Time", value: 280, unit: "s" }, // Will pass (< 300)
    ],
    primaryValueLabel: "Maximum",
    optimizationTarget: "minimize" as const,
  }],
  
  "analysis-thermal-stress": [{
    title: "Thermal Stress",
    type: "thermal_stress",
    values: [
      { label: "Maximum", value: 180e6, unit: "Pa" }, // Will fail (> 150e6)
      { label: "Gradient", value: 120, unit: "°C/m" }, // Will fail (> 100)
    ],
    primaryValueLabel: "Maximum",
    optimizationTarget: "minimize" as const,
  }],
  
  "analysis-heat-transfer": [{
    title: "Heat Dissipation",
    type: "heat_transfer",
    values: [
      { label: "Minimum", value: 450, unit: "W" }, // Will fail (< 500)
    ],
    primaryValueLabel: "Rate",
    optimizationTarget: "maximize" as const,
  }],
  
  "analysis-natural-frequency": [{
    title: "Natural Frequency",
    type: "frequency",
    values: [
      { label: "Minimum", value: 55, unit: "Hz" }, // First Natural Frequency - Will pass (> 50)
      { label: "Separation", value: 12, unit: "%" }, // Will pass (> 10)
      { label: "Mass Participation", value: 0.92, unit: "" }, // Will pass (> 0.9)
    ],
    primaryValueLabel: "First Mode",
    optimizationTarget: "maximize" as const,
  }],
  
  "analysis-mode-shapes": [{
    title: "Mode Shape Analysis",
    type: "modal_shape",
    values: [
      { label: "Minimum", value: 0.97, unit: "" }, // Mode Shape Linearity - Will pass (> 0.95)
    ],
    primaryValueLabel: "Linearity",
    optimizationTarget: "maximize" as const,
  }],
  
  "analysis-harmonic-response": [{
    title: "Harmonic Response",
    type: "harmonic",
    values: [
      { label: "Maximum", value: 6.2, unit: "mm" }, // Peak Amplitude - Will fail (> 5.0)
      { label: "Minimum", value: 0.025, unit: "" }, // Damping Ratio - Will pass (> 0.02)
    ],
    primaryValueLabel: "Peak Amplitude",
    optimizationTarget: "minimize" as const,
  }],
};

// Export function to get metrics for a specific analysis
export const getMockMetricsForAnalysis = (analysisId: string): Metric[] => {
  return MOCK_METRICS[analysisId] || [];
};

// Update the evaluation function to be more robust
export const evaluateRequirementsWithMockData = (
  analysis: Analysis
): Requirement[] | undefined => {
  if (!analysis.requirements) return undefined;
  
  const metrics = getMockMetricsForAnalysis(analysis.id);
  if (metrics.length === 0) return analysis.requirements;
  
  return analysis.requirements.map((req) => {
    const metric = metrics[0];
    if (!metric || !metric.values) return req;
    
    // Get the appropriate metric value based on requirement name and comparator
    let metricValue: number | undefined;
    
    // For "less than" comparisons, use Maximum values
    if (req.comparator === "<" || req.comparator === "<=") {
      // Special cases first
      if (req.name.toLowerCase().includes("rate")) {
        metricValue = metric.values.find(v => v.label === "Maximum")?.value;
      } else if (req.name.toLowerCase().includes("settling")) {
        metricValue = metric.values.find(v => v.label === "Settling Time")?.value;
      } else if (req.name.toLowerCase().includes("gradient")) {
        metricValue = metric.values.find(v => v.label === "Gradient")?.value;
      } else if (req.name.toLowerCase().includes("amplitude")) {
        metricValue = metric.values.find(v => v.label === "Maximum")?.value;
      } else {
        metricValue = metric.values.find(v => v.label === "Maximum")?.value;
      }
    } 
    // For "greater than" comparisons, use Minimum values
    else if (req.comparator === ">" || req.comparator === ">=") {
      // Special cases first
      if (req.name.toLowerCase().includes("separation")) {
        metricValue = metric.values.find(v => v.label === "Separation")?.value;
      } else if (req.name.toLowerCase().includes("mass participation")) {
        metricValue = metric.values.find(v => v.label === "Mass Participation")?.value;
      } else if (req.name.toLowerCase().includes("damping")) {
        metricValue = metric.values.find(v => v.label === "Minimum")?.value;
      } else {
        metricValue = metric.values.find(v => v.label === "Minimum")?.value;
      }
    }
    
    // If still no value found, log warning and return unchanged
    if (metricValue === undefined) {
      console.warn(`No metric value found for requirement: ${req.name} (${req.comparator})`);
      return req;
    }
    
    // Evaluate pass/fail
    let passed = false;
    switch (req.comparator) {
      case ">": passed = metricValue > req.targetValue; break;
      case "<": passed = metricValue < req.targetValue; break;
      case ">=": passed = metricValue >= req.targetValue; break;
      case "<=": passed = metricValue <= req.targetValue; break;
      case "==": passed = metricValue === req.targetValue; break;
      case "!=": passed = metricValue !== req.targetValue; break;
    }
    
    return {
      ...req,
      currentValue: metricValue,
      status: passed ? "pass" as const : "fail" as const,
    };
  });
};

// Create mock analysis groups with shared preprocessing steps
export const createMockAnalysisGroups = (): AnalysisGroup[] => {
  return [
    // STRUCTURAL GROUP - All will pass
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
          // SHARES preprocessing with deformation analysis
          sharedSteps: [
            {
              stepIndex: 0, // Preprocessing step
              sharedWithAnalyses: ["analysis-deformation"],
              sharedStepId: "shared-structural-preprocessing"
            }
          ],
          requirements: [
            {
              id: "req-stress-1",
              name: "Max Von Mises Stress",
              description: "Maximum stress must be below yield strength",
              targetValue: 250e6,
              unit: "Pa",
              comparator: "<",
              category: "structural",
              priority: "critical",
              status: "pending"
            },
            {
              id: "req-stress-2",
              name: "Yield Safety Margin",
              description: "Maintain safety factor above threshold",
              targetValue: 1.5,
              unit: "",
              comparator: ">",
              category: "structural",
              priority: "important",
              status: "pending"
            }
          ]
        },
        {
          id: "analysis-deformation",
          name: "Deformation",
          type: "deformation",
          status: "pending",
          metrics: [],
          // SHARES preprocessing with static-structural
          sharedSteps: [
            {
              stepIndex: 0,
              sharedWithAnalyses: ["analysis-static-structural"],
              sharedStepId: "shared-structural-preprocessing"
            }
          ],
          requirements: [
            {
              id: "req-deform-1",
              name: "Max Total Deformation",
              description: "Maximum deformation limit",
              targetValue: 0.002,
              unit: "m",
              comparator: "<",
              category: "structural",
              priority: "critical",
              status: "pending"
            },
            {
              id: "req-deform-2",
              name: "Displacement Uniformity",
              description: "Ensure uniform displacement",
              targetValue: 0.8,
              unit: "",
              comparator: ">",
              category: "structural",
              priority: "standard",
              status: "pending"
            }
          ]
        },
        {
          id: "analysis-safety-factor",
          name: "Safety Factor",
          type: "safety",
          status: "pending",
          metrics: [],
          // NO shared steps - runs independently
          requirements: [
            {
              id: "req-safety-1",
              name: "Minimum Safety Factor",
              description: "Maintain minimum safety factor",
              targetValue: 2.0,
              unit: "",
              comparator: ">",
              category: "structural",
              priority: "critical",
              status: "pending"
            }
          ]
        }
      ]
    },
    
    // THERMAL GROUP - Mixed results (thermal stress and heat transfer will fail)
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
          // SHARES preprocessing with thermal-stress AND natural-frequency (cross-group)
          sharedSteps: [
            {
              stepIndex: 0,
              sharedWithAnalyses: ["analysis-thermal-stress", "analysis-natural-frequency"],
              sharedStepId: "shared-thermal-modal-preprocessing"
            }
          ],
          requirements: [
            {
              id: "req-thermal-1",
              name: "Max Operating Temperature",
              description: "Keep temperature below limit",
              targetValue: 100,
              unit: "°C",
              comparator: "<",
              category: "thermal",
              priority: "critical",
              status: "pending"
            },
            {
              id: "req-thermal-2",
              name: "Temperature Uniformity",
              description: "Maintain temperature uniformity",
              targetValue: 0.85,
              unit: "",
              comparator: ">",
              category: "thermal",
              priority: "important",
              status: "pending"
            }
          ]
        },
        {
          id: "analysis-transient-thermal",
          name: "Transient Thermal",
          type: "thermal",
          status: "pending",
          metrics: [],
          // NO shared steps - runs independently
          requirements: [
            {
              id: "req-transient-1",
              name: "Temperature Rate of Change",
              description: "Limit temperature change rate",
              targetValue: 50,
              unit: "°C/min",
              comparator: "<",
              category: "thermal",
              priority: "important",
              status: "pending"
            },
            {
              id: "req-transient-2",
              name: "Thermal Settling Time",
              description: "Reach steady state quickly",
              targetValue: 300,
              unit: "s",
              comparator: "<",
              category: "thermal",
              priority: "standard",
              status: "pending"
            }
          ]
        },
        {
          id: "analysis-thermal-stress",
          name: "Thermal Stress",
          type: "thermal",
          status: "pending",
          metrics: [],
          // SHARES preprocessing with steady-state-thermal and natural-frequency
          sharedSteps: [
            {
              stepIndex: 0,
              sharedWithAnalyses: ["analysis-steady-state-thermal", "analysis-natural-frequency"],
              sharedStepId: "shared-thermal-modal-preprocessing"
            }
          ],
          requirements: [
            {
              id: "req-thermal-stress-1",
              name: "Thermal Expansion Stress",
              description: "Limit thermal stress",
              targetValue: 150e6,
              unit: "Pa",
              comparator: "<",
              category: "thermal",
              priority: "important",
              status: "pending"
            },
            {
              id: "req-thermal-stress-2",
              name: "Thermal Gradient Limit",
              description: "Limit temperature gradient",
              targetValue: 100,
              unit: "°C/m",
              comparator: "<",
              category: "thermal",
              priority: "critical",
              status: "pending"
            }
          ],
          warnings: [
            "Material properties may vary at extreme temperatures",
            "Consider adding thermal barriers in high-stress regions"
          ]
        },
        {
          id: "analysis-heat-transfer",
          name: "Heat Transfer",
          type: "thermal",
          status: "pending",
          metrics: [],
          // NO shared steps - runs independently
          requirements: [
            {
              id: "req-heat-1",
              name: "Heat Dissipation Rate",
              description: "Minimum heat dissipation required",
              targetValue: 500,
              unit: "W",
              comparator: ">",
              category: "thermal",
              priority: "critical",
              status: "pending"
            }
          ]
        }
      ]
    },
    
    // MODAL GROUP - Harmonic response will partially fail
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
          // SHARES preprocessing with thermal analyses (cross-group sharing)
          sharedSteps: [
            {
              stepIndex: 0,
              sharedWithAnalyses: ["analysis-steady-state-thermal", "analysis-thermal-stress"],
              sharedStepId: "shared-thermal-modal-preprocessing"
            }
          ],
          requirements: [
            {
              id: "req-freq-1",
              name: "First Natural Frequency",
              description: "Minimum first mode frequency",
              targetValue: 50,
              unit: "Hz",
              comparator: ">",
              category: "modal",
              priority: "critical",
              status: "pending"
            },
            {
              id: "req-freq-2",
              name: "Frequency Separation",
              description: "Minimum separation between modes",
              targetValue: 10,
              unit: "%",
              comparator: ">",
              category: "modal",
              priority: "important",
              status: "pending"
            },
            {
              id: "req-freq-3",
              name: "Modal Mass Participation",
              description: "Minimum mass participation",
              targetValue: 0.9,
              unit: "",
              comparator: ">",
              category: "modal",
              priority: "standard",
              status: "pending"
            }
          ]
        },
        {
          id: "analysis-mode-shapes",
          name: "Mode Shapes",
          type: "modal_shapes",
          status: "pending",
          metrics: [],
          // NO shared steps - runs independently
          requirements: [
            {
              id: "req-mode-1",
              name: "Mode Shape Linearity",
              description: "Ensure linear mode shapes",
              targetValue: 0.95,
              unit: "",
              comparator: ">",
              category: "modal",
              priority: "standard",
              status: "pending"
            }
          ]
        },
        {
          id: "analysis-harmonic-response",
          name: "Harmonic Response",
          type: "harmonic",
          status: "pending",
          metrics: [],
          // NO shared steps - runs independently
          requirements: [
            {
              id: "req-harmonic-1",
              name: "Resonance Peak Amplitude",
              description: "Limit resonance amplitude",
              targetValue: 5.0,
              unit: "mm",
              comparator: "<",
              category: "modal",
              priority: "critical",
              status: "pending"
            },
            {
              id: "req-harmonic-2",
              name: "Damping Ratio",
              description: "Minimum damping required",
              targetValue: 0.02,
              unit: "",
              comparator: ">",
              category: "modal",
              priority: "important",
              status: "pending"
            }
          ],
          warnings: [
            "Potential resonance detected near operating frequency",
            "Consider damping mechanism"
          ]
        }
      ]
    }
  ];
};