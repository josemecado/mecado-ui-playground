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
import { GeoNode, GeoNodeData } from "./GeoNode";
import { mockNodes } from "./mockData/mockNodeData";
import { EditNodeModal } from "./EditNodeModal";

const nodeTypes = {
  geoNode: GeoNode,
};

const AddNodeButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  padding: 10px 16px;
  background: var(--primary-action);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

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
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges(mockNodes)
  );
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    nodeId?: string;
    nodeData?: GeoNodeData;
  }>({ isOpen: false });

  useEffect(() => {
    setEdges(generateEdges(nodes));
  }, [nodes, setEdges]);

  // Listen for edit node events
  useEffect(() => {
    const handleEditNode = (event: CustomEvent) => {
      const { nodeId, data } = event.detail;
      setModalState({
        isOpen: true,
        nodeId,
        nodeData: data,
      });
    };

    window.addEventListener("editNode", handleEditNode as EventListener);
    return () => {
      window.removeEventListener("editNode", handleEditNode as EventListener);
    };
  }, []);

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

  const handleAddNode = () => {
    setModalState({ isOpen: true });
  };

  const handleSaveNode = (data: GeoNodeData) => {
    if (modalState.nodeId) {
      // Update existing node
      setNodes((nds) =>
        nds.map((node) =>
          node.id === modalState.nodeId ? { ...node, data } : node
        )
      );
    } else {
      // Create new node
      const newNode: Node<GeoNodeData> = {
        id: `node-${Date.now()}`,
        type: "geoNode",
        position: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100,
        },
        data,
      };
      setNodes((nds) => [...nds, newNode]);
    }
    setModalState({ isOpen: false });
  };

  const handleCancelModal = () => {
    setModalState({ isOpen: false });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <AddNodeButton onClick={handleAddNode}>+ Add Node</AddNodeButton>

      {modalState.isOpen && (
        <EditNodeModal
          nodeData={modalState.nodeData}
          onSave={handleSaveNode}
          onCancel={handleCancelModal}
        />
      )}

      {/* <EditNodeModal
        nodeData={modalState.nodeData}
        onSave={handleSaveNode}
        onCancel={handleCancelModal}
      /> */}

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
        <Background gap={35} size={2} color="var(--border-bg)" />
      </ReactFlow>
    </div>
  );
};
