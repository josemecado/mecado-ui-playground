import React, { useCallback, useEffect } from "react";
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
import { GeoNode, GeoNodeData } from "./GeoNode";
import { mockNodes } from "./mockNodeData";

const nodeTypes = {
  geoNode: GeoNode,
};

// Generate edges from node data
const generateEdges = (nodes: Node<GeoNodeData>[]): Edge[] => {
  const edges: Edge[] = [];
  
  nodes.forEach((node) => {
    const nodeData = node.data as GeoNodeData;
    if (nodeData.edges) {
      nodeData.edges.forEach((edgeConfig) => {
        edges.push({
          id: `${node.id}-${edgeConfig.targetId}`,
          source: node.id,
          target: edgeConfig.targetId,
          animated: edgeConfig.animated ?? false,
          label: edgeConfig.label,
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
          style: {
            stroke: "var(--accent-neutral)",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "var(--accent-neutral)",
            width: 20,
            height: 20,
          },
        });
      });
    }
  });
  
  return edges;
};

export const GeometryFlow: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(mockNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges(mockNodes));

  // Update edges when nodes change
  useEffect(() => {
    setEdges(generateEdges(nodes));
  }, [nodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        label: "Data Flow",
        animated: true,
        style: {
          stroke: "var(--accent-neutral)",
          strokeWidth: 2,
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
    <div style={{ width: "100vw", height: "100vh", background: "var(--bg-primary)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={35} size={2} color="var(--border-bg)" />
      </ReactFlow>
    </div>
  );
};