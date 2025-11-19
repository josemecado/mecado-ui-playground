// admin/components/card/AdminTaskCard.tsx
import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Tags, FileText, CheckCircle2, FileBox } from "lucide-react";
import { UnifiedTask, User } from "../../../types";
import { formatFileSize } from "../../utils/adminHelpers";
import { TaskCardHeader } from "./card-components/TaskCardHeader";
import { TaskCardExpandableSection } from "./card-components/TaskCardExpandableSection";
import { TaskCardFooter } from "./card-components/TaskCardFooter";
import { TaskCardQuickAssign } from "./card-components/TaskCardQuickAssign";

interface AdminTaskCardProps {
    task: UnifiedTask;
    availableUsers?: User[];
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
    onAssign?: (taskId: string, userEmail: string) => void;
}

export const AdminTaskCard: React.FC<AdminTaskCardProps> = ({
                                                                task,
                                                                availableUsers = [],
                                                                onViewSubmission,
                                                                onEdit,
                                                                onAssign,
                                                            }) => {
    // Expansion state
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAttachmentsExpanded, setIsAttachmentsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check if task is unassigned
    const isUnassigned = !task.assignedTo;

    // Determine task state and stage
    const isAwaitingReview = task.stage === 'upload_review' || task.stage === 'labeling_review';
    const isCompleted = task.stage === 'completed' || task.stage === 'labeling_approved';
    const isInProgress = !isAwaitingReview && !isCompleted && !isUnassigned;

    // Determine which stage (upload or labeling)
    const isUploadStage = task.stage === 'pending_upload' || task.stage === 'upload_review' || task.stage === 'upload_approved';

    // Get review data
    const uploadReview = task.uploadData?.review;
    const labelingReview = task.labelingData?.review;
    const hasRejection = (uploadReview && !uploadReview.approved) || (labelingReview && !labelingReview.approved);
    const rejectionReason = uploadReview && !uploadReview.approved
        ? uploadReview.notes
        : labelingReview && !labelingReview.approved
            ? labelingReview.notes
            : null;

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 400);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setIsHovered(false);
    };

    const handleAssign = (userEmail: string) => {
        if (onAssign) {
            onAssign(task.id, userEmail);
        }
    };

    // Get status badge text
    const getStatusBadgeText = () => {
        if (isUnassigned) return 'Unassigned';

        switch (task.stage) {
            case 'pending_upload':
                return 'Pending Upload';
            case 'upload_review':
                return 'Pending Approval';
            case 'upload_approved':
            case 'pending_labeling':
                return 'Pending Labeling';
            case 'labeling_review':
                return 'Pending Approval';
            case 'labeling_approved':
            case 'completed':
                return 'Completed';
            default:
                return 'In Progress';
        }
    };

    return (
        <CardContainer
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Header */}
            <TaskCardHeader
                task={task}
                icon={isUploadStage ? <FileBox size={14} /> : <Tags size={14} />}
                isUploadStage={isUploadStage}
            />

            {/* Unassigned Banner */}
            {isUnassigned && (
                <UnassignedBanner>
                    <BannerText>This task needs to be assigned</BannerText>
                </UnassignedBanner>
            )}

            {/* Description Section */}
            <TaskCardExpandableSection
                title="Description"
                isExpanded={isHovered || isDescriptionExpanded}
                onToggle={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
                <DescriptionText>{task.description}</DescriptionText>
                {task.requirements && (
                    <RequirementsText>Requirements: {task.requirements}</RequirementsText>
                )}
            </TaskCardExpandableSection>

            {/* Attachments Section */}
            {((task.uploadData && task.uploadData.uploadedFiles.length > 0) ||
                (task.referenceLinks && task.referenceLinks.length > 0)) && (
                <TaskCardExpandableSection
                    title="Attachments"
                    isExpanded={isHovered || isAttachmentsExpanded}
                    onToggle={() => setIsAttachmentsExpanded(!isAttachmentsExpanded)}
                >
                    {task.uploadData?.uploadedFiles.map((file, idx) => (
                        <FileRow key={idx}>
                            <FileInfo>
                                <FileIcon>
                                    <FileText size={14} />
                                </FileIcon>
                                <FileName>{file.name}</FileName>
                            </FileInfo>
                            <FileSize>{formatFileSize(file.size)}</FileSize>
                        </FileRow>
                    ))}

                    {task.referenceLinks && task.referenceLinks.length > 0 && (
                        <>
                            {task.referenceLinks.map((link, idx) => (
                                <FileRow key={`link-${idx}`}>
                                    <FileInfo>
                                        <FileIcon>🔗</FileIcon>
                                        <FileName>{link}</FileName>
                                    </FileInfo>
                                    <FileSize>n/a</FileSize>
                                </FileRow>
                            ))}
                        </>
                    )}
                </TaskCardExpandableSection>
            )}

            {/* Rejection Reason Section (only if rejected) */}
            {hasRejection && rejectionReason && (
                <TaskCardExpandableSection
                    title="Rejection Reason"
                    isExpanded={true}
                    onToggle={() => {}}
                    alwaysOpen
                >
                    <RejectionText>{rejectionReason}</RejectionText>
                </TaskCardExpandableSection>
            )}

            {/* Review Notes Section (if any review has notes) */}
            {((uploadReview?.notes && uploadReview.approved) || (labelingReview?.notes && labelingReview.approved)) && (
                <TaskCardExpandableSection
                    title="Review Notes"
                    isExpanded={true}
                    onToggle={() => {}}
                    alwaysOpen
                >
                    <ReviewNotesText>
                        {uploadReview?.approved && uploadReview.notes
                            ? uploadReview.notes
                            : labelingReview?.notes}
                    </ReviewNotesText>
                </TaskCardExpandableSection>
            )}

            {/* Labels Section (if in labeling stage and has labels) */}
            {task.labelingData && task.labelingData.labels.length > 0 && (
                <LabelsRow>
                    {task.labelingData.labels.slice(0, 2).map((label, idx) => (
                        <LabelBadge key={idx}>
                            <CheckCircle2 size={12} />
                            {label}
                        </LabelBadge>
                    ))}
                    {task.labelingData.labels.length > 2 && (
                        <LabelBadge>
                            <CheckCircle2 size={12} />
                            +{task.labelingData.labels.length - 2}
                        </LabelBadge>
                    )}
                </LabelsRow>
            )}

            {/* Footer */}
            <TaskCardFooter
                statusText={getStatusBadgeText()}
                stage={task.stage}
                showViewSubmission={isAwaitingReview}
                showEdit={isInProgress}
                onViewSubmission={() => onViewSubmission?.(task)}
                onEdit={() => onEdit?.(task)}
            >
                {/* Quick Assign for unassigned tasks */}
                {isUnassigned && availableUsers.length > 0 && (
                    <TaskCardQuickAssign
                        currentAssignee={task.assignedTo}
                        availableUsers={availableUsers}
                        onAssign={handleAssign}
                    />
                )}
            </TaskCardFooter>
        </CardContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: ${({ theme }) => theme.components.card.width};
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.components.card.padding.containerPadding};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.lg};
    transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.standard};

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderDefault};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
`;

const UnassignedBanner = styled.div`
    display: flex;
    align-items: center;
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    background: ${({ theme }) => theme.colors.statusWarning}22;
    border-left: 3px solid ${({ theme }) => theme.colors.statusWarning};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const BannerText = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const DescriptionText = styled.p`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
    line-height: 1.5;
`;

const RequirementsText = styled.p`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    margin: 0;
    line-height: 1.5;
    font-style: italic;
`;

const FileRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const FileInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const FileIcon = styled.span`
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const FileName = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.family.mono};
`;

const FileSize = styled.span`
    font-size: ${({ theme }) => theme.typography.size.xsm};
    color: ${({ theme }) => theme.colors.textMuted};
`;

const RejectionText = styled.p`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.statusError};
    margin: 0;
    line-height: 1.5;
`;

const ReviewNotesText = styled.p`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
    line-height: 1.5;
`;

const LabelsRow = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[1]};
    flex-wrap: wrap;
`;

const LabelBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({ theme }) => theme.colors.statusSuccess};
    color: ${({ theme }) => theme.colors.textInverted};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;