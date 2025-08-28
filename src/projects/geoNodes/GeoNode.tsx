import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import styled from "styled-components";

// ============= INTERFACES =============
export interface PanelSection {
  id: string;
  title: string;
  panelContent: React.ReactNode;
  metadata?: Record<string, any>;
}


export interface GeometryData {
  facesFile: ArrayBuffer;
  edgesFile: ArrayBuffer;
  bodiesFile: ArrayBuffer;
  fileName?: string;
}

export interface NodeGeometry {
  id: string;
  data?: GeometryData; // Store the actual geometry data
  renderContent?: () => React.ReactElement;
  placeholder?: string;
}

export interface EdgeConfig {
  targetId: string;
  label?: string;
  animated?: boolean;
}

export interface GeoNodeData extends Record<string, unknown> {
  title: string;
  geoLabel?: string;
  panels: PanelSection[];
  geometry?: NodeGeometry;
  status?: "idle" | "processing" | "complete" | "error";
  color?: string;
  edges?: EdgeConfig[];
  metadata?: Record<string, any>;
  isEditable?: boolean; // Flag to enable editing mode
}

export interface GeoNodeProps {
  id: string; // Need node ID for updates
  data: GeoNodeData;
  selected?: boolean;
}

// ============= STYLED COMPONENTS =============
const EditButton = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-bg);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  z-index: 999;
  transition: all 0.2s;
  
  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
`;

const NodeContainer = styled.div<{ selected: boolean }>`
  position: relative;
  border: 2px solid
    ${(props) =>
      props.selected ? "var(--primary-action)" : "var(--border-bg)"};
  border-radius: 12px;
  width: 600px;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color 0.2s ease;
  background: var(--bg-secondary);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  
  &:hover ${EditButton} {
    opacity: 1;
  }
`;

const NodeHeader = styled.div`
  padding: 12px 16px;
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

const StatusBadge = styled.span<{ status?: string; customColor?: string }>`
  font-size: 11px;
  padding: 4px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: capitalize;

  background: ${props => {
    if (props.customColor) return props.customColor;
    switch(props.status) {
      case 'complete': return 'var(--bg-secondary)';
      case 'processing': return 'var(--primary-action)';
      case 'error': return 'var(--error)';
      default: return 'var(--bg-tertiary)';
    }
  }};
  color: ${props => props.status === 'complete' && !props.customColor ? 'var(--text-muted)' : 'white'};
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SidePanel = styled.div`
  flex: 1;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CanvasArea = styled.div`
  flex: 2;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: auto;
`;

const SectionContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--border-outline);
  transition: flex 0.3s ease;
  flex: ${(props) => (props.isExpanded ? "1" : "0 0 auto")};
  overflow: hidden;
`;

const SectionHeader = styled.button<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: ${props => props.isExpanded ? "var(--bg-tertiary)" : "var(--bg-secondary)"};
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--hover-bg);
  }
`;

const SectionTitle = styled.span<{ isExpanded: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.isExpanded ? "var(--text-primary)" : "var(--text-muted)"};
  text-align: left;
`;

const ExpandIcon = styled.span<{ isExpanded: boolean }>`
  font-size: 10px;
  color: var(--text-muted);
  transform: ${(props) => (props.isExpanded ? "rotate(90deg)" : "rotate(0)")};
  transition: transform 0.2s ease;
`;

const SectionContent = styled.div<{ isExpanded: boolean }>`
  padding: ${(props) => (props.isExpanded ? "10px" : "0")};
  max-height: ${(props) => (props.isExpanded ? "500px" : "0")};
  height: 100%;
  opacity: ${props => props.isExpanded ? "1" : "0"};
  overflow-y: auto;
  transition: all 0.3s ease;
  color: var(--text-primary);
  background: var(--bg-secondary);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--accent-neutral);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent-primary);
  }
`;

const CanvasPlaceholder = styled.div`
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  user-select: none;
`;

const NodeLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--bg-secondary);
  padding: 4px 8px;
  border-radius: 4px;
`;

// ============= COMPONENT =============
export const GeoNode: React.FC<GeoNodeProps> = ({ id, data, selected = false }) => {
  const { title, panels, geometry, geoLabel, status, color } = data;
  const [expandedSection, setExpandedSection] = useState<string | null>(
    panels.length > 0 ? panels[0].id : null
  );

  const handleSectionClick = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleEdit = () => {
    const event = new CustomEvent('editNode', { 
      detail: { nodeId: id, data } 
    });
    window.dispatchEvent(event);
  };

  return (
    <NodeContainer selected={selected}>
      <EditButton onClick={handleEdit}>Edit</EditButton>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "var(--accent-primary)",
          width: 8,
          height: 8,
        }}
      />

      <NodeHeader>
        <NodeTitle>{title}</NodeTitle>
        {status && <StatusBadge status={status} customColor={color}>{status}</StatusBadge>}
      </NodeHeader>

      <ContentContainer>
        <SidePanel>
          {panels.map((panel) => (
            <SectionContainer
              key={panel.id}
              isExpanded={expandedSection === panel.id}
            >
              <SectionHeader
                isExpanded={expandedSection === panel.id}
                onClick={() => handleSectionClick(panel.id)}
              >
                <SectionTitle isExpanded={expandedSection === panel.id}>
                  {panel.title}
                </SectionTitle>
                <ExpandIcon isExpanded={expandedSection === panel.id}>
                  ▶
                </ExpandIcon>
              </SectionHeader>
              <SectionContent isExpanded={expandedSection === panel.id}>
                {panel.panelContent}
              </SectionContent>
            </SectionContainer>
          ))}
        </SidePanel>

        <CanvasArea>
          {geoLabel && <NodeLabel>{geoLabel}</NodeLabel>}
          {geometry?.renderContent ? (
            geometry.renderContent()
          ) : (
            <CanvasPlaceholder>
              {geometry?.placeholder || "Canvas Area"}
            </CanvasPlaceholder>
          )}
        </CanvasArea>
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