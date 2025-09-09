// VersionFlowVisualization.tsx - Complete updated component

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
import {
  projectVersions,
  generateNodes,
  generateEdges,
  ProjectVersion,
} from "./mockData";
import { VersionNode } from "./VersionNode";
import { AddVersionModal } from "./AddVersionModal";
import { VersionMiniSelector } from "./VersionMiniSelector";

// Styled Components
const FlowContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: var(--bg-primary);
  position: relative;
`;

const AddVersionButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
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

const DetailSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailSectionTitle = styled.h3`
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px 0;
`;

const InfoList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const InfoItem = styled.li`
  color: var(--text-primary);
  font-size: 13px;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const EquationBlock = styled.div`
  background: var(--bg-tertiary);
  padding: 10px 12px;
  border-radius: 4px;
  margin: 6px 0 8px 0;
  font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
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
  background: ${(props) => {
    switch (props.$type) {
      case "pdf":
        return "rgba(239, 68, 68, 0.2)";
      case "xlsx":
        return "rgba(34, 197, 94, 0.2)";
      case "docx":
        return "rgba(59, 130, 246, 0.2)";
      case "pptx":
        return "rgba(251, 146, 60, 0.2)";
      default:
        return "var(--bg-tertiary)";
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case "pdf":
        return "#ef4444";
      case "xlsx":
        return "#22c55e";
      case "docx":
        return "#3b82f6";
      case "pptx":
        return "#fb923c";
      default:
        return "var(--text-muted)";
    }
  }};
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const MiniSelectorWrapper = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  max-width: 600px;
  width: auto;
`;

// Main Component
const VersionFlowVisualization: React.FC = () => {
  const initialNodes = generateNodes(projectVersions);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    generateEdges(initialNodes)
  );
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(
    null
  );
  const [activeVersionId, setActiveVersionId] = useState<string>(
    projectVersions[0]?.id || "v1"
  );

  const [showAddModal, setShowAddModal] = useState(false);

  // Define node types
  const nodeTypes = {
    versionNode: VersionNode,
  };

  // Regenerate edges when nodes change
  useEffect(() => {
    setEdges(generateEdges(nodes));
  }, [nodes, setEdges]);

  // Handle node clicks
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const versionData = node.data as ProjectVersion;
    setSelectedVersion(versionData);
    setActiveVersionId(versionData.id);
  }, []);

  // Handle version change from mini selector
  const handleVersionChangeFromSelector = (versionId: string) => {
    setActiveVersionId(versionId);
    // Optionally, also open the details panel for that version
    const version = nodes.find((n) => n.id === versionId)
      ?.data as ProjectVersion;
    if (version) {
      setSelectedVersion(version);
    }
  };

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

  // Handle adding new version
  const handleAddVersion = (newVersion: ProjectVersion) => {
    // Create new node
    const newNode: Node = {
      id: newVersion.id,
      type: "versionNode",
      position: {
        x: nodes.length * 350,
        y: 100,
      },
      data: newVersion,
    };

    // If there's a parent version and createConnection is true, update parent's edges
    if (newVersion.parentVersion) {
      const updatedNodes = nodes.map((node) => {
        if (node.id === newVersion.parentVersion) {
          const parentData = node.data as ProjectVersion;
          return {
            ...node,
            data: {
              ...parentData,
              edges: [
                ...(parentData.edges || []),
                {
                  targetId: newVersion.id,
                  label: newVersion.title.split(" - ")[1],
                  animated: true,
                },
              ],
            },
          };
        }
        return node;
      });
      setNodes([...updatedNodes, newNode]);
    } else {
      setNodes([...nodes, newNode]);
    }

    setShowAddModal(false);
  };

  return (
    <FlowContainer>
      <AddVersionButton onClick={() => setShowAddModal(true)}>
        + Add Version
      </AddVersionButton>

      <MiniSelectorWrapper>
        <VersionMiniSelector
          versions={nodes.map((n) => n.data as ProjectVersion)}
          activeVersionId={activeVersionId}
          onVersionChange={handleVersionChangeFromSelector}
          onNewVersion={() => setShowAddModal(true)}
          showPreviewOnHover={true}
        />
      </MiniSelectorWrapper>

      <AddVersionButton onClick={() => setShowAddModal(true)}>
        + Add Version
      </AddVersionButton>

      {showAddModal && (
        <AddVersionModal
          onSave={handleAddVersion}
          onCancel={() => setShowAddModal(false)}
          existingVersions={nodes.map((n) => n.data as ProjectVersion)}
        />
      )}

      {selectedVersion && (
        <DetailsPanel>
          <DetailsPanelHeader>
            <DetailsPanelTitle>{selectedVersion.title}</DetailsPanelTitle>
            <CloseButton onClick={() => setSelectedVersion(null)}>
              ×
            </CloseButton>
          </DetailsPanelHeader>

          {selectedVersion.parentVersion && (
            <DetailSection>
              <DetailSectionTitle>Parent Version</DetailSectionTitle>
              <InfoItem>{selectedVersion.parentVersion.toUpperCase()}</InfoItem>
            </DetailSection>
          )}

          <DetailSection>
            <DetailSectionTitle>
              Geometry Files ({selectedVersion.geometries.length})
            </DetailSectionTitle>
            <InfoList>
              {selectedVersion.geometries.length > 0 ? (
                selectedVersion.geometries.map((geo, idx) => (
                  <InfoItem key={idx}>
                    📐 {geo.name}
                    <span
                      style={{ color: "var(--text-muted)", marginLeft: "auto" }}
                    >
                      {geo.size}
                    </span>
                  </InfoItem>
                ))
              ) : (
                <InfoItem style={{ color: "var(--text-muted)" }}>
                  No geometry files
                </InfoItem>
              )}
            </InfoList>
          </DetailSection>

          <DetailSection>
            <DetailSectionTitle>
              Equations ({selectedVersion.equations.length})
            </DetailSectionTitle>
            {selectedVersion.equations.length > 0 ? (
              selectedVersion.equations.map((eq, idx) => (
                <div key={idx} style={{ marginBottom: "12px" }}>
                  <InfoItem style={{ fontWeight: 500 }}>{eq.name}</InfoItem>
                  <EquationBlock>{eq.latex}</EquationBlock>
                </div>
              ))
            ) : (
              <InfoItem style={{ color: "var(--text-muted)" }}>
                No equations
              </InfoItem>
            )}
          </DetailSection>

          <DetailSection>
            <DetailSectionTitle>
              Associated Files ({selectedVersion.files.length})
            </DetailSectionTitle>
            <InfoList>
              {selectedVersion.files.length > 0 ? (
                selectedVersion.files.map((file, idx) => (
                  <FileItem key={idx}>
                    <InfoItem style={{ flex: 1 }}>📄 {file.name}</InfoItem>
                    <FileTag $type={file.type}>{file.type}</FileTag>
                  </FileItem>
                ))
              ) : (
                <InfoItem style={{ color: "var(--text-muted)" }}>
                  No associated files
                </InfoItem>
              )}
            </InfoList>
          </DetailSection>

          <DetailSection>
            <InfoItem style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              📅 Created on {selectedVersion.createdAt}
            </InfoItem>
          </DetailSection>
        </DetailsPanel>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background variant="dots" gap={20} size={1} color="var(--border-bg)" />
        <Controls
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-bg)",
            borderRadius: "4px",
          }}
        />
        <MiniMap
          nodeColor="var(--primary-action)"
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-bg)",
            borderRadius: "4px",
          }}
        />
      </ReactFlow>
    </FlowContainer>
  );
};

export default VersionFlowVisualization;
