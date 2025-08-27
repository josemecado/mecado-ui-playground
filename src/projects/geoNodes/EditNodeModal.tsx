import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { GeoNodeData, PanelSection } from "./GeoNode";

interface EditNodeModalProps {
  nodeData?: GeoNodeData;
  onSave: (data: GeoNodeData) => void;
  onCancel: () => void;
  position?: { x: number; y: number };
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
  width: 50%;
  min-width: 350px;
  max-height: 70vh;
  background: var(--bg-primary);
  border-radius: 8px;
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
  flex: 1;
  padding: 16px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--accent-neutral);
    border-radius: 3px;
  }
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
`;

const FormSection = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 6px;
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

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: var(--primary-action);
    background: var(--bg-primary);
  }
`;

const FormSelect = styled.select`
  width: 100%;
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
    background: var(--bg-primary);
  }
`;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  min-width: 100px;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 100%;
  height: 36px;
  background: ${(props) => props.color || "var(--bg-tertiary)"};
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: var(--primary-action);
  }
`;

const ColorInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

const PanelSectionContainer = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  position: relative;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: var(--error);
  }
`;

const AddButton = styled.button`
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px dashed var(--border-bg);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--primary-action);
  }
`;

const UploadSection = styled.div`
  background: var(--bg-secondary);
  border: 1px dashed var(--border-bg);
  border-radius: 6px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary-action);
    background: var(--bg-tertiary);
  }
`;

const UploadIcon = styled.div`
  font-size: 24px;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const UploadText = styled.div`
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const UploadSubtext = styled.div`
  font-size: 12px;
  color: var(--text-muted);
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterLeft = styled.div`
  display: flex;
  gap: 8px;
`;

const FooterRight = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "text" }>`
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
          
          &:hover {
            opacity: 0.9;
          }
        `;
      case "text":
        return `
          background: transparent;
          color: var(--text-muted);
          border: none;
          
          &:hover {
            color: var(--text-primary);
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

export const EditNodeModal: React.FC<EditNodeModalProps> = ({
  nodeData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<GeoNodeData>({
    title: nodeData?.title || "",
    geoLabel: nodeData?.geoLabel || "",
    status: nodeData?.status || "idle",
    color: nodeData?.color || "#3A4DE4",
    panels: nodeData?.panels || [],
    edges: nodeData?.edges || [],
  } as GeoNodeData);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addPanel = () => {
    const newPanel: PanelSection = {
      id: `panel-${Date.now()}`,
      title: "New Section",
      labelContent: "",
    };
    updateField("panels", [...formData.panels, newPanel]);
  };

  const updatePanel = (index: number, field: string, value: string) => {
    const updatedPanels = [...formData.panels];
    updatedPanels[index] = { ...updatedPanels[index], [field]: value };
    updateField("panels", updatedPanels);
  };

  const deletePanel = (index: number) => {
    const updatedPanels = formData.panels.filter((_, i) => i !== index);
    updateField("panels", updatedPanels);
  };

  const handleSave = () => {
    onSave(formData);
  };

  const handleUploadClick = () => {
    // Placeholder for file upload logic
    console.log("Upload geometry clicked");
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{nodeData ? "Edit Node" : "Add New Node"}</ModalTitle>
          <CloseButton onClick={onCancel}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          <SectionTitle>NODE DETAILS</SectionTitle>

          <FormSection>
            <FormRow>
              <FormContainer>
                <FormLabel>Node Name</FormLabel>
                <FormInput
                  value={formData.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Enter node name..."
                />
              </FormContainer>
              <FormContainer>
                <FormLabel>Color</FormLabel>
                <ColorPickerWrapper>
                  <ColorPreview color={formData.color}>
                    <ColorInput
                      type="color"
                      value={formData.color || "#4CAF50"}
                      onChange={(e) => updateField("color", e.target.value)}
                    />
                  </ColorPreview>
                </ColorPickerWrapper>
              </FormContainer>
            </FormRow>
          </FormSection>

          <FormSection>
            <FormRow>
              <FormContainer>
                <FormLabel>GeoLabel</FormLabel>
                <FormInput
                  value={formData.geoLabel}
                  onChange={(e) => updateField("geoLabel", e.target.value)}
                  placeholder="Enter client name..."
                />
              </FormContainer>
              <FormContainer>
                <FormLabel>Status</FormLabel>
                <FormSelect
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="idle">Idle</option>
                  <option value="processing">Processing</option>
                  <option value="complete">Complete</option>
                  <option value="error">Error</option>
                </FormSelect>
              </FormContainer>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>ATTACHMENTS</SectionTitle>
            <UploadSection onClick={handleUploadClick}>
              <UploadIcon>📎</UploadIcon>
              <UploadText>Click to upload or drag and drop</UploadText>
              <UploadSubtext>STEP, STL, or other geometry files</UploadSubtext>
            </UploadSection>
          </FormSection>

          <FormSection>
            <SectionTitle>PANEL SECTIONS</SectionTitle>
            {formData.panels.map((panel, index) => (
              <PanelSectionContainer key={panel.id}>
                <PanelHeader>
                  <FormInput
                    value={panel.title}
                    onChange={(e) =>
                      updatePanel(index, "title", e.target.value)
                    }
                    placeholder="Section title..."
                    style={{ marginBottom: 0 }}
                  />
                  <DeleteButton onClick={() => deletePanel(index)}>
                    ✕
                  </DeleteButton>
                </PanelHeader>
                <FormTextarea
                  value={panel.labelContent as string}
                  onChange={(e) =>
                    updatePanel(index, "labelContent", e.target.value)
                  }
                  placeholder="Section content..."
                />
              </PanelSectionContainer>
            ))}
            <AddButton onClick={addPanel}>+ Add Panel Section</AddButton>
          </FormSection>
        </ModalBody>

        <ModalFooter>
          <FooterLeft>
            <Button variant="text" onClick={onCancel}>
              Cancel
            </Button>
          </FooterLeft>
          <FooterRight>
            <Button variant="secondary">Save as Draft</Button>
            <Button variant="primary" onClick={handleSave}>
              {nodeData ? "Update Node" : "Create Node"}
            </Button>
          </FooterRight>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};
