// metricDifferenceCalculator.ts - Generic dynamic metric support
import { Metric, MetricValue, MetricValueDifference, MetricTrend, ANSYSSolutionItem, MetricUtils } from "../utils/VersionInterfaces";

/**
 * Parse ANSYS solution items to our generic Metric format
 * No type-specific logic - purely data-driven
 */
export function parseANSYSSolutionItems(solutionItems: ANSYSSolutionItem[]): Metric[] {
  return solutionItems
    .filter(item => item.type !== "SolutionInformation") // Skip info items
    .map(item => {
      const values: MetricValue[] = [];
      
      // Dynamically extract numeric values - check all common field names
      const numericFields = ['maximum', 'average', 'minimum', 'max', 'avg', 'min', 'value', 'result'];
      
      numericFields.forEach(fieldName => {
        if (typeof item[fieldName] === 'number' && !isNaN(item[fieldName])) {
          // Capitalize and clean up field name for display
          const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1).toLowerCase();
          const unit = MetricUtils.inferUnit({ title: item.name, type: item.type } as Metric);
          
          values.push({ 
            label, 
            value: item[fieldName], 
            unit 
          });
        }
      });
      
      // If no standard fields found, try to find any numeric property
      if (values.length === 0) {
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === 'number' && !isNaN(value) && key !== 'object_id' && key !== 'display_time' && key !== 'scoped_to') {
            const label = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            const unit = MetricUtils.inferUnit({ title: item.name, type: item.type } as Metric);
            values.push({ label, value, unit });
          }
        });
      }
      
      // Determine primary value label (prefer Maximum, fallback to first available)
      const primaryValueLabel = values.find(v => v.label === "Maximum")?.label || 
                               values.find(v => v.label === "Max")?.label ||
                               values[0]?.label || "Value";
      
      const metric: Metric = {
        title: item.name,
        type: item.type, // Raw type string from JSON
        values,
        primaryValueLabel,
      };
      
      // Set optimization target using heuristics
      metric.optimizationTarget = getOptimizationTarget(metric);
      
      return metric;
    });
}

/**
 * Determine optimization direction using generic heuristics
 * Based on metric name and type keywords rather than hard-coded types
 */
export function getOptimizationTarget(metric: Metric): "minimize" | "maximize" {
  const searchText = `${metric.title} ${metric.type}`.toLowerCase();
  
  // Keywords that indicate we want to MINIMIZE this metric (bad things)
  const minimizeKeywords = [
    // Structural/Mechanical (bad)
    'stress', 'strain', 'deformation', 'displacement', 'deflection',
    'vibration', 'oscillation', 'resonance', 'fatigue', 'wear',
    'crack', 'failure', 'yield', 'buckling', 'instability',
    
    // Thermal (bad)
    'temperature', 'heat', 'thermal', 'hotspot', 'overheating',
    
    // Performance/Quality (bad)
    'error', 'deviation', 'noise', 'loss', 'leakage', 'drag',
    'friction', 'resistance', 'impedance', 'distortion',
    
    // Resources/Cost (bad)
    'cost', 'expense', 'consumption', 'usage', 'waste',
    'weight', 'mass', 'volume', 'size', 'time', 'duration',
    
    // Risk/Negative outcomes
    'risk', 'hazard', 'pollution', 'emission', 'contamination'
  ];
  
  // Keywords that indicate we want to MAXIMIZE this metric (good things)
  const maximizeKeywords = [
    // Performance/Quality (good)
    'efficiency', 'performance', 'accuracy', 'precision', 'quality',
    'reliability', 'durability', 'stability', 'robustness',
    'strength', 'stiffness', 'rigidity', 'capacity', 'capability',
    
    // Safety/Security (good)
    'safety', 'security', 'margin', 'factor', 'clearance',
    'tolerance', 'redundancy', 'backup',
    
    // Output/Production (good)
    'output', 'production', 'yield', 'throughput', 'flow',
    'speed', 'velocity', 'acceleration', 'power', 'force',
    'torque', 'pressure' + 'ratio', // pressure ratio, not just pressure
    
    // Economic/Business (good)
    'profit', 'revenue', 'benefit', 'value', 'return',
    'savings', 'optimization', 'improvement',
    
    // User Experience (good)
    'satisfaction', 'comfort', 'convenience', 'accessibility'
  ];
  
  // Check for minimize keywords first (more specific)
  if (minimizeKeywords.some(keyword => searchText.includes(keyword))) {
    return "minimize";
  }
  
  // Then check for maximize keywords
  if (maximizeKeywords.some(keyword => searchText.includes(keyword))) {
    return "maximize";
  }
  
  // Special case: handle compound terms
  if (searchText.includes('factor') && (searchText.includes('safety') || searchText.includes('margin'))) {
    return "maximize"; // Safety factors should be maximized
  }
  
  if (searchText.includes('ratio') && (searchText.includes('stress') || searchText.includes('load'))) {
    return "minimize"; // Stress ratios should be minimized
  }
  
  // Default to minimize for unknown metrics (conservative approach)
  return "minimize";
}

