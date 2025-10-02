// hooks/useAnalysisAnimation.ts
import { useState, useCallback, useRef, useEffect } from "react";
import {
  AnalysisGroup,
  Analysis,
  AnalysisStep,
  DEFAULT_ANALYSIS_STEPS,
} from "../../versionNodes/utils/VersionInterfaces";
import {
  getMockMetricsForAnalysis,
  evaluateRequirementsWithMockData,
} from "../utils/mockAnalysisData";

interface UseAnalysisAnimationProps {
  analysisGroup?: AnalysisGroup;
  analysisGroups?: AnalysisGroup[];
  onUpdateGroup: (groupIdOrGroup: string | AnalysisGroup, updatedGroup?: AnalysisGroup) => void;
  onAnimationComplete?: () => void;
}

interface UseAnalysisAnimationReturn {
  isRunning: boolean;
  currentAnalysisId: string | null;
  currentGroupId: string | null;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
  animateSingleAnalysis: (analysisId: string) => void;
  runAllGroups: () => void;
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
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const isStoppedRef = useRef(false);

  // Helper function to create fresh steps
  const createFreshSteps = (): AnalysisStep[] => {
    return DEFAULT_ANALYSIS_STEPS.map(step => ({
      ...step,
      status: "pending" as const,
      progress: undefined
    }));
  };

