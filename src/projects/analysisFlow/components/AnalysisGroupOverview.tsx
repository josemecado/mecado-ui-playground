// views/AnalysisGroupsOverview.tsx
import React, { useMemo, useEffect, useCallback, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { AnalysisGroup } from "../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { AnalysisGroupNode } from "../components/AnalysisGroupNode";
import { useTheme } from "../../../utilities/ThemeContext";


interface AnalysisGroupsOverviewProps {
  analysisGroups: AnalysisGroup[];
  onGroupSelect: (group: AnalysisGroup) => void;
  currentGroupId?: string | null;
  currentAnalysisId?: string | null;
}

const nodeTypes: NodeTypes = {
  analysisGroup: AnalysisGroupNode,
};

export const AnalysisGroupsOverview: React.FC<AnalysisGroupsOverviewProps> = ({
  analysisGroups,
  onGroupSelect,
}) => {
  // Generate nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const columns = 3;

    analysisGroups.forEach((group, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      nodes.push({
        id: group.id,
        type: "analysisGroup",
        position: {
          x: 100 + col * 400,
          y: 100 + row * 300,
        },
        data: { group },
        draggable: true,
      });

      // Create horizontal edges between groups in the same row
      if (col > 0) {
        const prevGroupId = analysisGroups[index - 1]?.id;
        if (prevGroupId) {
          edges.push({
            id: `${prevGroupId}-${group.id}`,
            source: prevGroupId,
            target: group.id,
            animated: group.status === "running",
            style: {
              stroke: getEdgeColor(group.status),
              strokeWidth: 2,
            },
            type: "smoothstep",
          });
        }
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [analysisGroups]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { theme } = useTheme();

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === "analysisGroup") {
        onGroupSelect(node.data.group);
      }
    },
    [onGroupSelect]
  );

  return (
    <OverviewContainer $theme={theme}>
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
            maxZoom: 1.0,
            minZoom: 0.5,
          }}
          minZoom={0.3}
          maxZoom={1.5}
          nodesDraggable={true}
          elementsSelectable={true}
          panOnDrag={true}
        >
          <StyledControls />

          <Background
            variant={BackgroundVariant.Dots}
            gap={60}
            size={1.5}
            color="var(--text-muted)"
          />

          <MiniMap
            nodeColor={(node) => {
              const group = node.data.group as AnalysisGroup;
              return getMiniMapColor(group.status);
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-bg)",
              borderRadius: "8px",
            }}
          />
        </ReactFlow>
      </FlowWrapper>
    </OverviewContainer>
  );
};

// Helper functions
const getEdgeColor = (status: string): string => {
  switch (status) {
    case "passed":
      return "#10b981";
    case "failed":
      return "var(--error)";
    case "running":
      return "var(--primary-alternate)";
    case "partial":
      return "var(--caution)";
    default:
      return "var(--border-outline)";
  }
};

const getMiniMapColor = (status: string): string => {
  switch (status) {
    case "passed":
      return "#10b981";
    case "failed":
      return "var(--error)";
    case "running":
      return "var(--primary-alternate)";
    case "partial":
      return "var(--caution)";
    default:
      return "var(--text-muted)";
  }
};

// Styled Components
const OverviewContainer = styled.div<{$theme: "dark" | "light"}>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;

  background: var(--bg-primary);
`;

const FlowWrapper = styled.div`
  flex: 1;
  position: relative;

  .react-flow__renderer {
    background: transparent;
  }

  .react-flow__node {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.02);
    }
  }

  .react-flow__attribution {
    display: none;
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

  .react-flow__minimap {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-bg);
  }

  .react-flow__edge-path {
    stroke-width: 2;
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
