// hooks/useAnalysisAnimation.ts
import { useState, useCallback, useRef, useEffect } from "react";
import {
  AnalysisGroup,
  Analysis,
} from "../../versionNodes/utils/VersionInterfaces";

interface UseAnalysisAnimationProps {
  analysisGroup: AnalysisGroup;
  onUpdateGroup: (updatedGroup: AnalysisGroup) => void;
  onAnimationComplete?: () => void;
}

interface UseAnalysisAnimationReturn {
  isRunning: boolean;
  currentAnalysisId: string | null;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  animateSingleAnalysis: (analysisId: string) => void;
}

export const useAnalysisAnimation = ({
  analysisGroup,
  onUpdateGroup,
  onAnimationComplete,
}: UseAnalysisAnimationProps): UseAnalysisAnimationReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null
  );

  const currentGroupRef = useRef<AnalysisGroup>(analysisGroup);

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const isStoppedRef = useRef(false);

  // Helper: Generate mock metrics based on analysis type
  const generateMockMetrics = useCallback((analysis: Analysis) => {
    const type = analysis.type;
    const values = {
      max: 100 + Math.random() * 150,
      avg: 75 + Math.random() * 50,
      min: 50 + Math.random() * 25,
    };

    if (type === "stress") {
      return [
        {
          title: "Von Mises Stress",
          type: "structural_stress",
          values: [
            { label: "Maximum", value: values.max * 1e6, unit: "Pa" },
            { label: "Average", value: values.avg * 1e6, unit: "Pa" },
            { label: "Minimum", value: values.min * 1e6, unit: "Pa" },
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize" as const,
        },
      ];
    } else if (type === "deformation") {
      return [
        {
          title: "Total Deformation",
          type: "displacement",
          values: [
            { label: "Maximum", value: values.max * 0.00001, unit: "m" },
            { label: "Average", value: values.avg * 0.00001, unit: "m" },
            { label: "Minimum", value: values.min * 0.00001, unit: "m" },
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize" as const,
        },
      ];
    } else if (type === "thermal") {
      return [
        {
          title: "Temperature Distribution",
          type: "temperature",
          values: [
            { label: "Maximum", value: values.max, unit: "°C" },
            { label: "Average", value: values.avg, unit: "°C" },
            { label: "Minimum", value: values.min, unit: "°C" },
          ],
          primaryValueLabel: "Maximum",
          optimizationTarget: "minimize" as const,
        },
      ];
    } else if (type === "safety") {
      return [
        {
          title: "Safety Factor",
          type: "safety_factor",
          values: [
            { label: "Minimum", value: values.min / 20, unit: "" },
            { label: "Average", value: values.avg / 20, unit: "" },
          ],
          primaryValueLabel: "Minimum",
          optimizationTarget: "maximize" as const,
        },
      ];
    }
    return [];
  }, []);

  // Helper: Evaluate requirements based on metrics
  const evaluateRequirements = useCallback(
    (analysis: Analysis, metrics: any[]) => {
      if (!analysis.requirements) return analysis.requirements;

      return analysis.requirements.map((req) => {
        const metric = metrics[0];
        if (!metric || !metric.values) return req;

        const metricValue =
          metric.values.find((v) => v.label === "Maximum")?.value ||
          metric.values[0]?.value;

        if (metricValue === undefined) return req;

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
            passed = metricValue === req.targetValue;
            break;
          case "!=":
            passed = metricValue !== req.targetValue;
            break;
        }

        return {
          ...req,
          currentValue: metricValue,
          status: passed ? ("pass" as const) : ("fail" as const),
        };
      });
    },
    []
  );

  // Core single analysis animation function - now uses ref for current state
  const animateSingleAnalysis = useCallback(
    (analysisId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const currentGroup = currentGroupRef.current;
        const analysis = currentGroup.analyses.find((a) => a.id === analysisId);
        if (!analysis) {
          resolve(false);
          return;
        }

        console.log(`Starting animation for: ${analysis.name}`);
        setCurrentAnalysisId(analysisId);

        // Set to running with progress 0 - using current state
        const runningGroup = {
          ...currentGroup,
          analyses: currentGroup.analyses.map((a) =>
            a.id === analysisId
              ? { ...a, status: "running" as const, progress: 0 }
              : a
          ),
        };
        currentGroupRef.current = runningGroup;
        onUpdateGroup(runningGroup);

        // Animate progress
        const duration = 3000;
        const steps = 30;
        const stepDuration = duration / steps;
        let currentProgress = 0;

        progressIntervalRef.current = setInterval(() => {
          if (isStoppedRef.current) {
            clearInterval(progressIntervalRef.current!);
            resolve(false);
            return;
          }

          currentProgress += 100 / steps;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(progressIntervalRef.current!);
          }

          // Update using current state from ref
          const progressGroup = {
            ...currentGroupRef.current,
            analyses: currentGroupRef.current.analyses.map((a) =>
              a.id === analysisId
                ? {
                    ...a,
                    status: "running" as const,
                    progress: Math.round(currentProgress),
                  }
                : a
            ),
          };
          currentGroupRef.current = progressGroup;
          onUpdateGroup(progressGroup);
        }, stepDuration);

        // After duration, complete the analysis
        animationTimeoutRef.current = setTimeout(() => {
          if (isStoppedRef.current) {
            resolve(false);
            return;
          }

          clearInterval(progressIntervalRef.current!);

          // Generate metrics and evaluate requirements
          const metrics = generateMockMetrics(analysis);
          const updatedRequirements = evaluateRequirements(analysis, metrics);

          // 30% chance of failure for testing
          const hasFailed = Math.random() > 0.7;

          console.log(
            `Completing analysis: ${analysis.name}, failed: ${hasFailed}`
          );

          // Set final status - using current state from ref
          const finalGroup = {
            ...currentGroupRef.current,
            analyses: currentGroupRef.current.analyses.map((a) =>
              a.id === analysisId
                ? {
                    ...a,
                    status: hasFailed
                      ? ("failed" as const)
                      : ("completed" as const),
                    progress: undefined,
                    metrics,
                    requirements: updatedRequirements,
                    errors: hasFailed
                      ? ["Requirement threshold exceeded"]
                      : undefined,
                  }
                : a
            ),
          };
          currentGroupRef.current = finalGroup;
          onUpdateGroup(finalGroup);

          resolve(!hasFailed);
        }, duration);
      });
    },
    [onUpdateGroup, generateMockMetrics, evaluateRequirements]
  );

  // Sequential animation
  const runSequentialAnimation = useCallback(async () => {
    isStoppedRef.current = false;

    const currentGroup = currentGroupRef.current;
    for (let i = 0; i < currentGroup.analyses.length; i++) {
      if (isStoppedRef.current) break;

      currentIndexRef.current = i;
      const analysis = currentGroup.analyses[i];

      // Run single animation and wait for completion
      const success = await animateSingleAnalysis(analysis.id);

      // If failed or stopped, end the sequence
      if (!success || isStoppedRef.current) {
        break;
      }

      // Small delay between analyses
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Animation sequence complete
    setIsRunning(false);
    setCurrentAnalysisId(null);
    currentIndexRef.current = -1;

    // Update group status based on final state
    const finalGroup = currentGroupRef.current;
    const allCompleted = finalGroup.analyses.every(
      (a) => a.status === "completed"
    );
    const anyFailed = finalGroup.analyses.some((a) => a.status === "failed");

    // With this (explicitly type the status):
    const newStatus: AnalysisGroup["status"] = allCompleted
      ? "passed"
      : anyFailed
      ? "partial"
      : "pending";

    const statusGroup: AnalysisGroup = {
      ...finalGroup,
      status: newStatus,
    };

    currentGroupRef.current = statusGroup;
    onUpdateGroup(statusGroup);

    onAnimationComplete?.();
  }, [animateSingleAnalysis, onUpdateGroup, onAnimationComplete]);

  const startAnimation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    runSequentialAnimation();
  }, [isRunning, runSequentialAnimation]);

  const stopAnimation = useCallback(() => {
    isStoppedRef.current = true;
    setIsRunning(false);
    setCurrentAnalysisId(null);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();

    // Reset all analyses to pending state
    const resetGroup: AnalysisGroup = {
      ...currentGroupRef.current,
      status: "pending",
      analyses: currentGroupRef.current.analyses.map((a) => ({
        ...a,
        status: "pending",
        progress: undefined,
        metrics: [],
        requirements: a.requirements?.map((r) => ({
          ...r,
          currentValue: undefined,
          status: "pending",
        })),
      })),
    };

    currentGroupRef.current = resetGroup;
    onUpdateGroup(resetGroup);
    currentIndexRef.current = -1;
  }, [onUpdateGroup, stopAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppedRef.current = true;
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    currentGroupRef.current = analysisGroup;
  }, [analysisGroup]);

  return {
    isRunning,
    currentAnalysisId,
    startAnimation,
    stopAnimation,
    resetAnimation,
    animateSingleAnalysis: (analysisId: string) => {
      // Wrapper for external calls that don't need the promise
      animateSingleAnalysis(analysisId);
    },
  };
};
