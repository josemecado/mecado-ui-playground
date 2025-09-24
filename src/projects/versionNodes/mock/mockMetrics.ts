// mockMetrics.ts - Generic dynamic mock metrics
import { Metric, ANSYSSolutionItem } from "../utils/VersionInterfaces";
import { parseANSYSSolutionItems } from "../hooks/metricDifferenceCalculator";

/**
 * Generic mock solution items that can be easily modified
 * Based on real ANSYS analysis output structure
 */
const MOCK_SOLUTION_ITEM_SETS = [
  // Iteration 1: Baseline Design
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress",
      maximum: 296969331.67,
      average: 65232898.80,
      minimum: 2285724.75,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation",
      maximum: 0.000788,
      average: 0.000285,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],
  
  // Iteration 2: Weight Reduction Focus
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress",
      maximum: 312000000.0,
      average: 68000000.0,
      minimum: 2450000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation", 
      maximum: 0.000823,
      average: 0.000298,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],

  // Iteration 3: Aerodynamic Optimization
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress",
      maximum: 248000000.0,
      average: 55000000.0,
      minimum: 1980000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation",
      maximum: 0.000651,
      average: 0.000234,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],

  // Iteration 4: Structural Strengthening
  [
    {
      object_id: 36,
      name: "Equivalent Stress", 
      type: "EquivalentStress",
      maximum: 201000000.0,
      average: 47000000.0,
      minimum: 1750000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation",
      maximum: 0.000534,
      average: 0.000198,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],

  // Iteration 5: Balanced Performance
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress", 
      maximum: 229000000.0,
      average: 51000000.0,
      minimum: 1890000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation",
      maximum: 0.000598,
      average: 0.000217,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],

  // Iteration 6: High Stress Test
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress",
      maximum: 298000000.0,
      average: 73000000.0,
      minimum: 2650000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation", 
      type: "TotalDeformation",
      maximum: 0.000789,
      average: 0.000312,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],

  // Iteration 7: Optimized Design
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress",
      maximum: 187000000.0,
      average: 44000000.0,
      minimum: 1680000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation",
      maximum: 0.000498,
      average: 0.000185,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ],

  // Iteration 8: Final Design
  [
    {
      object_id: 36,
      name: "Equivalent Stress",
      type: "EquivalentStress",
      maximum: 174000000.0,
      average: 41000000.0,
      minimum: 1520000.0,
      display_time: 0.0,
      scoped_to: 1,
      is_suppressed: false
    },
    {
      object_id: 38,
      name: "Total Deformation",
      type: "TotalDeformation",
      maximum: 0.000472,
      average: 0.000171,
      minimum: 0.0,
      display_time: 0.0,
      scoped_to: 0,
      is_suppressed: false
    }
  ]
];

/**
 * Get mock metrics for a specific version using the generic parser
 * This demonstrates how easy it is to change the underlying data
 */
export function getMockMetricsForVersion(versionIndex: number): Metric[] {
  const setIndex = versionIndex % MOCK_SOLUTION_ITEM_SETS.length;
  const solutionItems = MOCK_SOLUTION_ITEM_SETS[setIndex];
  
  // Use the same parser that handles real ANSYS data
  return parseANSYSSolutionItems(solutionItems);
}

/**
 * Generate mock ANSYS solution items for testing
 * Returns the raw solution items that would come from real analysis
 */
export function generateMockANSYSSolutionItems(versionIndex: number): ANSYSSolutionItem[] {
  const setIndex = versionIndex % MOCK_SOLUTION_ITEM_SETS.length;
  return MOCK_SOLUTION_ITEM_SETS[setIndex];
}

/**
 * Get the number of available metric sets
 */
export function getAvailableMetricSets(): number {
  return MOCK_SOLUTION_ITEM_SETS.length;
}

/**
 * EXAMPLE: How to add a completely different metric type
 * Just add it to any solution item set and it will work automatically!
 */
export const EXAMPLE_THERMAL_ANALYSIS = [
  {
    object_id: 36,
    name: "Equivalent Stress",
    type: "EquivalentStress",
    maximum: 150000000.0,
    average: 45000000.0,
    minimum: 1200000.0,
    display_time: 0.0,
    scoped_to: 1,
    is_suppressed: false
  },
  {
    object_id: 38,
    name: "Total Deformation", 
    type: "TotalDeformation",
    maximum: 0.000321,
    average: 0.000145,
    minimum: 0.0,
    display_time: 0.0,
    scoped_to: 0,
    is_suppressed: false
  },
  {
    object_id: 42,
    name: "Temperature",
    type: "Temperature",
    maximum: 85.2,
    average: 67.8,
    minimum: 22.1,
    display_time: 0.0,
    scoped_to: 2,
    is_suppressed: false
  },
  {
    object_id: 44,
    name: "Heat Flux",
    type: "HeatFlux", 
    maximum: 1250.7,
    average: 890.3,
    minimum: 156.8,
    display_time: 0.0,
    scoped_to: 3,
    is_suppressed: false
  },
  {
    object_id: 46,
    name: "Thermal Conductivity Ratio",
    type: "ThermalConductivityRatio",
    maximum: 0.95,
    average: 0.87,
    minimum: 0.72,
    display_time: 0.0,
    scoped_to: 4,
    is_suppressed: false
  }
];

/**
 * EXAMPLE: How to test with completely different metrics
 * Just call this function instead of getMockMetricsForVersion
 */
export function getExampleThermalMetrics(): Metric[] {
  return parseANSYSSolutionItems(EXAMPLE_THERMAL_ANALYSIS);
}

/**
 * EXAMPLE: Vibration analysis metrics
 */
export const EXAMPLE_VIBRATION_ANALYSIS = [
  {
    object_id: 50,
    name: "Natural Frequency",
    type: "NaturalFrequency",
    maximum: 847.3,
    average: 532.1,
    minimum: 156.8,
    display_time: 0.0,
    scoped_to: 1,
    is_suppressed: false
  },
  {
    object_id: 52, 
    name: "Modal Amplitude",
    type: "ModalAmplitude",
    maximum: 0.0234,
    average: 0.0156,
    minimum: 0.0045,
    display_time: 0.0,
    scoped_to: 2,
    is_suppressed: false
  },
  {
    object_id: 54,
    name: "Damping Ratio", 
    type: "DampingRatio",
    maximum: 0.085,
    average: 0.067,
    minimum: 0.042,
    display_time: 0.0,
    scoped_to: 3,
    is_suppressed: false
  }
];

/**
 * Helper function to easily switch between different analysis types
 * This demonstrates how flexible the system is now
 */
export function getMockMetricsByAnalysisType(
  analysisType: "structural" | "thermal" | "vibration",
  versionIndex: number = 0
): Metric[] {
  switch (analysisType) {
    case "thermal":
      return parseANSYSSolutionItems(EXAMPLE_THERMAL_ANALYSIS);
    case "vibration":
      return parseANSYSSolutionItems(EXAMPLE_VIBRATION_ANALYSIS);
    case "structural":
    default:
      return getMockMetricsForVersion(versionIndex);
  }
}

/**
 * Convert legacy single-value mock metrics to new format (for migration)
 */
export function convertLegacyMockMetric(
  title: string,
  value: number,
  type: string,
  unit?: string
): Metric {
  const solutionItem: ANSYSSolutionItem = {
    object_id: Math.floor(Math.random() * 1000),
    name: title,
    type: type,
    value: value, // This will be picked up by the generic parser
    display_time: 0.0,
    scoped_to: 0,
    is_suppressed: false
  };
  
  const metrics = parseANSYSSolutionItems([solutionItem]);
  return metrics[0];
}