// hooks/useAnalysisAnimation.ts
import { useState, useCallback, useRef, useEffect } from "react";
import {
  AnalysisGroup,
  Analysis,
  AnalysisStep,
  DEFAULT_ANALYSIS_STEPS,
  SharedStepConfig,
  CurrentStepInfo,
} from "../../versionNodes/utils/VersionInterfaces";
import {
  getMockMetricsForAnalysis,
  evaluateRequirementsWithMockData,
} from "../utils/mockAnalysisData";

interface UseAnalysisAnimationProps {
  analysisGroup?: AnalysisGroup;
  analysisGroups?: AnalysisGroup[];
  onUpdateGroup: (
    groupIdOrGroup: string | AnalysisGroup,
    updatedGroup?: AnalysisGroup
  ) => void;
  onAnimationComplete?: () => void;
}

interface UseAnalysisAnimationReturn {
  isRunning: boolean;
  currentAnalysisId: string | null;
  currentGroupId: string | null;
  currentStepInfo: CurrentStepInfo | null;
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
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(
    null
  );
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentStepInfo, setCurrentStepInfo] =
    useState<CurrentStepInfo | null>(null);

  const currentGroupRef = useRef<AnalysisGroup | undefined>(analysisGroup);
  const allGroupsRef = useRef<AnalysisGroup[]>(analysisGroups || []);
  const completedSharedStepsRef = useRef<Set<string>>(new Set());

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const isStoppedRef = useRef(false);

  // Helper function to create fresh steps
  const createFreshSteps = (): AnalysisStep[] => {
    return DEFAULT_ANALYSIS_STEPS.map((step) => ({
      ...step,
      status: "pending" as const,
      progress: undefined,
    }));
  };

  // Helper to find all analyses that share a step
  const findSharedAnalyses = (
    analysisId: string,
    stepIndex: number,
    allGroups: AnalysisGroup[]
  ): { analysis: Analysis; groupId: string }[] => {
    const sharedAnalyses: { analysis: Analysis; groupId: string }[] = [];

    let sharedConfig: SharedStepConfig | undefined;

    for (const group of allGroups) {
      const analysis = group.analyses.find((a) => a.id === analysisId);
      if (analysis) {
        sharedConfig = analysis.sharedSteps?.find(
          (s) => s.stepIndex === stepIndex
        );
        break;
      }
    }

    if (!sharedConfig?.sharedWithAnalyses) return sharedAnalyses;

    for (const sharedAnalysisId of sharedConfig.sharedWithAnalyses) {
      for (const group of allGroups) {
        const analysis = group.analyses.find((a) => a.id === sharedAnalysisId);
        if (analysis) {
          sharedAnalyses.push({ analysis, groupId: group.id });
        }
      }
    }

    return sharedAnalyses;
  };

  // Helper to determine if this analysis is the "primary" one
  const isPrimaryForSharedStep = (
    analysisId: string,
    stepIndex: number,
    allGroups: AnalysisGroup[]
  ): boolean => {
    let sharedStepId: string | undefined;
    let sharedWithIds: string[] = [];

    for (const group of allGroups) {
      const analysis = group.analyses.find((a) => a.id === analysisId);
      if (analysis?.sharedSteps) {
        const sharedConfig = analysis.sharedSteps.find(
          (s) => s.stepIndex === stepIndex
        );
        if (sharedConfig) {
          sharedStepId = sharedConfig.sharedStepId;
          sharedWithIds = [analysisId, ...sharedConfig.sharedWithAnalyses];
          break;
        }
      }
    }

    if (!sharedStepId || sharedWithIds.length === 0) return true;

    for (const group of allGroups) {
      for (const analysis of group.analyses) {
        if (sharedWithIds.includes(analysis.id)) {
          return analysis.id === analysisId;
        }
      }
    }

    return true;
  };

  // Helper function to animate a single step
  const animateStep = (
    stepIndex: number,
    analysisId: string,
    groupId?: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      console.log(
        `\n🎬 [STEP START] Analysis: ${analysisId}, Step: ${stepIndex}`
      );

      const stepDuration = 2000;
      const progressSteps = 20;
      const progressInterval = stepDuration / progressSteps;
      let currentProgress = 0;

      const allGroups = groupId
        ? allGroupsRef.current
        : [currentGroupRef.current!];

      const sharedAnalyses = findSharedAnalyses(
        analysisId,
        stepIndex,
        allGroupsRef.current
      );

      const primaryAnalysis = allGroups
        .flatMap((g) => g.analyses)
        .find((a) => a.id === analysisId);

      const stepName =
        primaryAnalysis?.steps?.[stepIndex]?.name ||
        DEFAULT_ANALYSIS_STEPS[stepIndex].name;

      const sharedStepId = primaryAnalysis?.sharedSteps?.find(
        (s) => s.stepIndex === stepIndex
      )?.sharedStepId;

      // Check if already completed
      if (sharedStepId) {
        const isThisPrimary = isPrimaryForSharedStep(
          analysisId,
          stepIndex,
          allGroups
        );

        if (
          !isThisPrimary &&
          completedSharedStepsRef.current.has(sharedStepId)
        ) {
          console.log(`  ⏭️  SKIPPING - Step already completed by primary`);

          const targetGroup = groupId
            ? allGroupsRef.current.find((g) => g.id === groupId)
            : currentGroupRef.current;

          if (targetGroup) {
            const updatedGroup = {
              ...targetGroup,
              analyses: targetGroup.analyses.map((a) => {
                if (a.id === analysisId) {
                  const steps = a.steps || createFreshSteps();
                  const updatedSteps = steps.map((s, idx) => {
                    if (idx <= stepIndex) {
                      return {
                        ...s,
                        status: "completed" as const,
                        progress: 100,
                      };
                    }
                    return s;
                  });
                  return { ...a, steps: updatedSteps };
                }
                return a;
              }),
            };

            if (groupId) {
              allGroupsRef.current = allGroupsRef.current.map((g) =>
                g.id === groupId ? updatedGroup : g
              );
              onUpdateGroup(groupId, updatedGroup);
            } else {
              currentGroupRef.current = updatedGroup;
              onUpdateGroup(updatedGroup);
            }
          }

          resolve();
          return;
        }
      }

      // Set currentStepInfo for this step
      const isSharedStep = sharedAnalyses.length > 0;
      const newStepInfo: CurrentStepInfo = {
        primaryAnalysisId: analysisId,
        groupId: groupId || currentGroupRef.current?.id || "",
        stepIndex,
        stepName,
        isSharedStep,
        sharedWithAnalysisIds: sharedAnalyses.map((sa) => sa.analysis.id),
        progress: 0,
        status: "running",
      };

      setCurrentStepInfo(newStepInfo);

      // Update analyses to show step as running
      const analysesToUpdate = [
        { analysisId, groupId: groupId || "" },
        ...(sharedStepId &&
        isPrimaryForSharedStep(analysisId, stepIndex, allGroups)
          ? sharedAnalyses.map((sa) => ({
              analysisId: sa.analysis.id,
              groupId: sa.groupId,
            }))
          : []),
      ];

      console.log(
        `  🔄 Updating ${analysesToUpdate.length} analyses simultaneously`
      );

      analysesToUpdate.forEach(({ analysisId: aId, groupId: gId }) => {
        const targetGroup = gId
          ? allGroupsRef.current.find((g) => g.id === gId)
          : currentGroupRef.current;

        if (!targetGroup) return;

        const runningStepGroup = {
          ...targetGroup,
          analyses: targetGroup.analyses.map((a) => {
            if (a.id === aId) {
              const steps = a.steps || createFreshSteps();
              const updatedSteps = steps.map((s, idx) => {
                if (idx < stepIndex) {
                  return { ...s, status: "completed" as const, progress: 100 };
                } else if (idx === stepIndex) {
                  return { ...s, status: "running" as const, progress: 0 };
                } else {
                  return {
                    ...s,
                    status: "pending" as const,
                    progress: undefined,
                  };
                }
              });

              const isPrimary = aId === analysisId;
              const newStatus = isPrimary
                ? ("running" as const)
                : ("pending" as const);

              return {
                ...a,
                status: newStatus,
                steps: updatedSteps,
                currentStepIndex: stepIndex,
                progress: Math.round((stepIndex / steps.length) * 100),
              };
            }
            return a;
          }),
        };

        if (gId) {
          allGroupsRef.current = allGroupsRef.current.map((g) =>
            g.id === gId ? runningStepGroup : g
          );
          onUpdateGroup(gId, runningStepGroup);
        } else {
          currentGroupRef.current = runningStepGroup;
          onUpdateGroup(runningStepGroup);
        }
      });

      // Animate step progress
      const stepProgressInterval = setInterval(() => {
        if (isStoppedRef.current) {
          clearInterval(stepProgressInterval);
          setCurrentStepInfo(null);
          resolve();
          return;
        }

        currentProgress += 100 / progressSteps;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(stepProgressInterval);
        }

        // Update currentStepInfo progress
        setCurrentStepInfo((prev) =>
          prev ? { ...prev, progress: currentProgress } : null
        );

        // Update progress for all analyses with this shared step
        analysesToUpdate.forEach(({ analysisId: aId, groupId: gId }) => {
          const targetGroup = gId
            ? allGroupsRef.current.find((g) => g.id === gId)
            : currentGroupRef.current;

          if (!targetGroup) return;

          const progressGroup = {
            ...targetGroup,
            analyses: targetGroup.analyses.map((a) => {
              if (a.id === aId) {
                const steps = a.steps || createFreshSteps();
                const updatedSteps = steps.map((s, idx) => {
                  if (idx < stepIndex) {
                    return {
                      ...s,
                      status: "completed" as const,
                      progress: 100,
                    };
                  } else if (idx === stepIndex) {
                    return {
                      ...s,
                      status: "running" as const,
                      progress: Math.round(currentProgress),
                    };
                  } else {
                    return {
                      ...s,
                      status: "pending" as const,
                      progress: undefined,
                    };
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
                  progress: overallProgress,
                };
              }
              return a;
            }),
          };

          if (gId) {
            allGroupsRef.current = allGroupsRef.current.map((g) =>
              g.id === gId ? progressGroup : g
            );
            onUpdateGroup(gId, progressGroup);
          } else {
            currentGroupRef.current = progressGroup;
            onUpdateGroup(progressGroup);
          }
        });

        if (currentProgress >= 100) {
          // Mark step as completed
          setTimeout(() => {
            analysesToUpdate.forEach(({ analysisId: aId, groupId: gId }) => {
              const targetGroup = gId
                ? allGroupsRef.current.find((g) => g.id === gId)
                : currentGroupRef.current;

              if (!targetGroup) return;

              const completedStepGroup = {
                ...targetGroup,
                analyses: targetGroup.analyses.map((a) => {
                  if (a.id === aId) {
                    const steps = a.steps || createFreshSteps();
                    const updatedSteps = steps.map((s, idx) => {
                      if (idx <= stepIndex) {
                        return {
                          ...s,
                          status: "completed" as const,
                          progress: 100,
                        };
                      } else {
                        return {
                          ...s,
                          status: "pending" as const,
                          progress: undefined,
                        };
                      }
                    });

                    const isPrimary = aId === analysisId;
                    const newStatus: Analysis["status"] = isPrimary
                      ? "running"
                      : "pending";

                    return {
                      ...a,
                      steps: updatedSteps,
                      currentStepIndex: undefined,
                      status: newStatus,
                      sharedStepsCompleted: isPrimary
                        ? a.sharedStepsCompleted
                        : [...(a.sharedStepsCompleted || []), stepIndex],
                      progress: Math.round(
                        ((stepIndex + 1) / steps.length) * 100
                      ),
                    };
                  }
                  return a;
                }),
              };

              if (gId) {
                allGroupsRef.current = allGroupsRef.current.map((g) =>
                  g.id === gId ? completedStepGroup : g
                );
                onUpdateGroup(gId, completedStepGroup);
              } else {
                currentGroupRef.current = completedStepGroup;
                onUpdateGroup(completedStepGroup);
              }
            });

            if (
              sharedStepId &&
              isPrimaryForSharedStep(analysisId, stepIndex, allGroups)
            ) {
              completedSharedStepsRef.current.add(sharedStepId);
            }

            // Clear currentStepInfo when step completes
            setCurrentStepInfo(null);
            console.log(
              `🏁 [STEP END] Analysis: ${analysisId}, Step: ${stepIndex}\n`
            );
            resolve();
          }, 100);
        }
      }, progressInterval);
    });
  };

  const animateSingleAnalysis = useCallback(
    (analysisId: string, groupId?: string): Promise<boolean> => {
      return new Promise(async (resolve) => {
        console.log(
          `\n\n🚀 ========== STARTING ANALYSIS: ${analysisId} ==========`
        );

        let targetGroup: AnalysisGroup | undefined;

        if (groupId) {
          targetGroup = allGroupsRef.current.find((g) => g.id === groupId);
          console.log(`  📂 Group: ${targetGroup?.name} (${groupId})`);
        } else {
          targetGroup = currentGroupRef.current;
          console.log(`  📂 Group: ${targetGroup?.name} (current)`);
        }

        if (!targetGroup) {
          console.log(`  ❌ Target group not found`);
          resolve(false);
          return;
        }

        const analysis = targetGroup.analyses.find((a) => a.id === analysisId);
        if (!analysis) {
          console.log(`  ❌ Analysis not found in group`);
          resolve(false);
          return;
        }

        // IMPORTANT: Reset the analysis state before starting
        // This ensures we're not trying to animate an already-completed analysis
        const resetGroup = {
          ...targetGroup,
          analyses: targetGroup.analyses.map((a) =>
            a.id === analysisId
              ? {
                  ...a,
                  status: "pending" as const, // Reset to pending
                  progress: 0,
                  steps: undefined,
                  currentStepIndex: undefined,
                  sharedStepRunning: false,
                  sharedStepsCompleted: [],
                  metrics: [],
                  errors: undefined,
                  warnings: undefined,
                }
              : a
          ),
        };

        // Apply the reset immediately
        if (groupId) {
          allGroupsRef.current = allGroupsRef.current.map((g) =>
            g.id === groupId ? resetGroup : g
          );
          onUpdateGroup(groupId, resetGroup);
        } else {
          currentGroupRef.current = resetGroup;
          onUpdateGroup(resetGroup);
        }

        // Now get the reset analysis
        const resetAnalysis = resetGroup.analyses.find(
          (a) => a.id === analysisId
        )!;

        console.log(`  📝 Analysis: ${resetAnalysis.name}`);
        console.log(`  📊 Initial status: ${resetAnalysis.status}`);
        console.log(
          `  🔗 Shared steps: ${resetAnalysis.sharedSteps?.length || 0}`
        );
        console.log(
          `  ✅ Completed shared steps: ${
            resetAnalysis.sharedStepsCompleted?.length || 0
          }`
        );

        setCurrentAnalysisId(analysisId);
        if (groupId) setCurrentGroupId(groupId);

        // Initialize with fresh steps
        const initialSteps = createFreshSteps();
        console.log(`  📋 Total steps to run: ${initialSteps.length}`);

        // Check if the first step is a shared step
        const hasSharedFirstStep = resetAnalysis.sharedSteps?.some(
          (s) => s.stepIndex === 0
        );

        // NOW set it to running
        const runningGroup = {
          ...resetGroup,
          status: "running" as const,
          analyses: resetGroup.analyses.map((a) =>
            a.id === analysisId
              ? {
                  ...a,
                  status: "running" as const,
                  progress: 0,
                  steps: initialSteps,
                  currentStepIndex: 0,
                  // Set sharedStepRunning if the first step is shared
                  sharedStepRunning: hasSharedFirstStep || false,
                }
              : a
          ),
        };
        if (groupId) {
          allGroupsRef.current = allGroupsRef.current.map((g) =>
            g.id === groupId ? runningGroup : g
          );
          onUpdateGroup(groupId, runningGroup);
        } else {
          currentGroupRef.current = runningGroup;
          onUpdateGroup(runningGroup);
        }

        // Animate through each step
        for (let stepIndex = 0; stepIndex < initialSteps.length; stepIndex++) {
          if (analysis.sharedStepsCompleted?.includes(stepIndex)) {
            console.log(
              `  ⏭️  SKIPPING step ${stepIndex} - already completed via sharing`
            );
            continue;
          }

          await animateStep(stepIndex, analysisId, groupId);

          // Small delay between steps
          if (stepIndex < initialSteps.length - 1) {
            await new Promise((r) => setTimeout(r, 200));
          }
        }

        // After all steps complete, finalize the analysis
        if (isStoppedRef.current) {
          console.log(`  🛑 Animation stopped`);
          resolve(false);
          return;
        }

        // Generate metrics and evaluate requirements
        const metrics = getMockMetricsForAnalysis(analysisId, analysis.type);

        const updatedRequirements = evaluateRequirementsWithMockData(analysis);

        const hasFailed = updatedRequirements
          ? updatedRequirements.some((req) => req.status === "fail")
          : false;

        console.log(`  📊 Metrics generated: ${metrics.length}`);
        console.log(
          `  ✅ Requirements passed: ${
            updatedRequirements?.filter((r) => r.status === "pass").length || 0
          }`
        );
        console.log(
          `  ❌ Requirements failed: ${
            updatedRequirements?.filter((r) => r.status === "fail").length || 0
          }`
        );
        console.log(
          `  ${hasFailed ? "❌" : "✅"} Final status: ${
            hasFailed ? "FAILED" : "COMPLETED"
          }`
        );

        // Set final status with all steps completed
        const completedSteps = initialSteps.map((s) => ({
          ...s,
          status: "completed" as const,
          progress: 100,
        }));

        const finalGroup = {
          ...(groupId
            ? allGroupsRef.current.find((g) => g.id === groupId)!
            : currentGroupRef.current!),
          analyses: (groupId
            ? allGroupsRef.current.find((g) => g.id === groupId)!
            : currentGroupRef.current!
          ).analyses.map((a) =>
            a.id === analysisId
              ? {
                  ...a,
                  status: hasFailed
                    ? ("failed" as const)
                    : ("completed" as const),
                  progress: 100,
                  steps: completedSteps,
                  currentStepIndex: undefined,
                  metrics,
                  requirements: updatedRequirements,
                  errors: hasFailed
                    ? ["Requirement threshold exceeded"]
                    : undefined,
                }
              : a
          ),
        };

        if (groupId) {
          allGroupsRef.current = allGroupsRef.current.map((g) =>
            g.id === groupId ? finalGroup : g
          );
          onUpdateGroup(groupId, finalGroup);
        } else {
          currentGroupRef.current = finalGroup;
          onUpdateGroup(finalGroup);
        }

        console.log(
          `🏁 ========== FINISHED ANALYSIS: ${analysisId} ==========\n\n`
        );
        resolve(!hasFailed);
      });
    },
    [onUpdateGroup]
  );

  // Sequential animation for single group
  const runSequentialAnimation = useCallback(async () => {
    isStoppedRef.current = false;
    completedSharedStepsRef.current.clear();

    const currentGroup = currentGroupRef.current;
    if (!currentGroup) return;

    // Reset all analyses in the group before starting
    const resetGroup: AnalysisGroup = {
      ...currentGroup,
      status: "pending",
      analyses: currentGroup.analyses.map((a) => ({
        ...a,
        status: "pending" as const,
        progress: 0,
        steps: undefined,
        currentStepIndex: undefined,
        sharedStepRunning: false,
        sharedStepsCompleted: [],
        metrics: [],
        errors: undefined,
        warnings: undefined,
        requirements: a.requirements?.map((r) => ({
          ...r,
          currentValue: undefined,
          status: "pending" as const,
        })),
      })),
    };

    currentGroupRef.current = resetGroup;
    onUpdateGroup(resetGroup);

    // Small delay to let the reset propagate
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Now proceed with animation
    for (let i = 0; i < resetGroup.analyses.length; i++) {
      if (isStoppedRef.current) break;

      currentIndexRef.current = i;
      const analysis = currentGroup.analyses[i];

      const success = await animateSingleAnalysis(analysis.id);

      if (isStoppedRef.current) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Animation sequence complete
    setIsRunning(false);
    setCurrentAnalysisId(null);
    setCurrentGroupId(null);
    currentIndexRef.current = -1;

    // Update group status
    const finalGroup = currentGroupRef.current!;
    const allCompleted = finalGroup.analyses.every(
      (a) => a.status === "completed"
    );
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

  // Run all groups sequentially
  const runAllGroupsSequentially = useCallback(async () => {
    isStoppedRef.current = false;
    completedSharedStepsRef.current.clear(); // Clear shared steps tracking

    for (const group of allGroupsRef.current) {
      if (isStoppedRef.current) break;

      setCurrentGroupId(group.id);

      for (const analysis of group.analyses) {
        if (isStoppedRef.current) break;

        const success = await animateSingleAnalysis(analysis.id, group.id);

        if (isStoppedRef.current) break;

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Update group status after all analyses complete
      const finalGroup = allGroupsRef.current.find((g) => g.id === group.id);
      if (finalGroup) {
        const allCompleted = finalGroup.analyses.every(
          (a) => a.status === "completed"
        );
        const anyFailed = finalGroup.analyses.some(
          (a) => a.status === "failed"
        );
        const newStatus: AnalysisGroup["status"] = allCompleted
          ? "passed"
          : anyFailed
          ? "partial"
          : "pending";

        const statusGroup = {
          ...finalGroup,
          status: newStatus,
        };
        allGroupsRef.current = allGroupsRef.current.map((g) =>
          g.id === group.id ? statusGroup : g
        );
        onUpdateGroup(group.id, statusGroup);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
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
    setCurrentStepInfo(null); // Clear step info

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
    completedSharedStepsRef.current.clear(); // Clear shared steps tracking
    setCurrentStepInfo(null); // Clear step info

    // Reset single group if in single-group mode
    if (currentGroupRef.current) {
      const resetGroup: AnalysisGroup = {
        ...currentGroupRef.current,
        status: "pending",
        analyses: currentGroupRef.current.analyses.map((a) => ({
          ...a,
          status: "pending",
          progress: undefined,
          steps: undefined,
          currentStepIndex: undefined,
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
      allGroupsRef.current.forEach((group) => {
        const resetGroup: AnalysisGroup = {
          ...group,
          status: "pending",
          analyses: group.analyses.map((a) => ({
            ...a,
            status: "pending",
            progress: undefined,
            steps: undefined,
            currentStepIndex: undefined,
            metrics: [],
            requirements: a.requirements?.map((r) => ({
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
    currentStepInfo, // Export this
    startAnimation,
    stopAnimation,
    resetAnimation,
    runAllGroups,
    animateSingleAnalysis: (analysisId: string) => {
      animateSingleAnalysis(analysisId);
    },
  };
};
