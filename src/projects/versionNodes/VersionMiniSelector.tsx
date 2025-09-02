// VersionMiniSelector.tsx

import React from "react";
import styled from "styled-components";
import { ProjectVersion } from "./mockData";

interface VersionMiniSelectorProps {
  versions: ProjectVersion[];
  activeVersionId: string;
  onVersionChange: (versionId: string) => void;
  onNewVersion?: () => void;
}

export const VersionMiniSelector: React.FC<VersionMiniSelectorProps> = ({
  versions,
  activeVersionId,
  onVersionChange,
  onNewVersion,
}) => {
  // Determine node state (parent, active, child)
  const getNodeState = (versionId: string): 'active' | 'parent' | 'child' => {
    if (versionId === activeVersionId) return 'active';
    
    // Check if this version is an ancestor of the active version
    let currentId = activeVersionId;
    while (currentId) {
      const current = versions.find(v => v.id === currentId);
      if (current?.parentVersion === versionId) return 'parent';
      currentId = current?.parentVersion || '';
    }
    
    // Otherwise it's a child/descendant
    return 'child';
  };

  return (
    <SelectorContainer>
      {versions.map((version, index) => {
        const nodeState = getNodeState(version.id);
        const hasNext = index < versions.length - 1;
        const nextVersion = hasNext ? versions[index + 1] : null;
        const isConnected = nextVersion && (
          nextVersion.parentVersion === version.id || 
          version.parentVersion === nextVersion.id ||
          version.parentVersion === nextVersion.parentVersion
        );

        return (
          <React.Fragment key={version.id}>
            <VersionNode
              $state={nodeState}
              onClick={() => onVersionChange(version.id)}
              title={version.title}
            >
              {version.id.toUpperCase()}
            </VersionNode>
            
            {hasNext && (
              <ConnectionLine $dimmed={nodeState === 'child' || (nextVersion && getNodeState(nextVersion.id) === 'child')} />
            )}
          </React.Fragment>
        );
      })}
      
      {onNewVersion && (
        <>
          <ConnectionLine $dimmed={true} />
          <AddButton onClick={onNewVersion}>
            +
          </AddButton>
        </>
      )}
    </SelectorContainer>
  );
};

// Styled Components
const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-bg);
`;

const VersionNode = styled.button<{ $state: 'active' | 'parent' | 'child' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid transparent;
  position: relative;
  z-index: 2;
  
  ${props => {
    switch (props.$state) {
      case 'active':
        return `
          background: var(--primary-action);
          color: white;
          opacity: 1;
          
          &:hover {
            transform: scale(1.1);
            border-color: var(--primary-action);
          }
        `;
      case 'parent':
        return `
          background: var(--bg-tertiary);
          color: var(--text-primary);
          opacity: 0.8;
          
          &:hover {
            transform: scale(1.1);
            border-color: var(--accent-neutral);
            opacity: 1;
          }
        `;
      case 'child':
        return `
          background: var(--bg-tertiary);
          color: var(--text-muted);
          opacity: 0.4;
          
          &:hover {
            transform: scale(1.1);
            border-color: var(--border-bg);
            opacity: 0.6;
          }
        `;
    }
  }}
`;

const ConnectionLine = styled.div<{ $dimmed: boolean }>`
  width: 24px;
  height: 2px;
  background: ${props => props.$dimmed ? 'var(--border-bg)' : 'var(--accent-neutral)'};
  opacity: ${props => props.$dimmed ? 0.3 : 0.6};
  position: relative;
  z-index: 1;
`;

const AddButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px dashed var(--border-bg);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
  color: var(--text-muted);
  opacity: 0.6;
  position: relative;
  z-index: 2;
  
  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary-action);
    border-style: solid;
    color: var(--primary-action);
    transform: scale(1.1);
    opacity: 1;
  }
`;