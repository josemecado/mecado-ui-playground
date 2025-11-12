import React from "react";
import styled from "styled-components";
import { Task } from "../types/types";
import {
  formatRelativeDate,
  formatDueDate,
  getPriorityColor,
  getPriorityLabel,
  getTaskTypeIcon,
  getTaskTypeLabel,
} from "../utils/taskHelpers";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const isPending = task.status === "pending";
  const isApproved = task.status === "approved";
  const isFailed = task.status === "failed";

  const showReviewInfo = isPending || isApproved || isFailed;

  return (
    <CardContainer onClick={() => onClick(task)}>
      {/* Header with type */}
      <CardHeader>
        <TypeBadge>
          <TypeIcon>{getTaskTypeIcon(task.type)}</TypeIcon>
          <TypeLabel>{getTaskTypeLabel(task.type)}</TypeLabel>
        </TypeBadge>

        <PriorityBadge $color={getPriorityColor(task.priority)}>
          {getPriorityLabel(task.priority)}
        </PriorityBadge>
      </CardHeader>

      {/* Main content - will be different per task type */}
      <CardContent>
        {task.type === "geometry_labeling" && (
          <>
            <GeometryName>{task.geometryName}</GeometryName>
            {task.description && <Description>{task.description}</Description>}
            <MetadataRow>
              <MetadataItem>
                <MetadataIcon>📦</MetadataIcon>
                <MetadataText>{task.modelId}</MetadataText>
              </MetadataItem>
              <MetadataItem>
                <MetadataIcon>🔷</MetadataIcon>
                <MetadataText>{task.geometryType}</MetadataText>
              </MetadataItem>
            </MetadataRow>

            {/* REPLACE THIS SECTION */}
            {task.labels && task.labels.length > 0 && (
              <LabelInfo>
                <LabelsList>
                  {task.labels.map((label, idx) => (
                    <LabelBadge key={idx}>{label}</LabelBadge>
                  ))}
                </LabelsList>
                {task.confidence && (
                  <ConfidenceText>
                    {Math.round(task.confidence * 100)}%
                  </ConfidenceText>
                )}
              </LabelInfo>
            )}
            {/* Fallback to old single label for backward compatibility */}
            {!task.labels && task.labelName && (
              <LabelInfo>
                <LabelBadge>Label: {task.labelName}</LabelBadge>
                {task.confidence && (
                  <ConfidenceText>
                    {Math.round(task.confidence * 100)}%
                  </ConfidenceText>
                )}
              </LabelInfo>
            )}
          </>
        )}

        {task.type === "geometry_upload" && (
          <>
            <GeometryName>{task.batchName}</GeometryName>
            <Description>{task.description}</Description>

            <ProgressSection>
              <ProgressBar>
                <ProgressFill
                  $percent={
                    (task.uploadedFileCount / task.requiredFileCount) * 100
                  }
                />
              </ProgressBar>
              <ProgressText>
                {task.uploadedFileCount}/{task.requiredFileCount} files
              </ProgressText>
            </ProgressSection>
          </>
        )}
      </CardContent>

      {/* Footer with dates and status info */}
      <CardFooter>
        {task.dueDate && !showReviewInfo && (
          <DueDateText $overdue={new Date(task.dueDate) < new Date()}>
            ⏰ {formatDueDate(task.dueDate)}
          </DueDateText>
        )}

        {showReviewInfo && (
          <StatusSection>
            {isPending && (
              <StatusText>
                ⏳ Submitted {formatRelativeDate(task.submittedAt!)}
              </StatusText>
            )}

            {isApproved && (
              <StatusText $success>
                ✅ Approved {formatRelativeDate(task.reviewedAt!)}
              </StatusText>
            )}

            {isFailed && (
              <>
                <StatusText $error>
                  ❌ Rejected {formatRelativeDate(task.reviewedAt!)}
                </StatusText>
                {task.reviewNotes && (
                  <ReviewNotes>💬 {task.reviewNotes}</ReviewNotes>
                )}
              </>
            )}
          </StatusSection>
        )}

        {!showReviewInfo && (
          <CreatedText>
            Created {formatRelativeDate(task.createdAt)}
          </CreatedText>
        )}
      </CardFooter>
    </CardContainer>
  );
};

// ======================
// 🔹 Styled Components
// ======================

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.standard};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TypeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const TypeIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.size.lg};
`;

const TypeLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PriorityBadge = styled.div<{ $color: string }>`
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme, $color }) =>
    theme.colors[$color as keyof typeof theme.colors]};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  opacity: 0.9;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const GeometryName = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.4;
`;

const MetadataRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const MetadataIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const MetadataText = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.accentPrimary};
  font-family: ${({ theme }) => theme.typography.family.mono};
`;

const LabelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[1]};
  flex-wrap: wrap;
`;

const LabelBadge = styled.div`
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ConfidenceText = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.statusSuccess};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.pill};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ theme }) => theme.colors.brandPrimary};
  transition: width ${({ theme }) => theme.animation.duration.medium} ${({ theme }) => theme.animation.easing.standard};
`;

const ProgressText = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.typography.family.mono};
`;

const CardFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  padding-top: ${({ theme }) => theme.spacing[2]};
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const DueDateText = styled.span<{ $overdue?: boolean }>`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme, $overdue }) =>
    $overdue ? theme.colors.statusError : theme.colors.accentPrimary};
  font-weight: ${({ $overdue }) => ($overdue ? 600 : 400)};
`;

const CreatedText = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const StatusText = styled.span<{ $success?: boolean; $error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme, $success, $error }) => {
    if ($success) return theme.colors.statusSuccess;
    if ($error) return theme.colors.statusError;
    return theme.colors.statusWarning;
  }};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const ReviewNotes = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  padding: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  font-style: italic;
  line-height: 1.4;
`;


// ADD THIS NEW COMPONENT
const LabelsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
`;
