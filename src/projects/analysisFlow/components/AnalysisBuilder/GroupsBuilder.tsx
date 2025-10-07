// analysisFlow/components/AnalysisBuilder/GroupsBuilder.tsx
import React, { useState } from "react";
import styled from "styled-components";
import {
  Analysis,
  AnalysisGroup,
} from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { Plus, Trash2, Edit2, Layers, AlertCircle } from "lucide-react";

interface GroupsBuilderProps {
  groups: AnalysisGroup[];
  analyses: Analysis[];
  onChange: (groups: AnalysisGroup[]) => void;
}

export const GroupsBuilder: React.FC<GroupsBuilderProps> = ({
  groups,
  analyses,
  onChange,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);

  // Get analyses that aren't in any group yet
  const usedAnalysisIds = new Set(groups.flatMap((g) => g.analyses.map((a) => a.id)));
  const availableAnalyses = analyses.filter((a) => !usedAnalysisIds.has(a.id));

  const handleAddOrUpdateGroup = () => {
    if (!groupName || selectedAnalyses.length === 0) return;

    const groupAnalyses = analyses.filter((a) => selectedAnalyses.includes(a.id));

    const newGroup: AnalysisGroup = {
      id: editingId || `group-${Date.now()}`,
      name: groupName,
      status: "pending",
      analyses: groupAnalyses,
    };

    if (editingId) {
      onChange(groups.map((g) => (g.id === editingId ? newGroup : g)));
    } else {
      onChange([...groups, newGroup]);
    }

    setGroupName("");
    setSelectedAnalyses([]);
    setEditingId(null);
  };

  const handleEdit = (group: AnalysisGroup) => {
    setGroupName(group.name);
    setSelectedAnalyses(group.analyses.map((a) => a.id));
    setEditingId(group.id);
  };

  const handleDelete = (id: string) => {
    onChange(groups.filter((g) => g.id !== id));
  };

  const handleCancel = () => {
    setGroupName("");
    setSelectedAnalyses([]);
    setEditingId(null);
  };

  const handleToggleAnalysis = (analysisId: string) => {
    setSelectedAnalyses((prev) =>
      prev.includes(analysisId)
        ? prev.filter((id) => id !== analysisId)
        : [...prev, analysisId]
    );
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>Analysis Groups ({groups.length})</HeaderTitle>
        <HeaderSubtitle>
          Organize analyses into logical groups for better workflow management
        </HeaderSubtitle>
      </Header>

      <FormSection>
        <FormTitle>{editingId ? "Edit Group" : "Create New Group"}</FormTitle>

        <FormField>
          <Label>Group Name *</Label>
          <Input
            placeholder="e.g., Structural Analysis, Thermal Analysis"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </FormField>

        <FormField>
          <Label>Select Analyses *</Label>
          {availableAnalyses.length > 0 || editingId ? (
            <AnalysesList>
              {(editingId ? analyses : availableAnalyses).map((analysis) => {
                const isUsed = usedAnalysisIds.has(analysis.id) && !editingId;
                const isEditing = editingId !== null;
                const isDisabled = isUsed && !isEditing;

                return (
                  <AnalysisCheckbox key={analysis.id} $disabled={isDisabled}>
                    <input
                      type="checkbox"
                      checked={selectedAnalyses.includes(analysis.id)}
                      onChange={() => !isDisabled && handleToggleAnalysis(analysis.id)}
                      disabled={isDisabled}
                    />
                    <CheckboxLabel>
                      <AnalysisName>{analysis.name}</AnalysisName>
                      <AnalysisType>{analysis.type}</AnalysisType>
                      {analysis.requirements && analysis.requirements.length > 0 && (
                        <ReqCount>{analysis.requirements.length} requirements</ReqCount>
                      )}
                    </CheckboxLabel>
                  </AnalysisCheckbox>
                );
              })}
            </AnalysesList>
          ) : (
            <EmptyAnalyses>
              No analyses available. Go back to step 2 to create some, or all analyses are already grouped.
            </EmptyAnalyses>
          )}
        </FormField>

        <FormActions>
          {editingId && <CancelButton onClick={handleCancel}>Cancel</CancelButton>}
          <AddButton onClick={handleAddOrUpdateGroup} disabled={!groupName || selectedAnalyses.length === 0}>
            <Plus size={16} />
            {editingId ? "Update Group" : "Create Group"}
          </AddButton>
        </FormActions>
      </FormSection>

      {groups.length > 0 ? (
        <ListSection>
          <ListTitle>Configured Groups</ListTitle>
          <GroupsList>
            {groups.map((group) => (
              <GroupCard key={group.id}>
                <CardHeader>
                  <GroupInfo>
                    <GroupIcon>
                      <Layers size={16} />
                    </GroupIcon>
                    <GroupName>{group.name}</GroupName>
                  </GroupInfo>
                  <CardActions>
                    <IconButton onClick={() => handleEdit(group)}>
                      <Edit2 size={14} />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(group.id)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </CardActions>
                </CardHeader>
                <CardBody>
                  <AnalysisCount>
                    {group.analyses.length} analysis/analyses
                  </AnalysisCount>
                  <GroupAnalyses>
                    {group.analyses.map((analysis) => (
                      <AnalysisTag key={analysis.id}>
                        <TagName>{analysis.name}</TagName>
                        {analysis.requirements && analysis.requirements.length > 0 && (
                          <TagBadge>{analysis.requirements.length}</TagBadge>
                        )}
                      </AnalysisTag>
                    ))}
                  </GroupAnalyses>
                </CardBody>
              </GroupCard>
            ))}
          </GroupsList>
        </ListSection>
      ) : (
        <EmptyState>
          <AlertCircle size={32} />
          <EmptyTitle>No Groups Created</EmptyTitle>
          <EmptyText>Create your first group using the form above</EmptyText>
        </EmptyState>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div``;

const HeaderTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
`;

const FormSection = styled.div`
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const Input = styled.input`
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const AnalysesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
`;

const AnalysisCheckbox = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  padding: 10px;
  border-radius: 6px;
  transition: background 0.2s ease;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};

  &:hover {
    background: ${(props) => (props.$disabled ? "transparent" : "var(--bg-tertiary)")};
  }

  input[type="checkbox"] {
    margin-top: 2px;
    cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  }
`;

const CheckboxLabel = styled.div`
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
  font-family: "Monaco", "Courier New", monospace;
`;

const ReqCount = styled.div`
  font-size: 9px;
  color: var(--accent-primary);
  font-weight: 600;
`;

const EmptyAnalyses = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  line-height: 1.5;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddButton = styled(Button)`
  background: var(--accent-primary);
  color: var(--text-inverted);

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-outline);

  &:hover {
    background: var(--bg-tertiary);
  }
`;

const ListSection = styled.div``;

const ListTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

const GroupsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`;

const GroupCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-outline);
`;

const GroupInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GroupIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverted);
`;

const GroupName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-outline);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
    border-color: var(--accent-primary);
  }
`;

const CardBody = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AnalysisCount = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
`;

const GroupAnalyses = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AnalysisTag = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
  }
`;

const TagName = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
`;

const TagBadge = styled.div`
  padding: 2px 6px;
  background: var(--accent-primary);
  color: var(--text-inverted);
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
`;

const EmptyTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 4px 0;
`;

const EmptyText = styled.p`
  font-size: 12px;
  margin: 0;
`;