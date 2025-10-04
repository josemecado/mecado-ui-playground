// components/analysis/analysisNodeState.ts
import { Analysis, CurrentStepInfo } from "../../../versionNodes/utils/VersionInterfaces"

export enum NodeUIState {
  IDLE = "idle",                           // Pending, no activity
  RUNNING_PRIMARY = "running_primary",     // This analysis is running
  RUNNING_SECONDARY = "running_secondary", // Participating in shared step
  WAITING_WITH_SHARED = "waiting_with_shared", // Has completed shared steps, waiting
  COMPLETED = "completed",
  FAILED = "failed"
}

export function deriveNodeUIState(
  analysis: Analysis,
  currentStepInfo: CurrentStepInfo | null
): NodeUIState {
  // Failed takes precedence
  if (analysis.status === "failed") return NodeUIState.FAILED;
  
  // Completed
  if (analysis.status === "completed") return NodeUIState.COMPLETED;
  
  // Running as primary
  if (analysis.status === "running") return NodeUIState.RUNNING_PRIMARY;
  
  // Check involvement in current step (for pending analyses)
  if (analysis.status === "pending" && currentStepInfo) {
    const isSecondary = currentStepInfo.sharedWithAnalysisIds.includes(analysis.id);
    if (isSecondary && currentStepInfo.isSharedStep) {
      return NodeUIState.RUNNING_SECONDARY;
    }
  }
  
  // Has completed shared steps but waiting
  if (analysis.status === "pending" && 
      analysis.sharedStepsCompleted && 
      analysis.sharedStepsCompleted.length > 0) {
    return NodeUIState.WAITING_WITH_SHARED;
  }
  
  // Default pending/idle
  return NodeUIState.IDLE;
}

// Helper to get the current active step info for the node
export function getCurrentStepForNode(
  analysis: Analysis,
  currentStepInfo: CurrentStepInfo | null
): { stepIndex: number; stepProgress: number; isShared: boolean } | null {
  if (!currentStepInfo) return null;
  
  const isPrimary = currentStepInfo.primaryAnalysisId === analysis.id;
  const isSecondary = currentStepInfo.sharedWithAnalysisIds.includes(analysis.id);
  
  if (isPrimary || isSecondary) {
    return {
      stepIndex: currentStepInfo.stepIndex,
      stepProgress: currentStepInfo.progress,
      isShared: currentStepInfo.isSharedStep
    };
  }
  
  return null;
}