import React, { useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled from "styled-components";
import { ProjectVersion } from "./mockData";

// ============= INTERFACES =============

// ============= STYLED COMPONENTS =============
const NodeContainer = styled.div<{ selected: boolean }>`
  position: relative;
  border: 2px solid
    ${(props) =>
      props.selected ? "var(--primary-action)" : "var(--border-bg)"};
  border-radius: 12px;
  width: 400px;
  min-height: 100px;
  max-height: 300px;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s ease;
  background: var(--bg-secondary);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

const NodeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  background: var(--bg-tertiary);
  gap: 4px;
  padding: 4px 10px;

  border-bottom: 1px solid var(--border-bg);
`;

const NodeTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const NodeSubtitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  width: 100%;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoIcon = styled.span`
  color: var(--primary-action);
  font-size: 16px;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoLabel = styled.span`
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 80px;
`;

const InfoValue = styled.span`
  color: var(--text-primary);
  font-size: 13px;
  flex: 1;
`;

const InfoBadge = styled.span`
  background: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin-left: auto;
`;

const FileList = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
`;

const FileChip = styled.span<{ $type: string }>`
  background: ${(props) => {
    switch (props.$type) {
      case "pdf":
        return "rgba(239, 68, 68, 0.1)";
      case "xlsx":
        return "rgba(34, 197, 94, 0.1)";
      case "docx":
        return "rgba(59, 130, 246, 0.1)";
      case "pptx":
        return "rgba(251, 146, 60, 0.1)";
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
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

// Version Node Component
export const VersionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const versionData = data as ProjectVersion;

  return (
    <NodeContainer selected={selected}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "var(--accent-primary)",
          width: 8,
          height: 8,
        }}
      />

      <NodeHeader className="node-header-drag">
        <NodeTitle>{versionData.id.toUpperCase()}</NodeTitle>
        <NodeSubtitle>{versionData.title.split(" - ")[1]}</NodeSubtitle>
      </NodeHeader>

      <ContentContainer>
        <ContentGrid>
          {/* Geometries Row */}
          <InfoRow>
            <InfoIcon>📐</InfoIcon>
            <InfoLabel>Geometries</InfoLabel>
            <InfoValue>
              {versionData.geometries[0]?.name || "No geometries"}
            </InfoValue>
            <InfoBadge>{versionData.geometries.length}</InfoBadge>
          </InfoRow>

          {/* Equations Row */}
          <InfoRow>
            <InfoIcon>∑</InfoIcon>
            <InfoLabel>Equations</InfoLabel>
            <InfoValue>
              {versionData.equations[0]?.name || "No equations"}
              {versionData.equations.length > 1 &&
                ` +${versionData.equations.length - 1} more`}
            </InfoValue>
            <InfoBadge>{versionData.equations.length}</InfoBadge>
          </InfoRow>

          {/* Files Row */}
          <InfoRow>
            <InfoIcon>📄</InfoIcon>
            <InfoLabel>Files</InfoLabel>
            <FileList>
              {versionData.files.map((file, idx) => (
                <FileChip key={idx} $type={file.type}>
                  {file.type}
                </FileChip>
              ))}
            </FileList>
            <InfoBadge>{versionData.files.length}</InfoBadge>
          </InfoRow>

          {/* Date Row */}
          <InfoRow>
            <InfoIcon>📅</InfoIcon>
            <InfoLabel>Created</InfoLabel>
            <InfoValue>{versionData.createdAt}</InfoValue>
          </InfoRow>

          {/* Parent Version Row (if exists) */}
          {versionData.parentVersion && (
            <InfoRow>
              <InfoIcon>⬆</InfoIcon>
              <InfoLabel>Parent</InfoLabel>
              <InfoValue>{versionData.parentVersion.toUpperCase()}</InfoValue>
            </InfoRow>
          )}
        </ContentGrid>
      </ContentContainer>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "var(--accent-primary)",
          width: 8,
          height: 8,
        }}
      />
    </NodeContainer>
  );
};
