// views/AnalysisGroupsOverview.tsx
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { AnalysisGroup } from "../../versionNodes/utils/VersionInterfaces";
import { AnalysisGroupNode } from "../components/AnalysisGroupNode";
import { Maximize2, Minimize2 } from "lucide-react";

interface AnalysisGroupsOverviewProps {
  analysisGroups: AnalysisGroup[];
  onGroupSelect: (group: AnalysisGroup) => void;
}

const nodeTypes: NodeTypes = {
  analysisGroup: AnalysisGroupNode,
};

export const AnalysisGroupsOverview: React.FC<AnalysisGroupsOverviewProps> = ({
  analysisGroups,
  onGroupSelect,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Generate nodes for all groups in a grid layout
  const initialNodes = useMemo(() => {
    const nodes: Node[] = [];
    const columns = 3;
    
    analysisGroups.forEach((group, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      
      nodes.push({
        id: group.id,
        type: 'analysisGroup',
        position: { 
          x: 100 + col * 350, 
          y: 100 + row * 280 
        },
        data: { group },
      });
    });

    return nodes;
  }, [analysisGroups]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState([]);

  // Update nodes when data changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'analysisGroup') {
      onGroupSelect(node.data.group);
    }
  }, [onGroupSelect]);

  return (
    <OverviewContainer $fullscreen={isFullscreen}>
      <HeaderSection>
        <Title>Analysis Groups Overview</Title>
        <Subtitle>Select a group to view detailed analysis pipeline</Subtitle>
      </HeaderSection>
      
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
            padding: 0.2,
            maxZoom: 1.2,
          }}
          minZoom={0.4}
          maxZoom={1.5}
        >
          <Controls>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-outline)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </Controls>
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1.5}
            color="var(--border-bg)"
          />
        </ReactFlow>
      </FlowWrapper>
      
      <StatsBar>
        <StatItem>
          <StatValue>{analysisGroups.length}</StatValue>
          <StatLabel>Total Groups</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>
            {analysisGroups.filter(g => g.status === 'passed').length}
          </StatValue>
          <StatLabel>Passed</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>
            {analysisGroups.filter(g => g.status === 'running').length}
          </StatValue>
          <StatLabel>Running</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>
            {analysisGroups.filter(g => g.status === 'failed').length}
          </StatValue>
          <StatLabel>Failed</StatLabel>
        </StatItem>
      </StatsBar>
    </OverviewContainer>
  );
};

// Styled Components
const OverviewContainer = styled.div<{ $fullscreen: boolean }>`
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

const HeaderSection = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-bg);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.5px;
`;

const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--text-muted);
`;

const FlowWrapper = styled.div`
  flex: 1;
  position: relative;
  
  .react-flow__renderer {
    background: transparent;
  }
  
  .react-flow__node {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
  
  .react-flow__attribution {
    display: none;
  }
  
  .react-flow__controls {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-bg);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .react-flow__controls-button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    border-radius: 8px;
    width: 32px;
    height: 32px;
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

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-bg);
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StatLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;