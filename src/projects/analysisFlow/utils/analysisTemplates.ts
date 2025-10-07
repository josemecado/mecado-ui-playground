// analysisFlow/utils/analysisTemplates.ts
import { Analysis } from "../../nodeVisuals/versionNodes/utils/VersionInterfaces";

export interface AnalysisTemplate {
  id: string;
  name: string;
  type: string;
  category: "structural" | "thermal" | "modal";
  description: string;
  expectedMetrics: Array<{
    type: string;
    valueLabels: string[];
    unit: string;
  }>;
}

export const ANALYSIS_TEMPLATES: AnalysisTemplate[] = [
  // Structural
  {
    id: "template-static-structural",
    name: "Static Structural",
    type: "stress",
    category: "structural",
    description: "Static structural stress analysis",
    expectedMetrics: [
      {
        type: "structural_stress",
        valueLabels: ["Maximum", "Minimum"],
        unit: "Pa"
      }
    ]
  },
  {
    id: "template-deformation",
    name: "Deformation",
    type: "deformation",
    category: "structural",
    description: "Total deformation analysis",
    expectedMetrics: [
      {
        type: "displacement",
        valueLabels: ["Maximum", "Minimum"],
        unit: "m"
      }
    ]
  },
  {
    id: "template-safety-factor",
    name: "Safety Factor",
    type: "safety",
    category: "structural",
    description: "Safety factor calculation",
    expectedMetrics: [
      {
        type: "safety_factor",
        valueLabels: ["Minimum"],
        unit: ""
      }
    ]
  },
  
  // Thermal
  {
    id: "template-steady-state-thermal",
    name: "Steady-State Thermal",
    type: "thermal",
    category: "thermal",
    description: "Steady-state thermal analysis",
    expectedMetrics: [
      {
        type: "temperature",
        valueLabels: ["Maximum", "Minimum"],
        unit: "°C"
      }
    ]
  },
  {
    id: "template-transient-thermal",
    name: "Transient Thermal",
    type: "thermal",
    category: "thermal",
    description: "Transient thermal analysis",
    expectedMetrics: [
      {
        type: "temperature",
        valueLabels: ["Maximum", "Settling Time"],
        unit: "°C"
      }
    ]
  },
  {
    id: "template-thermal-stress",
    name: "Thermal Stress",
    type: "thermal",
    category: "thermal",
    description: "Thermal expansion stress analysis",
    expectedMetrics: [
      {
        type: "thermal_stress",
        valueLabels: ["Maximum", "Gradient"],
        unit: "Pa"
      }
    ]
  },
  {
    id: "template-heat-transfer",
    name: "Heat Transfer",
    type: "thermal",
    category: "thermal",
    description: "Heat dissipation analysis",
    expectedMetrics: [
      {
        type: "heat_transfer",
        valueLabels: ["Minimum"],
        unit: "W"
      }
    ]
  },
  
  // Modal
  {
    id: "template-natural-frequency",
    name: "Natural Frequency",
    type: "modal_frequency",
    category: "modal",
    description: "Natural frequency analysis",
    expectedMetrics: [
      {
        type: "frequency",
        valueLabels: ["Minimum", "Separation", "Mass Participation"],
        unit: "Hz"
      }
    ]
  },
  {
    id: "template-mode-shapes",
    name: "Mode Shapes",
    type: "modal_shapes",
    category: "modal",
    description: "Mode shape analysis",
    expectedMetrics: [
      {
        type: "modal_shape",
        valueLabels: ["Minimum"],
        unit: ""
      }
    ]
  },
  {
    id: "template-harmonic-response",
    name: "Harmonic Response",
    type: "harmonic",
    category: "modal",
    description: "Harmonic response analysis",
    expectedMetrics: [
      {
        type: "harmonic",
        valueLabels: ["Maximum", "Minimum"],
        unit: "mm"
      }
    ]
  }
];

// Helper to create an Analysis from a template
export const createAnalysisFromTemplate = (
  template: AnalysisTemplate,
  customId?: string
): Omit<Analysis, "requirements" | "metrics"> => {
  return {
    id: customId || `analysis-${template.type}-${Date.now()}`,
    name: template.name,
    type: template.type,
    status: "pending",
  };
};