import React, { useState } from "react";
import styled from "styled-components";
import { TaskContext } from "../home/types/types";

interface SimpleLabelCreatorProps {
  taskContext: TaskContext;
  onSubmit: (taskId: string, labels: string[]) => void;
  onCancel: () => void;
}

export const SimpleLabelCreator: React.FC<SimpleLabelCreatorProps> = ({
  taskContext,
  onSubmit,
  onCancel,
}) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [currentLabel, setCurrentLabel] = useState("");

  const handleAddLabel = () => {
    if (currentLabel.trim()) {
      setLabels([...labels, currentLabel.trim()]);
      setCurrentLabel("");
    }
  };

  const handleRemoveLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (labels.length === 0) {
      alert("Please create at least one label before submitting");
      return;
    }
    onSubmit(taskContext.taskId, labels);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLabel();
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Title>🏷️ Create Labels</Title>
          <Subtitle>Add labels for the geometry below, then submit for approval</Subtitle>
        </Header>

        <TaskInfoSection>
          <SectionTitle>Task Information</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Geometry:</InfoLabel>
              <InfoValue>{taskContext.geometryName || "Unknown"}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Type:</InfoLabel>
              <InfoValue>
                <TypeBadge>{taskContext.geometryType || "N/A"}</TypeBadge>
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Model ID:</InfoLabel>
              <InfoValue>
                <MonoText>{taskContext.modelId || "N/A"}</MonoText>
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Geometry ID:</InfoLabel>
              <InfoValue>
                <MonoText>{taskContext.geometryId || "N/A"}</MonoText>
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </TaskInfoSection>

        <LabelCreationSection>
          <SectionTitle>Create Labels</SectionTitle>
          <LabelInputRow>
            <LabelInput
              type="text"
              placeholder="Enter label name (e.g., 'bolt_hole', 'mating_face')"
              value={currentLabel}
              onChange={(e) => setCurrentLabel(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <AddButton onClick={handleAddLabel} disabled={!currentLabel.trim()}>
              + Add Label
            </AddButton>
          </LabelInputRow>

          {labels.length > 0 && (
            <LabelsListSection>
              <ListHeader>Created Labels ({labels.length})</ListHeader>
              <LabelsList>
                {labels.map((label, index) => (
                  <LabelChip key={index}>
                    <LabelName>{label}</LabelName>
                    <RemoveButton onClick={() => handleRemoveLabel(index)}>×</RemoveButton>
                  </LabelChip>
                ))}
              </LabelsList>
            </LabelsListSection>
          )}

          {labels.length === 0 && (
            <EmptyState>
              <EmptyIcon>🏷️</EmptyIcon>
              <EmptyText>No labels created yet</EmptyText>
              <EmptyHint>Type a label name above and press Enter or click Add Label</EmptyHint>
            </EmptyState>
          )}
        </LabelCreationSection>

        <ActionsSection>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={labels.length === 0}>
            Submit for Approval
          </SubmitButton>
        </ActionsSection>

        <HelpSection>
          <HelpIcon>💡</HelpIcon>
          <HelpText>
            In the real app, you'll select geometry entities and assign them to labels. This
            simplified version just collects label names for testing the task workflow.
          </HelpText>
        </HelpSection>
      </ContentWrapper>
    </Container>
  );
};

// ======================
// 🔹 Styled Components
// ======================

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  padding: ${({ theme }) => theme.spacing[8]};
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.size.xxl};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
`;

const TaskInfoSection = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const TypeBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  text-transform: capitalize;
`;

const MonoText = styled.span`
  font-family: ${({ theme }) => theme.typography.family.mono};
  color: ${({ theme }) => theme.colors.accentPrimary};
`;

const LabelCreationSection = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const LabelInputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const LabelInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-family: ${({ theme }) => theme.typography.family.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brandPrimary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.brandPrimary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const AddButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[5]}`};
  background: ${({ theme }) => theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.brandSecondary};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LabelsListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ListHeader = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LabelsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const LabelChip = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.pill};
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }
`;

const LabelName = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: ${({ theme }) => theme.colors.statusError};
  color: ${({ theme }) => theme.colors.textInverted};
  border: none;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.statusError};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const EmptyHint = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

const ActionsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const CancelButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-color: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
  background: ${({ theme }) => theme.colors.statusSuccess};
  color: ${({ theme }) => theme.colors.textInverted};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.statusSuccess};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.statusSuccess}44;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HelpSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.brandPrimary};
`;

const HelpIcon = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xl};
  flex-shrink: 0;
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.5;
`;