/**
 * Determine if a change is positive based on optimization target
 */
export function isPositiveChange(metric: Metric, valueLabel?: string): boolean {
  const target = metric.optimizationTarget || getOptimizationTarget(metric);
  
  // If checking a specific value
  if (valueLabel && metric.differences) {
    const diff = metric.differences.find(d => d.valueLabel === valueLabel);
    if (!diff) return true;
    
    if (target === "maximize") {
      return diff.direction === "increase";
    } else {
      return diff.direction === "decrease";
    }
  }
  
  // Legacy support - check the primary difference
  if (metric.difference) {
    if (target === "maximize") {
      return metric.difference.direction === "increase";
    } else {
      return metric.difference.direction === "decrease";
    }
  }
  
  return true;
}

/**
 * Calculate significance based on percentage change
 */
function calculateSignificance(percentageChange: number): "critical" | "important" | "standard" {
  const absChange = Math.abs(percentageChange);
  if (absChange > 10) return "critical";
  if (absChange > 5) return "important";
  return "standard";
}

/**
 * Calculate differences between corresponding metric values
 */
export function calculateMetricValueDifferences(
  childValues: MetricValue[],
  parentValues: MetricValue[]
): MetricValueDifference[] {
  const differences: MetricValueDifference[] = [];
  
  for (const childValue of childValues) {
    const parentValue = parentValues.find(pv => pv.label === childValue.label);
    if (!parentValue) continue;
    
    const absoluteDiff = childValue.value - parentValue.value;
    const percentageDiff = parentValue.value !== 0 
      ? ((childValue.value - parentValue.value) / parentValue.value) * 100 
      : 0;
    
    let direction: "increase" | "decrease" | "unchanged";
    if (Math.abs(absoluteDiff) < 0.001) {
      direction = "unchanged";
    } else if (absoluteDiff > 0) {
      direction = "increase";
    } else {
      direction = "decrease";
    }
    
    differences.push({
      absolute: absoluteDiff,
      percentage: percentageDiff,
      direction,
      valueLabel: childValue.label
    });
  }
  
  return differences;
}

/**
 * Enhanced metric difference calculation with multi-value support
 */
