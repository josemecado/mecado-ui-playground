// VersionFlowPreview.tsx
import React, { useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { ProjectVersion } from "./mockData";
import { VersionBubbleNode } from "./VersionBubbleNode";

interface VersionFlowPreviewProps {
  versions: ProjectVersion[];
  onNodeClick?: (version: ProjectVersion) => void;
  onVersionChange?: (versionId: string) => void;
  height?: string;
  activeVersionId?: string;
}

// Tree layout generator
const generateTreeLayout = (versions: ProjectVersion[]): Node[] => {
  const verticalSpacing = 100;
  const horizontalSpacing = 80;
  
  // Build a map for quick lookup
  const versionMap = new Map<string, ProjectVersion>();
  versions.forEach(v => versionMap.set(v.id, v));
  
  // Group versions by their parent
  const childrenByParent = new Map<string | null, ProjectVersion[]>();
  versions.forEach(v => {
    const parentKey = v.parentVersion;
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey)!.push(v);
  });
  
  // Calculate depth for each node
  const depths = new Map<string, number>();
  const calculateDepth = (id: string): number => {
    if (depths.has(id)) return depths.get(id)!;
    
    const version = versionMap.get(id);
    if (!version || !version.parentVersion) {
      depths.set(id, 0);
      return 0;
    }
    
    const depth = calculateDepth(version.parentVersion) + 1;
    depths.set(id, depth);
    return depth;
  };
  
  versions.forEach(v => calculateDepth(v.id));
  
  // Group versions by depth
  const versionsByDepth = new Map<number, ProjectVersion[]>();
  versions.forEach(v => {
    const depth = depths.get(v.id) || 0;
    if (!versionsByDepth.has(depth)) {
      versionsByDepth.set(depth, []);
    }
    versionsByDepth.get(depth)!.push(v);
  });
  
  // Create nodes with positions
  const nodes: Node[] = [];
  
  versionsByDepth.forEach((versionsAtDepth, depth) => {
    // Calculate total width needed for this level
    const totalWidth = (versionsAtDepth.length - 1) * horizontalSpacing;
    const startX = -totalWidth / 2;
    
    versionsAtDepth.forEach((version, index) => {
      nodes.push({
        id: version.id,
        type: "versionBubble",
        position: {
          x: startX + index * horizontalSpacing,
          y: depth * verticalSpacing,
        },
        data: version,
      });
    });
  });
  
  return nodes;
};

// Build edges with proper styling for parent-child and siblings
const generateTreeEdges = (
  versions: ProjectVersion[],
  nodes: Node[]
): Edge[] => {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges: Edge[] = [];
  const seen = new Set<string>();
  
  // Build maps for quick lookup
  const versionMap = new Map<string, ProjectVersion>();
  versions.forEach(v => versionMap.set(v.id, v));
  
  // Group versions by parent for sibling detection
  const siblingGroups = new Map<string | null, string[]>();
  versions.forEach(v => {
    const parent = v.parentVersion;
    if (!siblingGroups.has(parent)) {
      siblingGroups.set(parent, []);
    }
    siblingGroups.get(parent)!.push(v.id);
  });
  
  // Create parent-child edges (animated)
  versions.forEach((v) => {
    if (v.parentVersion && nodeIds.has(v.parentVersion) && nodeIds.has(v.id)) {
      const id = `parent-${v.parentVersion}-${v.id}`;
      if (!seen.has(id)) {
        edges.push({
          id,
          source: v.parentVersion,
          target: v.id,
          animated: true, // Animated for parent-child
          style: {
            stroke: "var(--primary-action)",
            strokeWidth: 2,
            opacity: 0.7,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--primary-action)",
            width: 15,
            height: 15,
          },
        });
        seen.add(id);
      }
    }
  });
  
  // Create sibling edges (non-animated)
  siblingGroups.forEach((siblings) => {
    if (siblings.length > 1) {
      // Sort siblings by their x position for proper left-to-right connection
      const sortedSiblings = siblings.sort((a, b) => {
        const nodeA = nodes.find(n => n.id === a);
        const nodeB = nodes.find(n => n.id === b);
        return (nodeA?.position.x || 0) - (nodeB?.position.x || 0);
      });
      
      // Connect siblings horizontally
      for (let i = 0; i < sortedSiblings.length - 1; i++) {
        const source = sortedSiblings[i];
        const target = sortedSiblings[i + 1];
        
        if (nodeIds.has(source) && nodeIds.has(target)) {
          const id = `sibling-${source}-${target}`;
          if (!seen.has(id)) {
            edges.push({
              id,
              source,
              target,
              sourceHandle: "right", // Connect from left sibling's right
              targetHandle: "left",  // To right sibling's left
              animated: false, // Non-animated for siblings
              style: {
                stroke: "var(--accent-neutral)",
                strokeWidth: 1,
                opacity: 0.3,
                strokeDasharray: "3 3",
              },
              markerEnd: undefined, // No arrows for sibling connections
            });
            seen.add(id);
          }
        }
      }
    }
  });
  
  // Add any explicit custom edges
  versions.forEach((v) => {
    v.edges?.forEach((e) => {
      if (nodeIds.has(v.id) && nodeIds.has(e.targetId)) {
        const id = `custom-${v.id}-${e.targetId}`;
        if (!seen.has(id)) {
          edges.push({
            id,
            source: v.id,
            target: e.targetId,
            animated: e.animated ?? false,
            label: e.label,
            style: {
              stroke: "var(--accent-neutral)",
              strokeWidth: 1.5,
              opacity: 0.5,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "var(--accent-neutral)",
              width: 12,
              height: 12,
            },
          });
          seen.add(id);
        }
      }
    });
  });
  
  return edges;
};

