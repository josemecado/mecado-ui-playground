// AddVersionModal.tsx

import React, { useState } from "react";
import styled from "styled-components";
import { ProjectVersion, EdgeConfig } from "./mockData";

interface AddVersionModalProps {
  onSave: (data: ProjectVersion) => void;
  onCancel: () => void;
  existingVersions: ProjectVersion[];
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

const FormInput = styled.input`
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--primary-action);
    background: var(--bg-primary);
  }
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

const RequiredIndicator = styled.span`
  color: var(--error);
  margin-left: 2px;
`;

const ValidationWarning = styled.div`
  color: var(--error);
  font-size: 12px;
  margin-top: 4px;
`;

export const AddVersionModal: React.FC<AddVersionModalProps> = ({
  onSave,
  onCancel,
  existingVersions,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    parentVersion: existingVersions.length > 0 ? existingVersions[existingVersions.length - 1].id : "",
    createConnection: true,
  });
  
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      setShowValidation(true);
      return;
    }

    const versionNumber = existingVersions.length + 1;
    const newVersion: ProjectVersion = {
      id: `v${versionNumber}`,
      title: `v${versionNumber} - ${formData.title}`,
      parentVersion: formData.parentVersion || null,
      createdAt: new Date().toISOString().split('T')[0],
      geometries: [],
      equations: [],
      files: [],
      edges: formData.createConnection && formData.parentVersion 
        ? [] 
        : [],
    };

    onSave(newVersion);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'title' && value.trim()) {
      setShowValidation(false);
    }
  };

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add New Version</ModalTitle>
          <CloseButton onClick={onCancel}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          <SectionTitle>VERSION DETAILS</SectionTitle>
          
          <FormSection>
            <FormLabel>
              Title <RequiredIndicator>*</RequiredIndicator>
            </FormLabel>
            <FormInput
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., Weight Optimization, Material Change..."
              style={{
                borderColor: showValidation && !formData.title.trim() ? "var(--error)" : undefined
              }}
            />
            {showValidation && !formData.title.trim() && (
              <ValidationWarning>Version title is required</ValidationWarning>
            )}
          </FormSection>

          <FormSection>
            <FormLabel>Description</FormLabel>
            <FormInput
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of changes..."
            />
          </FormSection>

          {existingVersions.length > 0 && (
            <>
              <SectionTitle>RELATIONSHIPS</SectionTitle>
              
              <FormSection>
                <FormLabel>Parent Version</FormLabel>
                <FormSelect
                  value={formData.parentVersion}
                  onChange={(e) => updateField("parentVersion", e.target.value)}
                >
                  <option value="">None (Independent Version)</option>
                  {existingVersions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.title}
                    </option>
                  ))}
                </FormSelect>
              </FormSection>

              {formData.parentVersion && (
                <FormSection>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.createConnection}
                      onChange={(e) => updateField("createConnection", e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      Create connection from parent
                    </span>
                  </label>
                </FormSection>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onCancel}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
          >
            Create Version
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};