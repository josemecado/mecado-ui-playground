// VersionBubbleNode.tsx
import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import styled from "styled-components";
import { ProjectVersion } from "./mockData";

// Styled Components
const BubbleContainer = styled.div<{ $selected?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$selected ? "var(--primary-action)" : "var(--bg-secondary)"};
  color: ${props => props.$selected ? "white" : "var(--text-muted)"};
  border: 2px solid
    ${(props) =>
      props.$selected ? "var(--primary-action)" : "var(--border-bg)"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.05);
    border-color: var(--primary-action);
    background: ${props => props.$selected ? "var(--primary-action)" : "var(--hover-bg)"};
  }
`;

const NodeContainer = styled.div<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const VersionId = styled.div`
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
`;

const VersionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
  max-width: 70px;
`;

// Version Bubble Node Component with dynamic handles
export const VersionBubbleNode: React.FC<NodeProps> = ({ data, selected }) => {
  const versionData = data as ProjectVersion;
  const label = versionData.title.split(" - ")[1] || versionData.title;

  return (
    <NodeContainer $selected={selected}>
      <VersionLabel title={label}>{label}</VersionLabel>

      <BubbleContainer $selected={selected}>
        {/* Top handle for parent connections */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            background: "transparent",
            border: "none",
            width: 8,
            height: 8,
            top: -4,
          }}
        />
        
        {/* Bottom handle for child connections */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            background: "transparent",
            border: "none",
            width: 8,
            height: 8,
            bottom: -4,
          }}
        />
        
        {/* Left handle for sibling connections */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{
            background: "transparent",
            border: "none",
            width: 8,
            height: 8,
            left: -4,
          }}
        />
        
        {/* Right handle for sibling connections */}
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          style={{
            background: "transparent",
            border: "none",
            width: 8,
            height: 8,
            right: -4,
          }}
        />
        
        <VersionId>{versionData.id}</VersionId>
      </BubbleContainer>
    </NodeContainer>
  );
};