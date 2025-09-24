// AddVersionModal.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { SimpleVersionRelationshipStorage } from "../hooks/versionRelationshipStorage";

interface AddVersionModalProps {
  onSave: (newVersion: ProjectVersion, parentVersionId: string | null) => void;
  onCancel: () => void;
  existingVersions: ProjectVersion[];
  projectId: string;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  width: 500px;
  background: var(--bg-primary);
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--text-primary);
  }
`;

const ModalBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
`;

const FormSelect = styled.select`
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-action);
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
`;

const ModalFooter = styled.div`
  padding: 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-bg);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background: var(--primary-action);
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            opacity: 0.9;
          }
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `;
      default:
        return `
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-bg);
          
          &:hover {
            background: var(--bg-secondary);
          }
        `;
    }
  }}
`;

const HelpText = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
`;

export const AddVersionModal: React.FC<AddVersionModalProps> = ({
  onSave,
  onCancel,
  existingVersions,
  projectId,
}) => {
  // Default to the most recent version as parent
  const defaultParent = existingVersions.length > 0
    ? existingVersions[existingVersions.length - 1].id
    : "";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    parentVersion: defaultParent,
  });

  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = () => {
    // Generate new version ID
    const versionNumber = existingVersions.length + 1;
    const newVersionId = `v${versionNumber}`;
    
    // Update the relationship storage
    if (formData.parentVersion) {
      const relationshipMap = SimpleVersionRelationshipStorage.getRelationshipMap();
      
      // Ensure project exists in map
      if (!relationshipMap[projectId]) {
        relationshipMap[projectId] = {};
      }
      
      // Add the new version as a child of its parent
      if (!relationshipMap[projectId][formData.parentVersion]) {
        relationshipMap[projectId][formData.parentVersion] = [];
      }
      
      if (!relationshipMap[projectId][formData.parentVersion].includes(newVersionId)) {
        relationshipMap[projectId][formData.parentVersion].push(newVersionId);
      }
      
      // Initialize the new version with no children
      relationshipMap[projectId][newVersionId] = [];
      
      // Save the updated relationships
      SimpleVersionRelationshipStorage.saveRelationshipMap(relationshipMap);
      
      console.log('Updated relationships:', relationshipMap[projectId]);
    }

    // Create the new version object
    const newVersion: ProjectVersion = {
      id: newVersionId,
      title: `Version ${versionNumber}`,
      parentVersion: formData.parentVersion || null,
      createdAt: new Date().toISOString(),
      geometries: [],
      pinnedEquations: [],
      uploadedFiles: [],
      generatedFiles: [],
      metrics: [
        {
          title: "Total Mass",
          value: 0,
          type: "mass",
          unit: "kg",
        },
        {
          title: "Safety Factor", 
          value: 0,
          type: "margin_of_safety",
        },
      ],
      edges: [],
    };

    onSave(newVersion, formData.parentVersion || null);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && value.trim()) {
      setShowValidation(false);
    }
  };

  // Group versions by their depth in the tree for better organization
  const getVersionDepth = (versionId: string): number => {
    let depth = 0;
    let currentId: string | null = versionId;
    
    while (currentId) {
      const version = existingVersions.find(v => v.id === currentId);
      if (version && version.parentVersion) {
        depth++;
        currentId = version.parentVersion;
      } else {
        break;
      }
    }
    
    return depth;
  };

  const sortedVersions = [...existingVersions].sort((a, b) => {
    const depthA = getVersionDepth(a.id);
    const depthB = getVersionDepth(b.id);
    if (depthA !== depthB) return depthA - depthB;
    return a.id.localeCompare(b.id);
  });

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add New Version</ModalTitle>
          <CloseButton onClick={onCancel}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          {existingVersions.length > 0 && (
            <>
              <SectionTitle>VERSION HIERARCHY</SectionTitle>

              <FormSection>
                <FormLabel>Parent Version</FormLabel>
                <FormSelect
                  value={formData.parentVersion}
                  onChange={(e) => updateField("parentVersion", e.target.value)}
                >
                  <option value="">None (Create as Root Version)</option>
                  {sortedVersions.map((version) => {
                    const depth = getVersionDepth(version.id);
                    const indent = "  ".repeat(depth);
                    return (
                      <option key={version.id} value={version.id}>
                        {indent}{version.id.toUpperCase()} - {version.title}
                      </option>
                    );
                  })}
                </FormSelect>
                <HelpText>
                  Select which version this new version should branch from. 
                  Leave empty to create an independent root version.
                </HelpText>
              </FormSection>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={false}
          >
            Create Version
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};