// hooks/useAnalysisAnimation.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";

interface UseAnalysisAnimationProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onAnalysisComplete?: (analysisId: string) => void;
  onAnimationComplete?: () => void;
}

interface UseAnalysisAnimationReturn {
  isRunning: boolean;
  currentAnalysisIndex: number;
  startAnimation: () => void;
  stopAnimation: () => void;
  resetAnimation: () => void;
}

export const useAnalysisAnimation = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onAnalysisComplete,
  onAnimationComplete,
}: UseAnalysisAnimationProps): UseAnalysisAnimationReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(-1);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter to get only analysis nodes
  const analysisNodes = nodes.filter(n => n.type === 'analysis');

  const resetAnimation = useCallback(() => {
    setCurrentAnalysisIndex(-1);
    setIsRunning(false);
    
    // Reset all nodes to their default state
    const resetNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: false,
        isCompleted: false,
        isFailed: false,
      }
    }));
    onNodesChange(resetNodes);

    // Reset all edges to dashed, muted state
    const resetEdges = edges.map(edge => ({
      ...edge,
      animated: false,
      style: {
        stroke: 'var(--text-muted)',
        strokeWidth: 2,
        strokeDasharray: '5 5',
        opacity: 0.5
      }
    }));
    onEdgesChange(resetEdges);

    // Clear any pending timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, [nodes, edges, onNodesChange, onEdgesChange]);

  const updateEdgeState = useCallback((edgeIndex: number, state: 'pending' | 'active' | 'completed' | 'failed') => {
    const updatedEdges = edges.map((edge, index) => {
      if (index !== edgeIndex) return edge;

      switch (state) {
        case 'pending':
          return {
            ...edge,
            animated: false,
            style: {
              stroke: 'var(--text-muted)',
              strokeWidth: 2,
              strokeDasharray: '5 5',
              opacity: 0.5
            }
          };
        case 'active':
          return {
            ...edge,
            animated: true,
            style: {
              stroke: 'var(--accent-primary)',
              strokeWidth: 2.5,
              strokeDasharray: '5 5',
              opacity: 1
            }
          };
        case 'completed':
          return {
            ...edge,
            animated: false,
            style: {
              stroke: 'var(--primary-alternate)',
              strokeWidth: 2,
              strokeDasharray: '0',
              opacity: 1
            }
          };
        case 'failed':
          return {
            ...edge,
            animated: false,
            style: {
              stroke: 'var(--error)',
              strokeWidth: 2,
              strokeDasharray: '0',
              opacity: 1
            }
          };
        default:
          return edge;
      }
    });
    onEdgesChange(updatedEdges);
  }, [edges, onEdgesChange]);

  const completeCurrentAnalysis = useCallback((nodeId: string, failed: boolean = false) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            isActive: false,
            isCompleted: !failed,
            isFailed: failed,
          }
        };
      }
      return node;
    });
    onNodesChange(updatedNodes);
    onAnalysisComplete?.(nodeId);
  }, [nodes, onNodesChange, onAnalysisComplete]);

  const activateAnalysis = useCallback((index: number) => {
    if (index >= analysisNodes.length) {
      // Animation complete
      setIsRunning(false);
      setCurrentAnalysisIndex(-1);
      onAnimationComplete?.();
      return;
    }

    const currentNode = analysisNodes[index];
    setCurrentAnalysisIndex(index);

    // Activate current node
    const updatedNodes = nodes.map(node => {
      if (node.id === currentNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            isActive: true,
            isCompleted: false,
            isFailed: false,
          }
        };
      }
      return node;
    });
    onNodesChange(updatedNodes);

    // Update edge states
    if (index > 0) {
      // Set previous edge to completed
      updateEdgeState(index - 1, 'completed');
    }
    if (index < edges.length) {
      // Set current edge to active (edge leading to next node)
      updateEdgeState(index, 'active');
    }

    // Simulate analysis duration (2-4 seconds)
    const duration = 2000 + Math.random() * 2000;
    
    // Randomly determine if analysis fails (10% chance)
    const willFail = Math.random() < 0.1;
    
    animationTimeoutRef.current = setTimeout(() => {
      // Complete current analysis
      completeCurrentAnalysis(currentNode.id, willFail);
      
      // Update edge state after completion
      if (index < edges.length) {
        updateEdgeState(index, willFail ? 'failed' : 'completed');
      }
      
      // If not failed, move to next analysis
      if (!willFail) {
        setTimeout(() => {
          activateAnalysis(index + 1);
        }, 300);
      } else {
        // Stop animation on failure
        setIsRunning(false);
        console.log(`Analysis failed at step ${index + 1}`);
      }
    }, duration);
  }, [analysisNodes, nodes, edges, onNodesChange, updateEdgeState, completeCurrentAnalysis]);

  const startAnimation = useCallback(() => {
    if (isRunning || analysisNodes.length === 0) return;
    
    resetAnimation();
    setIsRunning(true);
    
    // Start with a small delay
    setTimeout(() => {
      activateAnalysis(0);
    }, 300);
  }, [isRunning, analysisNodes.length, resetAnimation, activateAnalysis]);

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    
    // Clear timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    resetAnimation();
  }, [resetAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    isRunning,
    currentAnalysisIndex,
    startAnimation,
    stopAnimation,
    resetAnimation,
  };
};