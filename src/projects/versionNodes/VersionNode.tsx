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
  width: 600px;
  min-height: 350px;
    max-height: 500px;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s ease;
  background: var(--bg-secondary);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

const NodeHeader = styled.div`
  padding: 10px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NodeTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;


// Version Node Component
export const VersionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const versionData = data as ProjectVersion;
  
  return (
    // <NodeContainer $selected={selected}>
    //   <Handle
    //     type="target"
    //     position={Position.Top}
    //     style={{
    //       background: "var(--primary-action)",
    //       width: 8,
    //       height: 8,
    //     }}
    //   />
      
    //   <VersionHeader>
    //     <VersionTitle>{versionData.id.toUpperCase()}</VersionTitle>
    //     <VersionBadge>{versionData.title.split(' - ')[1]}</VersionBadge>
    //   </VersionHeader>
      
    //   <InfoSection>
    //     <SectionHeader>
    //       <SectionTitle>Geometries</SectionTitle>
    //       <CountBadge>{versionData.geometries.length}</CountBadge>
    //     </SectionHeader>
    //     <InfoList>
    //       {versionData.geometries.slice(0, 2).map((geo, idx) => (
    //         <InfoItem key={idx}>
    //           <Icon>📐</Icon>
    //           {geo.name}
    //         </InfoItem>
    //       ))}
    //     </InfoList>
    //   </InfoSection>

    //   <InfoSection>
    //     <SectionHeader>
    //       <SectionTitle>Equations</SectionTitle>
    //       <CountBadge>{versionData.equations.length}</CountBadge>
    //     </SectionHeader>
    //   </InfoSection>

    //   <InfoSection>
    //     <SectionHeader>
    //       <SectionTitle>Files</SectionTitle>
    //       <CountBadge>{versionData.files.length}</CountBadge>
    //     </SectionHeader>
    //   </InfoSection>

    //   <DateInfo>
    //     <Icon>📅</Icon>
    //     {versionData.createdAt}
    //   </DateInfo>
      
    //   <Handle
    //     type="source"
    //     position={Position.Bottom}
    //     style={{
    //       background: "var(--primary-action)",
    //       width: 8,
    //       height: 8,
    //     }}
    //   />
    // </NodeContainer>


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
        {" "}
        {/* ⬅️ drag handle */}
        <NodeTitle>{versionData.id.toUpperCase()}</NodeTitle>
      </NodeHeader>

      <ContentContainer>
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