import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { TaskContext } from "../home/types/types";
import { GeometryData } from "../types/geometry.types";
import { SimpleLabelCreator } from "../simpleLabelCreator/SimpleLabelCreator";

interface GeoLabelManagerWrapperProps {
  taskContext: TaskContext;
  geometryData: GeometryData | null;
  onSubmitLabels: (taskId: string, labels: string[]) => void;
  onCancel: () => void;
}

export const GeoLabelManagerWrapper: React.FC<GeoLabelManagerWrapperProps> = ({
  taskContext,
  geometryData,
  onSubmitLabels,
  onCancel,
}) => {
  const [labelCount, setLabelCount] = useState(0);

  const handleLabelsChange = useCallback((count: number) => {
    setLabelCount(count);
  }, []);

  const handleSubmit = () => {
    // Extract label names from localStorage (where GeoLabelManager saves them)
    try {
      const storageKey = `labels_${taskContext.geometryId}`;
      const savedLabels = localStorage.getItem(storageKey);
      
      if (savedLabels) {
        const labelsData = JSON.parse(savedLabels);
        const labelNames = labelsData.map((label: any) => label.name);
        onSubmitLabels(taskContext.taskId, labelNames);
      } else if (labelCount > 0) {
        // Fallback: submit with placeholder if we know labels exist
        const placeholderLabels = Array.from({ length: labelCount }, (_, i) => `Label ${i + 1}`);
        onSubmitLabels(taskContext.taskId, placeholderLabels);
      } else {
        alert("Please create at least one label before submitting");
      }
    } catch (error) {
      console.error("Error extracting labels:", error);
      alert("Error extracting labels. Please try again.");
    }
  };

  // No geometry loaded - show SimpleLabelCreator as fallback
  if (!geometryData) {
    return (
      <Container>
        <NoGeometryMessage>
          <MessageCard>
            <MessageIcon>⚠️</MessageIcon>
            <MessageTitle>No Geometry Loaded</MessageTitle>
            <MessageText>
              To use the full geometry labeler with 3D visualization, please load a demo geometry
              file from the Home view first.
            </MessageText>
            <MessageDivider />
            <MessageText>
              You can still create labels using the simplified form below:
            </MessageText>
          </MessageCard>
        </NoGeometryMessage>

        <SimpleLabelCreator
          taskContext={taskContext}
          onSubmit={onSubmitLabels}
          onCancel={onCancel}
        />
      </Container>
    );
  }

  // Geometry loaded - show full GeoLabelManager
  return (
    <Container>
      <GeoLabelManagerContainer>
        {/* <GeoLabelManager
          geometryData={geometryData}
          geometryId={taskContext.geometryId}
          geometryMetadata={{
            filename: taskContext.geometryName,
            originalPath: taskContext.modelId,
          }}
          onLabelsChange={handleLabelsChange}
        /> */}
      </GeoLabelManagerContainer>

      <SubmitBar>
        <TaskInfo>
          <TaskInfoLabel>Task:</TaskInfoLabel>
          <TaskInfoValue>{taskContext.geometryName}</TaskInfoValue>
          <TaskInfoSeparator>•</TaskInfoSeparator>
          <LabelCount $hasLabels={labelCount > 0}>
            {labelCount} label{labelCount !== 1 ? "s" : ""} created
          </LabelCount>
        </TaskInfo>

        <SubmitActions>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={labelCount === 0}>
            Submit for Approval
          </SubmitButton>
        </SubmitActions>
      </SubmitBar>
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
`;

const NoGeometryMessage = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  display: flex;
  justify-content: center;
`;

const MessageCard = styled.div`
  max-width: 600px;
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.statusWarning};
`;

const MessageIcon = styled.div`
  font-size: 48px;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const MessageTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.xl};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;
  text-align: center;
`;

const MessageText = styled.p`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 ${({ theme }) => theme.spacing[3]} 0;
  line-height: 1.6;
  text-align: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MessageDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borderDefault};
  margin: ${({ theme }) => theme.spacing[4]} 0;
`;

const GeoLabelManagerContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

const SubmitBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const TaskInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TaskInfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
`;

const TaskInfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  font-family: ${({ theme }) => theme.typography.family.mono};
`;

const TaskInfoSeparator = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const LabelCount = styled.span<{ $hasLabels: boolean }>`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme, $hasLabels }) =>
    $hasLabels ? theme.colors.statusSuccess : theme.colors.textMuted};
  font-weight: ${({ theme, $hasLabels }) =>
    $hasLabels ? theme.typography.weight.semiBold : theme.typography.weight.regular};
`;

const SubmitActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const CancelButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
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