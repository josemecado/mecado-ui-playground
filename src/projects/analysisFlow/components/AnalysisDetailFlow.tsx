// views/AnalysisDetailFlow.tsx
import React, { useMemo, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ControlButton,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { AnalysisGroup, Analysis } from "../../versionNodes/utils/VersionInterfaces";
import { AnalysisIndividualNode } from "./AnalysisNode";
import { useAnalysisAnimation } from "../hooks/useAnalysisAnimation";
import { AnalysisDetailsFooter } from "./AnalysisFooter";
import { RequirementsModal } from "./requirements/RequirementsModal";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";

interface AnalysisDetailFlowProps {
  analysisGroup: AnalysisGroup;
  onAnalysisClick?: (analysis: Analysis) => void;
  onAnimationComplete?: () => void;
}

export interface AnalysisDetailFlowRef {
  startAnimation: () => void;
  stopAnimation: () => void;
}

const nodeTypes: NodeTypes = {
  analysis: AnalysisIndividualNode,
};

export const AnalysisDetailFlow = forwardRef<AnalysisDetailFlowRef, AnalysisDetailFlowProps>(
  ({ analysisGroup, onAnalysisClick, onAnimationComplete }, ref) => {
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = React.useState<Analysis | null>(null);

    // Generate nodes and edges for the analysis pipeline (without group node)
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Add only analysis nodes in a horizontal pipeline
      const analysisSpacing = 300;
      const startX = 200;
      const centerY = 250;
      
      analysisGroup.analyses.forEach((analysis, index) => {
        const nodeId = `${analysisGroup.id}-${analysis.id}`;
        
        nodes.push({
          id: nodeId,
          type: 'analysis',
          position: { 
            x: startX + (index * analysisSpacing),
            y: centerY
          },
          data: { 
            ...analysis,
            isActive: false,
            isCompleted: false,
            isFailed: false
          },
        });

        // Create edges between sequential analyses
        if (index > 0) {
          const prevNodeId = `${analysisGroup.id}-${analysisGroup.analyses[index - 1].id}`;
          edges.push({
            id: `edge-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            type: 'smoothstep',
            animated: false,
            style: { 
              stroke: 'var(--text-muted)',
              strokeWidth: 2,
              strokeDasharray: '5 5',
              opacity: 0.5
            },
          });
        }
      });

      return { nodes, edges };
    }, [analysisGroup]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Animation hook
    const {
      isRunning,
      currentAnalysisIndex,
      startAnimation,
      stopAnimation,
      resetAnimation,
    } = useAnalysisAnimation({
      nodes,
      edges,
      onNodesChange: setNodes,
      onEdgesChange: setEdges,
      onAnalysisComplete: (analysisId) => {
        console.log(`Analysis ${analysisId} completed`);
      },
      onAnimationComplete: () => {
        console.log("Animation completed");
        onAnimationComplete?.();
      },
    });

    // Expose animation controls to parent via ref
    useImperativeHandle(ref, () => ({
      startAnimation,
      stopAnimation,
    }), [startAnimation, stopAnimation]);

    // Update nodes when data changes
    useEffect(() => {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      if (node.type === 'analysis') {
        const analysisData = node.data.analysis || node.data;
        setSelectedAnalysis(analysisData);
        onAnalysisClick?.(analysisData);
      }
    }, [onAnalysisClick]);

    const analysisNodes = nodes.filter(n => n.type === 'analysis');

    return (
      <DetailContainer $fullscreen={isFullscreen}>
        <FlowWrapper>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ 
              padding: 0.3,
              maxZoom: 1.2,
            }}
            minZoom={0.4}
            maxZoom={2}
          >
            <StyledControls>
              <ControlButton onClick={resetAnimation} title="Reset pipeline">
                <RefreshCw size={16} />
              </ControlButton>
              <ControlButton 
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </ControlButton>
            </StyledControls>
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1.5}
              color="var(--border-bg)"
            />
          </ReactFlow>
        </FlowWrapper>
        
        {isRunning && (
          <StatusOverlay>
            <StatusCard>
              <StatusPulse />
              <StatusContent>
                <StatusTitle>Analyzing {analysisGroup.name}</StatusTitle>
                <StatusProgress>
                  Step {currentAnalysisIndex + 1} of {analysisNodes.length}
                </StatusProgress>
                <ProgressBar>
                  <ProgressFill 
                    $percentage={((currentAnalysisIndex + 1) / analysisNodes.length) * 100} 
                  />
                </ProgressBar>
                <CurrentAnalysis>
                  {currentAnalysisIndex >= 0 && currentAnalysisIndex < analysisNodes.length && (
                    <>Current: {analysisNodes[currentAnalysisIndex].data.name}</>
                  )}
                </CurrentAnalysis>
              </StatusContent>
            </StatusCard>
          </StatusOverlay>
        )}

        {analysisGroup.requirements && analysisGroup.requirements.length > 0 && (
          <RequirementsModal
            requirements={analysisGroup.requirements}
            groupName={analysisGroup.name}
          />
        )}

        {selectedAnalysis && (
          <AnalysisDetailsFooter
            analysis={selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
          />
        )}
      </DetailContainer>
    );
  }
);

AnalysisDetailFlow.displayName = 'AnalysisDetailFlow';

// Styled Components
const DetailContainer = styled.div<{ $fullscreen: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: ${props => props.$fullscreen ? 'fixed' : 'relative'};
  ${props => props.$fullscreen && `
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  `}
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
`;

const FlowWrapper = styled.div`
  flex: 1;
  position: relative;
  
  .react-flow__renderer {
    background: transparent;
  }

  .react-flow__edge-path {
    transition: all 0.3s ease;
  }

  .react-flow__edge.animated .react-flow__edge-path {
    stroke: var(--accent-primary) !important;
    stroke-width: 2.5 !important;
    stroke-dasharray: 5 5 !important;
    opacity: 1 !important;
    filter: drop-shadow(0 0 4px rgba(var(--accent-primary-rgb), 0.4));
    animation: dashFlow 0.5s linear infinite;
  }

  @keyframes dashFlow {
    to {
      stroke-dashoffset: -10;
    }
  }

  .react-flow__attribution {
    display: none;
  }
`;

const StyledControls = styled(Controls)`
  button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 4px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--primary-alternate);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .react-flow__controls-button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    border-radius: 8px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--primary-alternate);
    }

    svg {
      fill: currentColor;
    }
  }
`;

const StatusOverlay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
`;

const StatusCard = styled.div`
  position: relative;
  padding: 16px 20px;
  background: linear-gradient(135deg, 
    rgba(var(--accent-primary-rgb), 0.95) 0%, 
    rgba(var(--accent-secondary-rgb), 0.95) 100%
  );
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 240px;
`;

const StatusPulse = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  animation: statusPulse 1.5s ease-in-out infinite;
  
  @keyframes statusPulse {
    0%, 100% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.5);
      opacity: 0.5;
    }
  }
`;

const StatusContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatusTitle = styled.div`
  color: white;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
`;

const StatusProgress = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 500;
`;

const CurrentAnalysis = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 10px;
  font-weight: 500;
  margin-top: 2px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProgressBar = styled.div`
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: white;
  border-radius: 2px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;