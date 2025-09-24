// MiniVersionNode.tsx
import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import styled from "styled-components";
import { ProjectVersion } from "../utils/VersionInterfaces";

// Styled Components
const BubbleContainer = styled.div<{
  $selected?: boolean;
  $isArchived?: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(p) =>
    p.$isArchived
      ? "var(--bg-secondary)"
      : p.$selected
      ? "var(--primary-alternate)"
      : "var(--bg-secondary)"};
  color: ${(p) =>
    p.$isArchived
      ? "var(--text-muted)"
      : p.$selected
      ? "var(--text-inverted)"
      : "var(--text-primary)"};
  border: 1px ${(p) => (p.$isArchived ? "dashed" : "solid")}
    ${(p) =>
      p.$isArchived
        ? "var(--text-muted)"
        : p.$selected
        ? "var(--primary-action)"
        : "var(--border-outline)"};
  opacity: ${(p) => (p.$isArchived ? 0.6 : 1)};
  filter: ${(p) => (p.$isArchived ? "grayscale(0.5)" : "none")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${(props) =>
      props.$selected
        ? "var(--primary-alternate)"
        : props.$isArchived
        ? "var(--hover-bg)"
        : "var(--hover-bg)"};
  }
`;

// const BubbleContainer = styled.div<{ $selected?: boolean }>`
//   width: 35px;
//   height: 35px;
//   border-radius: 50%;
//   background: ${(props) =>
//     props.$selected ? "var(--primary-alternate)" : "var(--bg-secondary)"};
//   color: ${(props) => (props.$selected ? "var(--text-inverted)" : "var(--text-muted)")};
//   border: 1px solid
//     ${(props) =>
//       props.$selected ? "var(--primary-action)" : "var(--border-bg)"};
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   transition: all 0.2s ease;
//   position: relative;

//   &:hover {
//     transform: scale(1.05);
//     border-color: var(--primary-alternate);
//     background: ${props => props.$selected ? "var(--primary-alternate)" : "var(--hover-bg)"};;
//   }
// `;

const NodeContainer = styled.div<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const VersionLabel = styled.p<{ $isArchived?: boolean }>`
  font-size: ${(props) => (props.$isArchived ? "13px" : "15px")};
  font-weight: 600;
  margin: ${(props) => (props.$isArchived ? "0 0 0px 0" : "0")};
`;

const VersionLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* align-items: center;
  justify-content: center; */
  align-items: center;
  justify-content: center;
  /* height: 100%; */
  gap: 2px;
`;

const ArchiveIcon = ({ size = 10 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="21 8 21 21 3 21 3 8"></polyline>
    <rect x="1" y="3" width="22" height="5"></rect>
    <line x1="10" y1="12" x2="14" y2="12"></line>
  </svg>
);

// Version Bubble Node Component with dynamic handles
export const MiniVersionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const versionData = data as ProjectVersion;

  return (
    <NodeContainer $selected={selected}>
      <BubbleContainer
        $selected={selected}
        $isArchived={versionData.isArchived}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{ width: 4, height: 4 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{ width: 4, height: 4 }}
        />
        <VersionLabelContainer>
          <VersionLabel $isArchived={versionData.isArchived}>
            {versionData.id}
          </VersionLabel>
          {versionData.isArchived && <ArchiveIcon />}
        </VersionLabelContainer>
      </BubbleContainer>
    </NodeContainer>
  );
};
