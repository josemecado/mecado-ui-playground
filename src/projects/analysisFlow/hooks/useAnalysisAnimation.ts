// hooks/useAnalysisAnimation.ts
import { useState, useCallback, useRef, useEffect } from "react";
import {
  AnalysisGroup,
  Analysis,
} from "../../versionNodes/utils/VersionInterfaces";
import {
  getMockMetricsForAnalysis,
  evaluateRequirementsWithMockData,
} from "../utils/mockAnalysisData";

interface UseAnalysisAnimationProps {
  analysisGroup?: AnalysisGroup; // Made optional for multi-group mode
  analysisGroups?: AnalysisGroup[]; // NEW: For running all groups
  onUpdateGroup: (groupIdOrGroup: string | AnalysisGroup, updatedGroup?: AnalysisGroup) => void;
  onAnimationComplete?: () => void;
}

interface UseAnalysisAnimationReturn {
  isRunning: boolean;
  currentAnalysisId: string | null;
  currentGroupId: string | null; // NEW: Track which group is running
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  animateSingleAnalysis: (analysisId: string) => void;
  runAllGroups: () => void; // NEW
}

export const useAnalysisAnimation = ({
  analysisGroup,
  analysisGroups,
  onUpdateGroup,
  onAnimationComplete,
}: UseAnalysisAnimationProps): UseAnalysisAnimationReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const currentGroupRef = useRef<AnalysisGroup | undefined>(analysisGroup);
  const allGroupsRef = useRef<AnalysisGroup[]>(analysisGroups || []);

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const isStoppedRef = useRef(false);

  // Core animation function - works for both single group and multi-group
  const animateSingleAnalysis = useCallback(
    (analysisId: string, groupId?: string): Promise<boolean> => {
      return new Promise((resolve) => {
        // Get the group either from currentGroupRef or from allGroupsRef
        let targetGroup: AnalysisGroup | undefined;
        
        if (groupId) {
          targetGroup = allGroupsRef.current.find(g => g.id === groupId);
        } else {
          targetGroup = currentGroupRef.current;
        }

        if (!targetGroup) {
          resolve(false);
          return;
        }

        const analysis = targetGroup.analyses.find((a) => a.id === analysisId);
        if (!analysis) {
          resolve(false);
          return;
        }

        console.log(`Starting animation for: ${analysis.name}`);
        setCurrentAnalysisId(analysisId);
        if (groupId) setCurrentGroupId(groupId);

        // Set to running with progress 0
        const runningGroup = {
          ...targetGroup,
          status: "running" as const,
          analyses: targetGroup.analyses.map((a) =>
            a.id === analysisId
              ? { ...a, status: "running" as const, progress: 0 }
              : a
          ),
        };

        // Update the appropriate ref
        if (groupId) {
          allGroupsRef.current = allGroupsRef.current.map(g =>
            g.id === groupId ? runningGroup : g
          );
          onUpdateGroup(groupId, runningGroup);
        } else {
          currentGroupRef.current = runningGroup;
          onUpdateGroup(runningGroup);
        }

        // Animate progress
        const duration = 2000;
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

          // Update progress
          const progressGroup = {
            ...(groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!),
            analyses: (groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!).analyses.map((a) =>
              a.id === analysisId
                ? {
                    ...a,
                    status: "running" as const,
                    progress: Math.round(currentProgress),
                  }
                : a
            ),
          };

          if (groupId) {
            allGroupsRef.current = allGroupsRef.current.map(g =>
              g.id === groupId ? progressGroup : g
            );
            onUpdateGroup(groupId, progressGroup);
          } else {
            currentGroupRef.current = progressGroup;
            onUpdateGroup(progressGroup);
          }
        }, stepDuration);

        // After duration, complete the analysis
        animationTimeoutRef.current = setTimeout(() => {
          if (isStoppedRef.current) {
            resolve(false);
            return;
          }

          clearInterval(progressIntervalRef.current!);

          // Generate metrics and evaluate requirements
          const metrics = getMockMetricsForAnalysis(analysisId);
          const updatedRequirements = evaluateRequirementsWithMockData(analysis);

          const hasFailed = updatedRequirements
            ? updatedRequirements.some((req) => req.status === "fail")
            : false;

          console.log(`Completing analysis: ${analysis.name}, failed: ${hasFailed}`);

          // Set final status
          const finalGroup = {
            ...(groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!),
            analyses: (groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!).analyses.map((a) =>
              a.id === analysisId
                ? {
                    ...a,
                    status: hasFailed ? ("failed" as const) : ("completed" as const),
                    progress: undefined,
                    metrics,
                    requirements: updatedRequirements,
                    errors: hasFailed ? ["Requirement threshold exceeded"] : undefined,
                  }
                : a
            ),
          };

          if (groupId) {
            allGroupsRef.current = allGroupsRef.current.map(g =>
              g.id === groupId ? finalGroup : g
            );
            onUpdateGroup(groupId, finalGroup);
          } else {
            currentGroupRef.current = finalGroup;
            onUpdateGroup(finalGroup);
          }

          resolve(!hasFailed);
        }, duration);
      });
    },
    [onUpdateGroup]
  );

