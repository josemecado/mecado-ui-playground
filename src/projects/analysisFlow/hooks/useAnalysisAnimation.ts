// hooks/useAnalysisAnimation.tsx
import { useState, useCallback, useEffect, useRef } from "react";
import { Node, Edge } from "@xyflow/react";
import { Analysis } from "../../versionNodes/utils/VersionInterfaces";

interface UseAnalysisAnimationProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onAnalysisComplete?: (analysisId: string) => void;
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
}: UseAnalysisAnimationProps): UseAnalysisAnimationReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(-1);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const edgeAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter to get only analysis nodes (not group nodes)
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

    // Reset all edges
    const resetEdges = edges.map(edge => ({
      ...edge,
      animated: false,
      style: {
        ...edge.style,
        stroke: 'var(--border-outline)',
        strokeWidth: 1.5,
      }
    }));
    onEdgesChange(resetEdges);

    // Clear any pending timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (edgeAnimationTimeoutRef.current) {
      clearTimeout(edgeAnimationTimeoutRef.current);
    }
  }, [nodes, edges, onNodesChange, onEdgesChange]);

  const animateEdgeToNext = useCallback((fromNodeId: string, toNodeId: string) => {
    const updatedEdges = edges.map(edge => {
      // Find the edge connecting these two nodes
      const isTargetEdge = 
        (edge.source === fromNodeId && edge.target === toNodeId) ||
        (edge.target === toNodeId && edge.source.includes(fromNodeId.split('-')[0]));
      
      return {
        ...edge,
        animated: isTargetEdge,
        style: {
          ...edge.style,
          stroke: isTargetEdge ? 'var(--accent-primary)' : edge.style?.stroke || 'var(--border-outline)',
          strokeWidth: isTargetEdge ? 2.5 : 1.5,
        }
      };
    });
    onEdgesChange(updatedEdges);
  }, [edges, onEdgesChange]);

  const completeCurrentAnalysis = useCallback((nodeId: string) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            isActive: false,
            isCompleted: true,
            isFailed: false,
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
      
      // Stop edge animations
      const finalEdges = edges.map(edge => ({
        ...edge,
        animated: false,
        style: {
          ...edge.style,
          stroke: 'var(--success)',
          strokeWidth: 1.5,
        }
      }));
      onEdgesChange(finalEdges);
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

    // Animate edge from previous node if exists
    if (index > 0) {
      const prevNode = analysisNodes[index - 1];
      animateEdgeToNext(prevNode.id, currentNode.id);
    }

    // Simulate analysis duration (2-4 seconds)
    const duration = 2000 + Math.random() * 2000;
    
    animationTimeoutRef.current = setTimeout(() => {
      // Complete current analysis
      completeCurrentAnalysis(currentNode.id);
      
      // Move to next analysis after a short delay
      edgeAnimationTimeoutRef.current = setTimeout(() => {
        activateAnalysis(index + 1);
      }, 500);
    }, duration);
  }, [analysisNodes, nodes, edges, onNodesChange, animateEdgeToNext, completeCurrentAnalysis, onEdgesChange]);

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
    if (edgeAnimationTimeoutRef.current) {
      clearTimeout(edgeAnimationTimeoutRef.current);
    }
    
    resetAnimation();
  }, [resetAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (edgeAnimationTimeoutRef.current) {
        clearTimeout(edgeAnimationTimeoutRef.current);
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