  // Helper function to animate a single step
  const animateStep = (
    stepIndex: number,
    analysisId: string,
    groupId?: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      const stepDuration = 800; // Duration per step in ms
      const progressSteps = 20;
      const progressInterval = stepDuration / progressSteps;
      let currentProgress = 0;

      // Start the step
      const targetGroup = groupId
        ? allGroupsRef.current.find(g => g.id === groupId)
        : currentGroupRef.current;

      if (!targetGroup) {
        resolve();
        return;
      }

      // Update to show step as running
      const runningStepGroup = {
        ...targetGroup,
        analyses: targetGroup.analyses.map(a => {
          if (a.id === analysisId) {
            const steps = a.steps || createFreshSteps();
            const updatedSteps = steps.map((s, idx) => {
              if (idx < stepIndex) {
                return { ...s, status: "completed" as const, progress: 100 };
              } else if (idx === stepIndex) {
                return { ...s, status: "running" as const, progress: 0 };
              } else {
                return { ...s, status: "pending" as const, progress: undefined };
              }
            });

            return {
              ...a,
              status: "running" as const,
              steps: updatedSteps,
              currentStepIndex: stepIndex,
              progress: Math.round((stepIndex / steps.length) * 100 + (100 / steps.length) * 0)
            };
          }
          return a;
        })
      };

      if (groupId) {
        allGroupsRef.current = allGroupsRef.current.map(g =>
          g.id === groupId ? runningStepGroup : g
        );
        onUpdateGroup(groupId, runningStepGroup);
      } else {
        currentGroupRef.current = runningStepGroup;
        onUpdateGroup(runningStepGroup);
      }

      // Animate step progress
      const stepProgressInterval = setInterval(() => {
        if (isStoppedRef.current) {
          clearInterval(stepProgressInterval);
          resolve();
          return;
        }

        currentProgress += 100 / progressSteps;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(stepProgressInterval);
        }

        const progressGroup = {
          ...(groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!),
          analyses: (groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!).analyses.map(a => {
            if (a.id === analysisId) {
              const steps = a.steps || createFreshSteps();
              const updatedSteps = steps.map((s, idx) => {
                if (idx < stepIndex) {
                  return { ...s, status: "completed" as const, progress: 100 };
                } else if (idx === stepIndex) {
                  return { ...s, status: "running" as const, progress: Math.round(currentProgress) };
                } else {
                  return { ...s, status: "pending" as const, progress: undefined };
                }
              });

              const overallProgress = Math.round(
                (stepIndex / steps.length) * 100 + 
                (100 / steps.length) * (currentProgress / 100)
              );

              return {
                ...a,
                steps: updatedSteps,
                currentStepIndex: stepIndex,
                progress: overallProgress
              };
            }
            return a;
          })
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

        if (currentProgress >= 100) {
          // Mark step as completed
          setTimeout(() => {
            const completedStepGroup = {
              ...(groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!),
              analyses: (groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!).analyses.map(a => {
                if (a.id === analysisId) {
                  const steps = a.steps || createFreshSteps();
                  const updatedSteps = steps.map((s, idx) => {
                    if (idx <= stepIndex) {
                      return { ...s, status: "completed" as const, progress: 100 };
                    } else {
                      return { ...s, status: "pending" as const, progress: undefined };
                    }
                  });

                  return {
                    ...a,
                    steps: updatedSteps,
                    currentStepIndex: stepIndex,
                    progress: Math.round(((stepIndex + 1) / steps.length) * 100)
                  };
                }
                return a;
              })
            };

            if (groupId) {
              allGroupsRef.current = allGroupsRef.current.map(g =>
                g.id === groupId ? completedStepGroup : g
              );
              onUpdateGroup(groupId, completedStepGroup);
            } else {
              currentGroupRef.current = completedStepGroup;
              onUpdateGroup(completedStepGroup);
            }

            resolve();
          }, 100);
        }
      }, progressInterval);
    });
  };

  // Core animation function with steps
  const animateSingleAnalysis = useCallback(
    (analysisId: string, groupId?: string): Promise<boolean> => {
      return new Promise(async (resolve) => {
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

        const analysis = targetGroup.analyses.find(a => a.id === analysisId);
        if (!analysis) {
          resolve(false);
          return;
        }

        console.log(`Starting stepped animation for: ${analysis.name}`);
        setCurrentAnalysisId(analysisId);
        if (groupId) setCurrentGroupId(groupId);

        // Initialize with fresh steps
        const initialSteps = createFreshSteps();
        const runningGroup = {
          ...targetGroup,
          status: "running" as const,
          analyses: targetGroup.analyses.map(a =>
            a.id === analysisId
              ? { 
                  ...a, 
                  status: "running" as const, 
                  progress: 0,
                  steps: initialSteps,
                  currentStepIndex: 0
                }
              : a
          ),
        };

        if (groupId) {
          allGroupsRef.current = allGroupsRef.current.map(g =>
            g.id === groupId ? runningGroup : g
          );
          onUpdateGroup(groupId, runningGroup);
        } else {
          currentGroupRef.current = runningGroup;
          onUpdateGroup(runningGroup);
        }

        // Animate through each step
        for (let stepIndex = 0; stepIndex < initialSteps.length; stepIndex++) {
          if (isStoppedRef.current) {
            resolve(false);
            return;
          }

          await animateStep(stepIndex, analysisId, groupId);
          
          // Small delay between steps
          if (stepIndex < initialSteps.length - 1) {
            await new Promise(r => setTimeout(r, 200));
          }
        }

        // After all steps complete, finalize the analysis
        if (isStoppedRef.current) {
          resolve(false);
          return;
        }

        // Generate metrics and evaluate requirements
        const metrics = getMockMetricsForAnalysis(analysisId);
        const updatedRequirements = evaluateRequirementsWithMockData(analysis);

        const hasFailed = updatedRequirements
          ? updatedRequirements.some(req => req.status === "fail")
          : false;

        console.log(`Completing analysis: ${analysis.name}, failed: ${hasFailed}`);

        // Set final status with all steps completed
        const completedSteps = initialSteps.map(s => ({
          ...s,
          status: "completed" as const,
          progress: 100
        }));

        const finalGroup = {
          ...(groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!),
          analyses: (groupId ? allGroupsRef.current.find(g => g.id === groupId)! : currentGroupRef.current!).analyses.map(a =>
            a.id === analysisId
              ? {
                  ...a,
                  status: hasFailed ? ("failed" as const) : ("completed" as const),
                  progress: 100,
                  steps: completedSteps,
                  currentStepIndex: undefined,
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

      if (isStoppedRef.current) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Animation sequence complete
    setIsRunning(false);
    setCurrentAnalysisId(null);
    setCurrentGroupId(null);
    currentIndexRef.current = -1;

    // Update group status
    const finalGroup = currentGroupRef.current!;
    const allCompleted = finalGroup.analyses.every(a => a.status === "completed");
    const anyFailed = finalGroup.analyses.some(a => a.status === "failed");

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

  // Run all groups sequentially
  const runAllGroupsSequentially = useCallback(async () => {
    isStoppedRef.current = false;

    for (const group of allGroupsRef.current) {
      if (isStoppedRef.current) break;

      setCurrentGroupId(group.id);

      for (const analysis of group.analyses) {
        if (isStoppedRef.current) break;

        const success = await animateSingleAnalysis(analysis.id, group.id);
        
        if (isStoppedRef.current) break;

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
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
    }
  }, []);

  const resetAnimation = useCallback(() => {
    stopAnimation();

    // Reset single group if in single-group mode
    if (currentGroupRef.current) {
      const resetGroup: AnalysisGroup = {
        ...currentGroupRef.current,
        status: "pending",
        analyses: currentGroupRef.current.analyses.map(a => ({
          ...a,
          status: "pending",
          progress: undefined,
          steps: undefined,
          currentStepIndex: undefined,
          metrics: [],
          requirements: a.requirements?.map(r => ({
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
            steps: undefined,
            currentStepIndex: undefined,
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
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current);
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
    runAllGroups,
    animateSingleAnalysis: (analysisId: string) => {
      animateSingleAnalysis(analysisId);
    },
  };
};