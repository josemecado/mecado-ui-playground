// analysisFlow/components/AnalysisBuilder/AnalysisGroupBuilder.tsx
import React, { useState } from "react";
import styled from "styled-components";
import {
  AnalysisGroup,
  Requirement,
} from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { Plus, AlertCircle } from "lucide-react";
import { AnalysisGroupCard } from "./AnalysisGroupCard";
import { AnalysisGroupForm } from "./AnalysisGroupForm";

interface AnalysisGroupBuilderProps {
  groups: AnalysisGroup[];
  requirements: Requirement[];
  onChange: (groups: AnalysisGroup[]) => void;
}

export const AnalysisGroupBuilder: React.FC<AnalysisGroupBuilderProps> = ({
  groups,
  requirements,
  onChange,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AnalysisGroup | null>(null);

  const handleSave = (group: AnalysisGroup) => {
    if (editingGroup) {
      onChange(groups.map((g) => (g.id === editingGroup.id ? group : g)));
    } else {
      onChange([...groups, group]);
    }
    resetForm();
  };

  const handleEdit = (group: AnalysisGroup) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    onChange(groups.filter((g) => g.id !== id));
  };

  const handleCreateNew = () => {
    setEditingGroup(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  return (
    <Container>
      {/* Form Section - Only visible when creating/editing */}
      {showForm && (
        <AnalysisGroupForm
          group={editingGroup || undefined}
          availableRequirements={requirements}
          onSave={handleSave}
          onCancel={resetForm}
        />
      )}

      {/* Groups List */}
      <ListSection>
        <ListHeader>
          <HeaderLeft>
            <SectionTitle>Analysis Groups</SectionTitle>
            <Count>{groups.length}</Count>
          </HeaderLeft>
          {!showForm && (
            <CreateButton onClick={handleCreateNew}>
              <Plus size={14} />
              New Group
            </CreateButton>
          )}
        </ListHeader>

        {groups.length > 0 ? (
          <GroupsList>
            {groups.map((group) => (
              <AnalysisGroupCard
                key={group.id}
                group={group}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </GroupsList>
        ) : (
          <EmptyState>
            <AlertCircle size={32} />
            <EmptyTitle>No Analysis Groups</EmptyTitle>
            <EmptyText>
              Create your first analysis group to organize your analyses
            </EmptyText>
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
  border-radius: 12px;
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
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const GroupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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