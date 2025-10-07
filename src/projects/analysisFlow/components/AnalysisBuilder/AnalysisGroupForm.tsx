// analysisFlow/components/AnalysisBuilder/AnalysisGroupForm.tsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  AnalysisGroup,
  Analysis,
  Requirement,
} from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";

interface AnalysisGroupFormProps {
  group?: AnalysisGroup;
  availableRequirements: Requirement[];
  onSave: (group: AnalysisGroup) => void;
  onCancel: () => void;
}

const ANALYSIS_TYPES = [
  { value: "stress", label: "Static Structural (Stress)" },
  { value: "deformation", label: "Deformation" },
  { value: "safety", label: "Safety Factor" },
  { value: "thermal", label: "Thermal Analysis" },
  { value: "modal_frequency", label: "Modal Frequency" },
  { value: "modal_shapes", label: "Mode Shapes" },
  { value: "harmonic", label: "Harmonic Response" },
];

export const AnalysisGroupForm: React.FC<AnalysisGroupFormProps> = ({
  group,
  availableRequirements,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    analyses: Analysis[];
  }>({
    name: group?.name || "",
    analyses: group?.analyses || [],
  });

  const [newAnalysis, setNewAnalysis] = useState<Partial<Analysis>>({
    name: "",
    type: "stress",
  });

  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(
    []
  );

  const handleAddAnalysis = () => {
    if (!newAnalysis.name || !newAnalysis.type) return;

    const analysis: Analysis = {
      id: `analysis-${Date.now()}`,
      name: newAnalysis.name,
      type: newAnalysis.type,
      status: "pending",
      metrics: [],
      requirements: availableRequirements.filter((req) =>
        selectedRequirements.includes(req.id)
      ),
    };

    setFormData({
      ...formData,
      analyses: [...formData.analyses, analysis],
    });

    setNewAnalysis({ name: "", type: "stress" });
    setSelectedRequirements([]);
  };

  const handleRemoveAnalysis = (analysisId: string) => {
    setFormData({
      ...formData,
      analyses: formData.analyses.filter((a) => a.id !== analysisId),
    });
  };

  const handleSave = () => {
    if (!formData.name || formData.analyses.length === 0) return;

    const analysisGroup: AnalysisGroup = {
      id: group?.id || `group-${Date.now()}`,
      name: formData.name,
      status: group?.status || "pending",
      analyses: formData.analyses,
    };

    onSave(analysisGroup);
  };

  const toggleRequirement = (reqId: string) => {
    setSelectedRequirements((prev) =>
      prev.includes(reqId)
        ? prev.filter((id) => id !== reqId)
        : [...prev, reqId]
    );
  };

  const canAddAnalysis = newAnalysis.name && newAnalysis.type;
  const canSave = formData.name && formData.analyses.length > 0;

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>
          {group ? "Edit Analysis Group" : "Create Analysis Group"}
        </FormTitle>
        <CloseButton onClick={onCancel}>
          <X size={16} />
        </CloseButton>
      </FormHeader>

      <FormContent>
        {/* Group Name */}
        <FormSection>
          <Label>Group Name</Label>
          <Input
            placeholder="e.g., Structural Analysis"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormSection>

        {/* Current Analyses List */}
        {formData.analyses.length > 0 && (
          <FormSection>
            <SectionHeader>
              <Label>Analyses in Group ({formData.analyses.length})</Label>
            </SectionHeader>

            <AnalysesList>
              {formData.analyses.map((analysis) => (
                <AnalysisListItem key={analysis.id}>
                  <AnalysisInfo>
                    <AnalysisName>{analysis.name}</AnalysisName>
                    <AnalysisType>{analysis.type}</AnalysisType>
                    {analysis.requirements &&
                      analysis.requirements.length > 0 && (
                        <ReqCount>
                          {analysis.requirements.length} requirements
                        </ReqCount>
                      )}
                  </AnalysisInfo>
                  <RemoveButton
                    onClick={() => handleRemoveAnalysis(analysis.id)}
                  >
                    <Trash2 size={13} />
                  </RemoveButton>
                </AnalysisListItem>
              ))}
            </AnalysesList>
          </FormSection>
        )}

        {/* Add Analysis Section */}
        <FormSection>
          <SectionHeader>
            <Label>Add Analysis</Label>
          </SectionHeader>

          <AnalysisForm>
            <FormGrid>
              <FormField>
                <Label>Analysis Name</Label>
                <Input
                  placeholder="e.g., Static Structural"
                  value={newAnalysis.name}
                  onChange={(e) =>
                    setNewAnalysis({ ...newAnalysis, name: e.target.value })
                  }
                />
              </FormField>

              <FormField>
                <Label>Analysis Type</Label>
                <Select
                  value={newAnalysis.type}
                  onChange={(e) =>
                    setNewAnalysis({ ...newAnalysis, type: e.target.value })
                  }
                >
                  {ANALYSIS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </FormGrid>

            {availableRequirements.length > 0 && (
              <FormField>
                <Label>Assign Requirements (Optional)</Label>
                <RequirementsList>
                  {availableRequirements.map((req) => (
                    <RequirementCheckbox key={req.id}>
                      <input
                        type="checkbox"
                        checked={selectedRequirements.includes(req.id)}
                        onChange={() => toggleRequirement(req.id)}
                      />
                      <RequirementLabel>
                        <RequirementName>{req.name}</RequirementName>
                        <RequirementExpression>
                          {req.expression} {req.comparator} {req.targetValue}
                        </RequirementExpression>
                      </RequirementLabel>
                    </RequirementCheckbox>
                  ))}
                </RequirementsList>
              </FormField>
            )}

            <AddAnalysisButton
              onClick={handleAddAnalysis}
              disabled={!canAddAnalysis}
            >
              <Plus size={14} />
              Add Analysis
            </AddAnalysisButton>
          </AnalysisForm>
        </FormSection>

        {formData.analyses.length === 0 && (
          <EmptyState>
            <AlertCircle size={24} />
            <EmptyText>Add at least one analysis to this group</EmptyText>
          </EmptyState>
        )}
      </FormContent>

      <FormActions>
        <ActionButton $variant="secondary" onClick={onCancel}>
          Cancel
        </ActionButton>
        <ActionButton
          $variant="primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          {group ? "Update" : "Create"} Group
        </ActionButton>
      </FormActions>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FormTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-bg);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  padding: 9px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const Select = styled.select`
  padding: 9px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`;

const AnalysisForm = styled.div`
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 4px;
`;

const RequirementCheckbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
  }

  input[type="checkbox"] {
    margin-top: 2px;
    cursor: pointer;
  }
`;

const RequirementLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const RequirementName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const RequirementExpression = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  font-family: "Monaco", "Courier New", monospace;
`;

const AddAnalysisButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AnalysesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnalysisListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
`;

const AnalysisInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const AnalysisName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const AnalysisType = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  text-transform: capitalize;
`;

const ReqCount = styled.div`
  font-size: 10px;
  color: var(--accent-primary);
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--error);
    color: white;
    border-color: var(--error);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  background: var(--bg-tertiary);
  border: 1px dashed var(--border-bg);
  border-radius: 6px;
  color: var(--text-muted);
`;

const EmptyText = styled.div`
  font-size: 12px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-bg);
`;

const ActionButton = styled.button<{ $variant: "primary" | "secondary" }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: var(--accent-primary);
    color: var(--text-inverted);
    
    &:hover:not(:disabled) {
      background: var(--hover-primary);
    }
  `
      : `
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border-bg);
    
    &:hover {
      background: var(--hover-bg);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