// Styled Components
const PreviewContainer = styled.div<{ $height?: string }>`
  width: 100%;
  height: ${(p) => p.$height || "300px"};
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-bg);
  overflow: hidden;
  position: relative;
`;

const PreviewHeader = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-bg);
`;

const PreviewTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const VersionFlowPreview: React.FC<VersionFlowPreviewProps> = ({
  versions,
  onNodeClick,
  onVersionChange,
  height = "300px",
  activeVersionId,
}) => {
  const [rf, setRf] = React.useState<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    generateTreeLayout(versions)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = { versionBubble: VersionBubbleNode };

  // Recompute nodes & edges whenever versions change
  useEffect(() => {
    const newNodes = generateTreeLayout(versions);
    setNodes(newNodes);
    setEdges(generateTreeEdges(versions, newNodes));
  }, [versions, setNodes, setEdges]);

  // Keep edges in sync when node positions/layout change
  useEffect(() => {
    setEdges(generateTreeEdges(versions, nodes));
  }, [nodes, versions, setEdges]);

  useEffect(() => {
    if (!activeVersionId || !rf) return;
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: n.id === activeVersionId }))
    );
    // Center on the active node
    rf.fitView({
      nodes: [{ id: activeVersionId }] as any,
      padding: 0.2,
      duration: 300,
      minZoom: 0.5,
      maxZoom: 1.2,
    });
  }, [activeVersionId, rf, setNodes]);

  const handleNodeClick = (_e: React.MouseEvent, node: Node) => {
    const version = node.data as ProjectVersion;

    // Select in canvas
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));

    // Notify parent
    if (onVersionChange) onVersionChange(version.id);

    // Optional extra callback
    if (onNodeClick) onNodeClick(version);
  };

  return (
    <PreviewContainer $height={height}>
      <PreviewHeader>
        <PreviewTitle>Version Tree</PreviewTitle>
      </PreviewHeader>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false} // Disable dragging to maintain tree structure
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        panOnDrag
        preventScrolling
        proOptions={{ hideAttribution: true }}
        onInit={setRf}
      >
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="var(--border-bg)"
          style={{ opacity: 0.3 }}
        />
        <MiniMap
          zoomable
          pannable
          style={{
            width: 80,
            height: 60,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-bg)",
            borderRadius: 4,
          }}
          nodeColor={(n) =>
            n.selected ? "var(--primary-action)" : "var(--accent-neutral)"
          }
          nodeStrokeColor={() => "var(--border-bg)"}
          nodeBorderRadius={12}
          maskColor="rgba(0,0,0,0.05)"
        />
      </ReactFlow>
    </PreviewContainer>
  );
};