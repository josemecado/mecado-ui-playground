// analysisFlow/components/AnalysisBuilder/RequirementsBuilder.tsx
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Requirement } from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import {
  METRIC_VARIABLES,
  MetricVariable,
  validateExpression,
} from "../../utils/mockAnalysisData";
import { Plus, AlertCircle, CheckCircle, Code2, X } from "lucide-react";
import { UnitSelector } from "./UnitSelector";
import { RequirementCard } from "./RequirementCard";

interface RequirementsBuilderProps {
  requirements: Requirement[];
  onChange: (requirements: Requirement[]) => void;
}

export const RequirementsBuilder: React.FC<RequirementsBuilderProps> = ({
  requirements,
  onChange,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Requirement>>({
    name: "",
    description: "",
    expression: "",
    comparator: "<",
    targetValue: 0,
    unit: "",
    evaluationScope: { type: "project" },
    category: "",
    priority: "standard",
  });

  const [showVariableHelper, setShowVariableHelper] = useState(false);
  const [expressionValidation, setExpressionValidation] = useState<{
    isValid: boolean;
    error?: string;
    usedVariables?: string[];
  } | null>(null);

  useMemo(() => {
    if (formData.expression) {
      const validation = validateExpression(formData.expression);
      setExpressionValidation(validation);
    } else {
      setExpressionValidation(null);
    }
  }, [formData.expression]);

  const handleAddOrUpdate = () => {
    if (!formData.name || !formData.expression) return;
    if (!expressionValidation?.isValid) return;

    const requirement: Requirement = {
      id: editingId || `req-${Date.now()}`,
      name: formData.name!,
      description: formData.description || "",
      expression: formData.expression!,
      comparator: formData.comparator!,
      targetValue: formData.targetValue!,
      unit: formData.unit || "",
      evaluationScope: formData.evaluationScope!,
      category: formData.category || "",
      priority: formData.priority!,
      status: "pending",
    };

    if (editingId) {
      onChange(requirements.map((r) => (r.id === editingId ? requirement : r)));
    } else {
      onChange([...requirements, requirement]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      expression: "",
      comparator: "<",
      targetValue: 0,
      unit: "",
      evaluationScope: { type: "project" },
      category: "",
      priority: "standard",
    });
    setEditingId(null);
    setExpressionValidation(null);
    setShowForm(false);
    setShowVariableHelper(false);
  };

  const handleEdit = (req: Requirement) => {
    setFormData(req);
    setEditingId(req.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onChange(requirements.filter((r) => r.id !== id));
  };

  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  const insertVariable = (varName: string) => {
    const currentExpression = formData.expression || "";
    setFormData({
      ...formData,
      expression: currentExpression + (currentExpression ? " " : "") + varName,
    });
  };

  const insertOperator = (operator: string) => {
    const currentExpression = formData.expression || "";
    setFormData({
      ...formData,
      expression: currentExpression + " " + operator + " ",
    });
  };

  const groupedVariables = useMemo(() => {
    const groups: Record<string, MetricVariable[]> = {
      Structural: [],
      Thermal: [],
      Modal: [],
    };

    METRIC_VARIABLES.forEach((variable) => {
      if (
        variable.type.includes("stress") ||
        variable.type.includes("displacement") ||
        variable.type.includes("safety")
      ) {
        groups["Structural"].push(variable);
      } else if (
        variable.type.includes("temperature") ||
        variable.type.includes("thermal")
      ) {
        groups["Thermal"].push(variable);
      } else if (
        variable.type.includes("frequency") ||
        variable.type.includes("modal") ||
        variable.type.includes("harmonic")
      ) {
        groups["Modal"].push(variable);
      }
    });

    return groups;
  }, []);

  return (
    <Container>
      {/* Form Section - Only visible when creating/editing */}

      {showForm && (
        <FormSection>
          <FormHeader>
            <FormTitle>
              {editingId ? "Edit Requirement" : "Create Requirement"}
            </FormTitle>
            <CloseButton onClick={resetForm}>
              <X size={16} />
            </CloseButton>
          </FormHeader>

          <FormGrid>
            <FormField style={{ gridColumn: "1 / -1" }}>
              <Label>Name</Label>
              <Input
                placeholder="e.g., Thermal Safety Margin"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </FormField>

            <FormField style={{ gridColumn: "1 / -1" }}>
              <LabelRow>
                <Label>Expression</Label>
                <HelperButton
                  $active={showVariableHelper}
                  onClick={() => setShowVariableHelper(!showVariableHelper)}
                >
                  <Code2 size={12} />
                  Variables
                </HelperButton>
              </LabelRow>

              <ExpressionInput
                placeholder="e.g., T_max / 100 or (Stress_max + Stress_min) / 2"
                value={formData.expression}
                onChange={(e) =>
                  setFormData({ ...formData, expression: e.target.value })
                }
                $isValid={expressionValidation?.isValid}
                $hasError={
                  expressionValidation !== null && !expressionValidation.isValid
                }
              />

              {expressionValidation && !expressionValidation.isValid && (
                <ValidationMessage $type="error">
                  <AlertCircle size={14} />
                  {expressionValidation.error}
                </ValidationMessage>
              )}

              {expressionValidation && expressionValidation.isValid && (
                <ValidationMessage $type="success">
                  <CheckCircle size={14} />
                  Using: {expressionValidation.usedVariables?.join(", ")}
                </ValidationMessage>
              )}

              {showVariableHelper && (
                <VariableHelper>
                  {Object.entries(groupedVariables).map(
                    ([category, variables]) => (
                      <VariableGroup key={category}>
                        <CategoryTitle>{category}</CategoryTitle>
                        <VariableGrid>
                          {variables.map((variable) => (
                            <VariableButton
                              key={variable.name}
                              onClick={() => insertVariable(variable.name)}
                              title={`${variable.label} (${
                                variable.unit || "dimensionless"
                              })`}
                            >
                              <VarName>{variable.name}</VarName>
                              <VarUnit>{variable.unit || "—"}</VarUnit>
                            </VariableButton>
                          ))}
                        </VariableGrid>
                      </VariableGroup>
                    )
                  )}

                  <OperatorSection>
                    <CategoryTitle>Operators</CategoryTitle>
                    <OperatorGrid>
                      {["+", "-", "*", "/", "^", "(", ")"].map((op) => (
                        <OperatorButton
                          key={op}
                          onClick={() => insertOperator(op)}
                        >
                          {op}
                        </OperatorButton>
                      ))}
                    </OperatorGrid>
                  </OperatorSection>
                </VariableHelper>
              )}
            </FormField>

            <FormField>
              <Label>Comparator</Label>
              <Select
                value={formData.comparator}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    comparator: e.target.value as Requirement["comparator"],
                  })
                }
              >
                <option value="<">{"<"} Less than</option>
                <option value="<=">{"<="} Less or equal</option>
                <option value=">">{">"} Greater than</option>
                <option value=">=">{">="} Greater or equal</option>
                <option value="==">{"=="} Equal to</option>
                <option value="!=">{"!="} Not equal</option>
              </Select>
            </FormField>

            <FormField>
              <Label>Target Value</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.75"
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetValue: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </FormField>

            <FormField>
              <Label>Unit</Label>
              <UnitSelector
                value={formData.unit || ""}
                onChange={(unit) => setFormData({ ...formData, unit })}
              />
            </FormField>

            <FormField>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as Requirement["priority"],
                  })
                }
              >
                <option value="standard">Standard</option>
                <option value="important">Important</option>
                <option value="critical">Critical</option>
              </Select>
            </FormField>

            <FormField style={{ gridColumn: "1 / -1" }}>
              <Label>Description (Optional)</Label>
              <TextArea
                placeholder="Additional details about this requirement..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </FormField>
          </FormGrid>

          <FormActions>
            <ActionButton $variant="secondary" onClick={resetForm}>
              Cancel
            </ActionButton>
            <ActionButton
              $variant="primary"
              onClick={handleAddOrUpdate}
              disabled={!formData.name || !expressionValidation?.isValid}
            >
              {editingId ? "Update" : "Create"} Requirement
            </ActionButton>
          </FormActions>
        </FormSection>
      )}
      {/* Requirements List */}
      <ListSection>
        <ListHeader>
          <HeaderLeft>
            <SectionTitle>Requirements</SectionTitle>
            <Count>{requirements.length}</Count>
          </HeaderLeft>
          {!showForm && (
            <CreateButton onClick={handleCreateNew}>
              <Plus size={14} />
              New Requirement
            </CreateButton>
          )}
        </ListHeader>

        {requirements.length > 0 ? (
          <RequirementsList>
            {requirements.map((req) => (
              <RequirementCard
                key={req.id}
                requirement={req}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </RequirementsList>
        ) : (
          <EmptyState>
            <AlertCircle size={32} />
            <EmptyTitle>No Requirements</EmptyTitle>
            <EmptyText>Create your first requirement to get started</EmptyText>
          </EmptyState>
        )}
      </ListSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const Count = styled.div`
  padding: 3px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--accent-primary);
  color: var(--text-inverted);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-primary);
  }
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: var(--bg-secondary);
  border: 1px dashed var(--border-bg);
  border-radius: 8px;
  color: var(--text-muted);
`;

const EmptyTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 4px 0;
  color: var(--text-primary);
`;

const EmptyText = styled.p`
  font-size: 12px;
  margin: 0;
`;

const FormSection = styled.div`
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 14px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const LabelRow = styled.div`
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

const HelperButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${(props) =>
    props.$active ? "var(--accent-primary)" : "transparent"};
  border: 1px solid
    ${(props) => (props.$active ? "var(--accent-primary)" : "var(--border-bg)")};
  border-radius: 4px;
  color: ${(props) =>
    props.$active ? "var(--text-inverted)" : "var(--accent-primary)"};
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$active ? "var(--hover-primary)" : "var(--hover-bg)"};
  }
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

const ExpressionInput = styled.input<{
  $isValid?: boolean;
  $hasError?: boolean;
}>`
  padding: 9px 12px;
  background: var(--bg-tertiary);
  border: 1px solid
    ${(props) =>
      props.$hasError
        ? "var(--error)"
        : props.$isValid
        ? "var(--success)"
        : "var(--border-bg)"};
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: "Monaco", "Courier New", monospace;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) =>
      props.$hasError
        ? "var(--error)"
        : props.$isValid
        ? "var(--success)"
        : "var(--accent-primary)"};
  }

  &::placeholder {
    color: var(--text-muted);
    font-family: inherit;
  }
`;

const ValidationMessage = styled.div<{ $type: "error" | "success" }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: ${(props) =>
    props.$type === "error"
      ? "rgba(239, 68, 68, 0.1)"
      : "rgba(34, 197, 94, 0.1)"};
  border-radius: 4px;
  color: ${(props) =>
    props.$type === "error" ? "var(--error)" : "var(--success)"};
  font-size: 11px;
  font-weight: 500;
`;

const VariableHelper = styled.div`
  margin-top: 8px;
  padding: 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
`;

const VariableGroup = styled.div`
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const VariableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
`;

const VariableButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    border-color: var(--accent-primary);
  }
`;

const VarName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: "Monaco", "Courier New", monospace;
`;

const VarUnit = styled.span`
  font-size: 9px;
  color: var(--text-muted);
`;

const OperatorSection = styled.div`
  margin-top: 14px;
`;

const OperatorGrid = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const OperatorButton = styled.button`
  padding: 6px 11px;
  background: var(--accent-primary);
  color: var(--text-inverted);
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  font-family: "Monaco", "Courier New", monospace;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-primary);
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

const TextArea = styled.textarea`
  padding: 9px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
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