// Sequential animation for single group
const runSequentialAnimation = useCallback(async () => {
  isStoppedRef.current = false;

  const currentGroup = currentGroupRef.current;
  if (!currentGroup) return;

  for (let i = 0; i < currentGroup.analyses.length; i++) {
    if (isStoppedRef.current) break;

    currentIndexRef.current = i;
    const analysis = currentGroup.analyses[i];

    const success = await animateSingleAnalysis(analysis.id);

    // CHANGED: Only stop if user manually stopped, not on failure
    if (isStoppedRef.current) {
      break;
    }
    // Remove the early exit on failure - continue to next analysis

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Animation sequence complete
  setIsRunning(false);
  setCurrentAnalysisId(null);
  setCurrentGroupId(null);
  currentIndexRef.current = -1;

  // Update group status
  const finalGroup = currentGroupRef.current!;
  const allCompleted = finalGroup.analyses.every((a) => a.status === "completed");
  const anyFailed = finalGroup.analyses.some((a) => a.status === "failed");

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

// NEW: Run all groups sequentially
const runAllGroupsSequentially = useCallback(async () => {
  isStoppedRef.current = false;

  for (const group of allGroupsRef.current) {
    if (isStoppedRef.current) break;

    setCurrentGroupId(group.id);

    // Run all analyses in this group
    for (const analysis of group.analyses) {
      if (isStoppedRef.current) break;

      const success = await animateSingleAnalysis(analysis.id, group.id);
      
      // CHANGED: Only stop if user manually stopped, not on failure
      if (isStoppedRef.current) break;
      // Remove the early exit on failure - continue to next analysis

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Update group status after all analyses complete
    const finalGroup = allGroupsRef.current.find(g => g.id === group.id);
    if (finalGroup) {
      const allCompleted = finalGroup.analyses.every(a => a.status === "completed");
      const anyFailed = finalGroup.analyses.some(a => a.status === "failed");
      const newStatus: AnalysisGroup["status"] = allCompleted ? "passed" : anyFailed ? "partial" : "pending";

      const statusGroup = {
        ...finalGroup,
        status: newStatus,
      };
      allGroupsRef.current = allGroupsRef.current.map(g =>
        g.id === group.id ? statusGroup : g
      );
      onUpdateGroup(group.id, statusGroup);
    }

    // Delay between groups
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  setIsRunning(false);
  setCurrentGroupId(null);
  setCurrentAnalysisId(null);
  onAnimationComplete?.();
}, [animateSingleAnalysis, onUpdateGroup, onAnimationComplete]);

  const startAnimation = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    runSequentialAnimation();
  }, [isRunning, runSequentialAnimation]);

  const runAllGroups = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    runAllGroupsSequentially();
  }, [isRunning, runAllGroupsSequentially]);

  const stopAnimation = useCallback(() => {
    isStoppedRef.current = true;
    setIsRunning(false);
    setCurrentAnalysisId(null);
    setCurrentGroupId(null);

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();

    // Reset single group if in single-group mode
    if (currentGroupRef.current) {
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
    }

    // Reset all groups if in multi-group mode
    if (allGroupsRef.current.length > 0) {
      allGroupsRef.current.forEach(group => {
        const resetGroup: AnalysisGroup = {
          ...group,
          status: "pending",
          analyses: group.analyses.map(a => ({
            ...a,
            status: "pending",
            progress: undefined,
            metrics: [],
            requirements: a.requirements?.map(r => ({
              ...r,
              currentValue: undefined,
              status: "pending",
            })),
          })),
        };
        onUpdateGroup(group.id, resetGroup);
      });
    }

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

  // Update refs when props change
  useEffect(() => {
    if (analysisGroup) currentGroupRef.current = analysisGroup;
  }, [analysisGroup]);

  useEffect(() => {
    if (analysisGroups) allGroupsRef.current = analysisGroups;
  }, [analysisGroups]);

  return {
    isRunning,
    currentAnalysisId,
    currentGroupId,
    startAnimation,
    stopAnimation,
    resetAnimation,
    runAllGroups, // NEW
    animateSingleAnalysis: (analysisId: string) => {
      animateSingleAnalysis(analysisId);
    },
  };
};