export function calculateMetricDifference(
  childMetric: Metric,
  parentMetric: Metric | undefined,
  historicalValues: Array<{ versionId: string; values: MetricValue[] }> = []
): Metric {
  // Set optimization target using heuristics
  const optimizationTarget = getOptimizationTarget(childMetric);
  
  // If no parent metric exists, return child metric with basic computed fields
  if (!parentMetric) {
    return {
      ...childMetric,
      optimizationTarget,
      historicalValues,
      isOptimized: historicalValues.length === 0, // First version is "optimized" by default
    };
  }

  // Ensure we're comparing the same metric (by title and type)
  if (parentMetric.type !== childMetric.type || parentMetric.title !== childMetric.title) {
    return {
      ...childMetric,
      optimizationTarget,
      historicalValues,
    };
  }

  // Calculate differences for all matching values
  const differences = calculateMetricValueDifferences(childMetric.values, parentMetric.values);
  
  // For legacy support, calculate primary value difference
  const childPrimaryValue = MetricUtils.getPrimaryValue(childMetric);
  const parentPrimaryValue = MetricUtils.getPrimaryValue(parentMetric);
  
  let legacyDifference;
  if (childPrimaryValue !== undefined && parentPrimaryValue !== undefined) {
    const absoluteDiff = childPrimaryValue - parentPrimaryValue;
    const percentageDiff = parentPrimaryValue !== 0 
      ? ((childPrimaryValue - parentPrimaryValue) / parentPrimaryValue) * 100 
      : 0;

    let direction: "increase" | "decrease" | "unchanged";
    if (Math.abs(absoluteDiff) < 0.001) {
      direction = "unchanged";
    } else if (absoluteDiff > 0) {
      direction = "increase";
    } else {
      direction = "decrease";
    }

    legacyDifference = {
      absolute: absoluteDiff,
      percentage: percentageDiff,
      direction: direction,
    };
  }

  // Calculate trend if we have historical data
  let trend: MetricTrend | undefined;
  if (historicalValues.length >= 2) {
    // For trend calculation, use primary values
    const primaryHistoricalValues = historicalValues.map(h => ({
      versionId: h.versionId,
      value: getPrimaryValueFromValues(h.values, childMetric.primaryValueLabel) || 0
    }));
    
    const shortTermDirection = calculateTrendDirection(primaryHistoricalValues.slice(-3));
    const longTermDirection = calculateTrendDirection(primaryHistoricalValues);
    const volatility = calculateVolatility(primaryHistoricalValues);
    
    trend = {
      shortTerm: shortTermDirection,
      longTerm: longTermDirection,
      volatility: volatility,
    };
  }

  // Check if this is the best value in the chain (using primary value)
  const allPrimaryValues = [
    ...historicalValues.map(h => getPrimaryValueFromValues(h.values, childMetric.primaryValueLabel) || 0),
    childPrimaryValue || 0
  ];
  
  const isOptimized = optimizationTarget === "maximize" 
    ? (childPrimaryValue || 0) === Math.max(...allPrimaryValues)
    : (childPrimaryValue || 0) === Math.min(...allPrimaryValues);

  // Calculate significance based on primary value difference
  const significance = legacyDifference ? calculateSignificance(legacyDifference.percentage) : "standard";

  return {
    ...childMetric,
    parentValue: parentPrimaryValue, // Legacy
    parentValues: parentMetric.values, // New
    difference: legacyDifference, // Legacy
    differences, // New
    optimizationTarget,
    trend,
    isOptimized,
    historicalValues,
    significance,
  };
}

/**
 * Helper function to get primary value from values array
 */
function getPrimaryValueFromValues(values: MetricValue[], primaryLabel?: string): number | undefined {
  if (primaryLabel) {
    const primaryValue = values.find(v => v.label === primaryLabel);
    if (primaryValue) return primaryValue.value;
  }
  
  // Fallback to Maximum, then Average, then first
  const maximum = values.find(v => v.label === "Maximum");
  if (maximum) return maximum.value;
  
  const average = values.find(v => v.label === "Average");
  if (average) return average.value;
  
  return values[0]?.value;
}

/**
 * Calculate trend direction from historical values
 */
function calculateTrendDirection(values: Array<{ value: number }>): "improving" | "declining" | "stable" {
  if (values.length < 2) return "stable";
  
  // Simple linear regression to determine trend
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, v) => sum + v.value, 0);
  const sumXY = values.reduce((sum, v, i) => sum + i * v.value, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Threshold for considering it stable (adjust as needed)
  const threshold = 0.01;
  
  if (Math.abs(slope) < threshold) return "stable";
  return slope > 0 ? "improving" : "declining";
}

/**
 * Calculate volatility based on standard deviation
 */
function calculateVolatility(values: Array<{ value: number }>): "low" | "medium" | "high" {
  if (values.length < 2) return "low";
  
  const mean = values.reduce((sum, v) => sum + v.value, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v.value - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / mean) * 100;
  
  if (coefficientOfVariation < 5) return "low";
  if (coefficientOfVariation < 15) return "medium";
  return "high";
}

/**
 * Calculate differences for all metrics in a version compared to its parent
 * Updated to handle dynamic multi-value metrics
 */
export function calculateAllMetricDifferences(
  childMetrics: Metric[],
  parentMetrics: Metric[],
  versionHistory: Array<{ versionId: string; metrics: Metric[] }> = []
): Metric[] {
  return childMetrics.map(childMetric => {
    // Find the corresponding parent metric by title and type
    const parentMetric = parentMetrics.find(
      pm => pm.title === childMetric.title && pm.type === childMetric.type
    );
    
    // Gather historical values for this metric
    const historicalValues = versionHistory
      .map(vh => {
        const metric = vh.metrics.find(m => m.title === childMetric.title && m.type === childMetric.type);
        return metric ? { versionId: vh.versionId, values: metric.values } : null;
      })
      .filter(v => v !== null) as Array<{ versionId: string; values: MetricValue[] }>;
    
    return calculateMetricDifference(childMetric, parentMetric, historicalValues);
  });
}