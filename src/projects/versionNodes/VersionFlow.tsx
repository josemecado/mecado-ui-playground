// VersionFlowVisualization.tsx

import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { projectVersions, generateNodes, generateEdges, ProjectVersion } from "./mockData";
import { VersionNode } from "./VersionNode";

// Styled Components
const FlowContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  position: relative;
`;

const DetailsPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 380px;
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-bg);
  z-index: 1000;
  max-height: calc(100vh - 40px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-bg);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--hover-bg);
  }
`;

const DetailsPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-bg);
`;

const DetailsPanelTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--hover-primary);
  }
`;

const EquationBlock = styled.div`
  background: var(--bg-tertiary);
  padding: 10px 12px;
  border-radius: 4px;
  margin: 6px 0 8px 0;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  font-size: 12px;
  color: var(--text-primary);
  border: 1px solid var(--border-bg);
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
`;

const FileTag = styled.span<{ $type: string }>`
  background: ${props => {
    switch(props.$type) {
      case 'pdf': return 'rgba(239, 68, 68, 0.2)';
      case 'xlsx': return 'rgba(34, 197, 94, 0.2)';
      case 'docx': return 'rgba(59, 130, 246, 0.2)';
      case 'pptx': return 'rgba(251, 146, 60, 0.2)';
      default: return 'var(--bg-tertiary)';
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'pdf': return '#ef4444';
      case 'xlsx': return '#22c55e';
      case 'docx': return '#3b82f6';
      case 'pptx': return '#fb923c';
      default: return 'var(--text-muted)';
    }
  }};
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

// Main Component
const VersionFlowVisualization: React.FC = () => {
  const initialNodes = generateNodes(projectVersions);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges(initialNodes)
  );

  // Define node types
  const nodeTypes = {
    versionNode: VersionNode,
  };

  // Regenerate edges when nodes change (like in GeometryFlow)
  useEffect(() => {
    setEdges(generateEdges(nodes));
  }, [nodes, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        label: "Custom Flow",
        animated: true,
        style: {
          stroke: "var(--accent-neutral)",
          strokeWidth: 2,
        },
        labelStyle: {
          fill: "var(--text-primary)",
          fontWeight: 500,
          fontSize: 11,
        },
        labelBgStyle: {
          fill: "var(--bg-secondary)",
          stroke: "var(--border-bg)",
          strokeWidth: 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--accent-neutral)",
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  return (
    <FlowContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1}
          color="var(--border-bg)"
        />
        <Controls 
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bg)',
            borderRadius: '4px',
          }}
        />
        <MiniMap 
          nodeColor="var(--primary-action)"
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-bg)',
            borderRadius: '4px',
          }}
        />
      </ReactFlow>
    </FlowContainer>
  );
};

export default VersionFlowVisualization;