import React, { useState } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp, Tag, Plus, X } from "lucide-react";
import { TaskContext } from "../home/types/types";
import {BaseButton} from "components/buttons/BaseButton";

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
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [labelsExpanded, setLabelsExpanded] = useState(true);

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
            <Header>
                <HeaderLeft>
                    <TaskIcon>
                        <Tag size={20} />
                    </TaskIcon>
                    <HeaderText>
                        <Title>{taskContext.geometryName || "Create Labels"}</Title>
                        <Subtitle>Manage your geometry labeling and upload tasks</Subtitle>
                    </HeaderText>
                </HeaderLeft>
                <HeaderActions>
                    <StatusBadge>
                        {labels.length} {labels.length === 1 ? "label" : "labels"}
                    </StatusBadge>
                </HeaderActions>
            </Header>

            <ContentWrapper>
                <TaskCard>
                    {/* Details Section */}
                    <CardSection>
                        <SectionHeader onClick={() => setDetailsExpanded(!detailsExpanded)}>
                            <SectionTitle>Details</SectionTitle>
                            <ExpandIcon>
                                {detailsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </ExpandIcon>
                        </SectionHeader>

                        {detailsExpanded && (
                            <SectionContent>
                                <DetailLabel>Description:</DetailLabel>
                                <DetailValue>
                                    Add labels for the geometry below, then submit for approval
                                </DetailValue>

                                <InfoGrid>
                                    <InfoItem>
                                        <InfoLabel>Geometry:</InfoLabel>
                                        <InfoValue>{taskContext.geometryName || "Unknown"}</InfoValue>
                                    </InfoItem>
                                    <InfoItem>
                                        <InfoLabel>Type:</InfoLabel>
                                        <TypeBadge>{taskContext.geometryType || "N/A"}</TypeBadge>
                                    </InfoItem>
                                    <InfoItem>
                                        <InfoLabel>Model ID:</InfoLabel>
                                        <MonoText>{taskContext.modelId || "N/A"}</MonoText>
                                    </InfoItem>
                                    <InfoItem>
                                        <InfoLabel>Geometry ID:</InfoLabel>
                                        <MonoText>{taskContext.geometryId || "N/A"}</MonoText>
                                    </InfoItem>
                                </InfoGrid>
                            </SectionContent>
                        )}
                    </CardSection>

                    <SectionDivider />

                    {/* Labels Section */}
                    <CardSection>
                        <SectionHeader onClick={() => setLabelsExpanded(!labelsExpanded)}>
                            <SectionTitle>Create Labels</SectionTitle>
                            <ExpandIcon>
                                {labelsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </ExpandIcon>
                        </SectionHeader>

                        {labelsExpanded && (
                            <SectionContent>
                                <LabelInputRow>
                                    <LabelInput
                                        type="text"
                                        placeholder="Enter label name (e.g., 'bolt_hole', 'mating_face')"
                                        value={currentLabel}
                                        onChange={(e) => setCurrentLabel(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <AddButton
                                        $variant="primary"
                                        onClick={handleAddLabel}
                                        disabled={!currentLabel.trim()}
                                    >
                                        <Plus size={16} />
                                        Add Label
                                    </AddButton>
                                </LabelInputRow>

                                {labels.length > 0 ? (
                                    <LabelsList>
                                        {labels.map((label, index) => (
                                            <LabelChip key={index}>
                                                <LabelInfo>
                                                    <LabelIcon>
                                                        <Tag size={14} />
                                                    </LabelIcon>
                                                    <LabelName>{label}</LabelName>
                                                </LabelInfo>
                                                <RemoveButton
                                                    onClick={() => handleRemoveLabel(index)}
                                                    aria-label="Remove label"
                                                >
                                                    <X size={14} />
                                                </RemoveButton>
                                            </LabelChip>
                                        ))}
                                    </LabelsList>
                                ) : (
                                    <EmptyState>
                                        <EmptyIcon>
                                            <Tag size={32} />
                                        </EmptyIcon>
                                        <EmptyText>No labels created yet</EmptyText>
                                        <EmptyHint>
                                            Type a label name above and press Enter or click Add Label
                                        </EmptyHint>
                                    </EmptyState>
                                )}
                            </SectionContent>
                        )}
                    </CardSection>

                    <SectionDivider />

                    {/* Footer */}
                    <CardFooter>
                        <FooterBadge>
                            <Tag size={14} />
                            Label Geometry
                        </FooterBadge>
                        <FooterRight>
                            <CompleteBadge>Complete by 1/13/2025</CompleteBadge>
                        </FooterRight>
                    </CardFooter>
                </TaskCard>

                {/* Action Buttons */}
                <ActionButtons>
                    <CancelButton $variant="secondary" onClick={onCancel}>
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        $variant="primary"
                        onClick={handleSubmit}
                        disabled={labels.length === 0}
                    >
                        Submit for Approval
                    </SubmitButton>
                </ActionButtons>
            </ContentWrapper>
        </Container>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TaskIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.accentPrimary};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
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

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  align-items: center;
`;

const StatusBadge = styled.div`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background: ${({ theme }) => theme.colors.accentPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  font-family: ${({ theme }) => theme.typography.family.mono};
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[6]};
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
`;

const TaskCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
`;

const CardSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  cursor: pointer;
  user-select: none;
  transition: background ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundTertiary};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  text-transform: capitalize;
`;

const ExpandIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: transform ${({ theme }) => theme.animation.duration.fast};
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: 0 ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[4]};
`;

const DetailLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const DetailValue = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
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
  width: fit-content;
`;

const MonoText = styled.span`
  font-family: ${({ theme }) => theme.typography.family.mono};
  color: ${({ theme }) => theme.colors.accentPrimary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const SectionDivider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.colors.borderSubtle};
`;

const LabelInputRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const LabelInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-family: ${({ theme }) => theme.typography.family.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brandPrimary};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const AddButton = styled(BaseButton)`
  white-space: nowrap;
`;

const LabelsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const LabelChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: background ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundQuaternary};
  }
`;

const LabelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1;
  min-width: 0;
`;

const LabelIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.accentPrimary};
  flex-shrink: 0;
`;

const LabelName = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  font-family: ${({ theme }) => theme.typography.family.mono};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.statusError};
    color: ${({ theme }) => theme.colors.textInverted};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[6]};
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EmptyIcon = styled.div`
  display: flex;
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const EmptyHint = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  max-width: 300px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  gap: ${({ theme }) => theme.spacing[3]};
`;

const FooterBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => `${theme.primitives.paddingX.xxxs} ${theme.primitives.paddingX.xsm}`};
  background: ${({ theme }) => theme.colors.accentPrimary};
  color: ${({ theme }) => theme.primitives.colors.text1000};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.xsm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const CompleteBadge = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xsm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const CancelButton = styled(BaseButton)`
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-color: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SubmitButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.statusSuccess};
  border-color: ${({ theme }) => theme.colors.statusSuccess};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.statusSuccess};
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;