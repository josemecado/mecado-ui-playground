// views/AnalysisFlowView.tsx
import React, { useMemo, useEffect, useCallback } from "react";
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
import { AnalysisGroupNode } from "../components/AnalysisGroupNode";
import { AnalysisIndividualNode } from "../components/AnalysisNode";
import { useAnalysisAnimation } from "../hooks/useAnalysisAnimation";
import { RefreshCw, Maximize2, Minimize2, Play, Square } from "lucide-react";

interface AnalysisFlowViewProps {
  analysisGroups: AnalysisGroup[];
  activeTab: string | "all";
  onAnalysisClick?: (analysis: Analysis) => void;
  onGroupClick?: (group: AnalysisGroup) => void;
  onRefreshAnalyses?: () => void;
  onRunAnalyses?: () => void;
}

const nodeTypes: NodeTypes = {
  analysisGroup: AnalysisGroupNode,
  analysis: AnalysisIndividualNode,
};

export const AnalysisFlowView: React.FC<AnalysisFlowViewProps> = ({
  analysisGroups,
  activeTab,
  onAnalysisClick,
  onGroupClick,
  onRefreshAnalyses,
  onRunAnalyses,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Generate nodes and edges based on active tab
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (activeTab === "all") {
      // Display all groups in a grid layout
      const columns = 3;
      analysisGroups.forEach((group, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        nodes.push({
          id: group.id,
          type: 'analysisGroup',
          position: { 
            x: 100 + col * 350, 
            y: 100 + row * 250 
          },
          data: { group },
        });
      });
    } else {
      // Display selected group with its analyses in a horizontal pipeline
      const selectedGroup = analysisGroups.find(g => g.id === activeTab);
      if (selectedGroup) {
        // Add group node on the left
        nodes.push({
          id: selectedGroup.id,
          type: 'analysisGroup',
          position: { x: 50, y: 200 },
          data: { group: selectedGroup },
        });

        // Add analysis nodes in a horizontal line
        const analysisSpacing = 220;
        const startX = 400;
        
        selectedGroup.analyses.forEach((analysis, index) => {
          const nodeId = `${selectedGroup.id}-${analysis.id}`;
          
          nodes.push({
            id: nodeId,
            type: 'analysis',
            position: { 
              x: startX + (index * analysisSpacing),
              y: 200
            },
            data: { 
              ...analysis,
              isActive: false,
              isCompleted: false,
              isFailed: false
            },
          });

          // Create edges between analyses (horizontal flow)
          if (index === 0) {
            // Connect group to first analysis
            edges.push({
              id: `edge-${selectedGroup.id}-${nodeId}`,
              source: selectedGroup.id,
              target: nodeId,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: 'var(--border-outline)',
                strokeWidth: 1.5,
              },
            });
          } else {
            // Connect previous analysis to current analysis
            const prevNodeId = `${selectedGroup.id}-${selectedGroup.analyses[index - 1].id}`;
            edges.push({
              id: `edge-${prevNodeId}-${nodeId}`,
              source: prevNodeId,
              target: nodeId,
              type: 'smoothstep',
              animated: false,
              style: { 
                stroke: 'var(--border-outline)',
                strokeWidth: 1.5,
              },
            });
          }
        });
      }
    }

    return { nodes, edges };
  }, [analysisGroups, activeTab]);

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
  });

  // Update nodes when initial data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'analysisGroup' && onGroupClick) {
      onGroupClick(node.data.group);
    } else if (node.type === 'analysis' && onAnalysisClick) {
      onAnalysisClick(node.data.analysis || node.data);
    }
  }, [onGroupClick, onAnalysisClick]);

  const handleRunClick = useCallback(() => {
    if (isRunning) {
      stopAnimation();
    } else {
      startAnimation();
      onRunAnalyses?.();
    }
  }, [isRunning, startAnimation, stopAnimation, onRunAnalyses]);

  return (
    <FlowContainer $fullscreen={isFullscreen}>
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
          maxZoom: 1.5,
        }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <StyledControls>
          {activeTab !== "all" && (
            <>
              <ControlButton 
                onClick={handleRunClick} 
                title={isRunning ? "Stop analyses" : "Run analyses"}
                className={isRunning ? "running" : ""}
              >
                {isRunning ? <Square size={16} /> : <Play size={16} />}
              </ControlButton>
              <ControlButton onClick={resetAnimation} title="Reset animation">
                <RefreshCw size={16} />
              </ControlButton>
            </>
          )}
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
      
      {isRunning && activeTab !== "all" && (
        <AnimationOverlay>
          <AnimationStatus>
            <StatusIcon className="pulse" />
            <StatusText>
              Running Analysis {currentAnalysisIndex + 1} of {nodes.filter(n => n.type === 'analysis').length}
            </StatusText>
          </AnimationStatus>
        </AnimationOverlay>
      )}
    </FlowContainer>
  );
};

// Styled Components
const FlowContainer = styled.div<{ $fullscreen: boolean }>`
  flex: 1;
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
  
  .react-flow__renderer {
    background: transparent;
  }

  .react-flow__edge-path {
    stroke: var(--border-outline);
    stroke-width: 2;
    transition: all 0.3s ease;
  }

  .react-flow__edge.animated .react-flow__edge-path {
    stroke: var(--accent-primary);
    stroke-width: 3;
    filter: drop-shadow(0 0 4px rgba(var(--accent-primary-rgb), 0.5));
    stroke-dasharray: 5;
    animation: flowAnimation 0.5s linear infinite;
  }

  @keyframes flowAnimation {
    to {
      stroke-dashoffset: -10;
    }
  }

  .react-flow__node {
    font-family: inherit;
  }

  .react-flow__handle {
    background: var(--primary-alternate);
    border: 2px solid var(--bg-primary);
    width: 12px;
    height: 12px;
    transition: all 0.2s ease;
  }

  .react-flow__handle-connecting {
    background: var(--accent-primary);
    transform: scale(1.2);
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

    &.running {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
      animation: pulse 2s ease-in-out infinite;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .react-flow__controls-button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    margin: 4px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--primary-alternate);
    }

    svg {
      fill: currentColor;
    }
  }
`;

const AnimationOverlay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
`;

const AnimationStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(var(--accent-primary-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatusIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  
  &.pulse {
    animation: statusPulse 1s ease-in-out infinite;
  }
  
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

const StatusText = styled.div`
  color: white;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;