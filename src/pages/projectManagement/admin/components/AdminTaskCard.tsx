// admin/components/AdminTaskCard.tsx
import React, { useState } from "react";
import styled from "styled-components";
import {
    FileText,
    ChevronDown,
    ChevronUp,
    Upload,
    Tag,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { UnifiedTask } from "../types/admin.types";
import {
    formatFileSize,
    getUsernameFromEmail,
} from "../utils/adminHelpers";
import {BaseButton} from "components/buttons/BaseButton";

interface AdminTaskCardProps {
    task: UnifiedTask;
    onViewSubmission?: (task: UnifiedTask) => void;
    onEdit?: (task: UnifiedTask) => void;
}

export const AdminTaskCard: React.FC<AdminTaskCardProps> = ({
                                                                task,
                                                                onViewSubmission,
                                                                onEdit,
                                                            }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAttachmentsExpanded, setIsAttachmentsExpanded] = useState(false);

    // Determine task state and stage
    const isAwaitingReview = task.stage === 'upload_review' || task.stage === 'labeling_review';
    const isCompleted = task.stage === 'completed' || task.stage === 'labeling_approved';
    const isInProgress = !isAwaitingReview && !isCompleted;

    // Determine which stage (upload or labeling)
    const isUploadStage = task.stage === 'pending_upload' || task.stage === 'upload_review' || task.stage === 'upload_approved';
    const isLabelingStage = task.stage === 'pending_labeling' || task.stage === 'labeling_review' || task.stage === 'labeling_approved' || task.stage === 'completed';

    // Get review data
    const uploadReview = task.uploadData?.review;
    const labelingReview = task.labelingData?.review;
    const hasRejection = (uploadReview && !uploadReview.approved) || (labelingReview && !labelingReview.approved);
    const rejectionReason = uploadReview && !uploadReview.approved
        ? uploadReview.notes
        : labelingReview && !labelingReview.approved
            ? labelingReview.notes
            : null;

    const approvalNotes = isCompleted && labelingReview?.approved
        ? labelingReview.notes
        : isCompleted && uploadReview?.approved
            ? uploadReview.notes
            : null;

    // Get status badge text
    const getStatusBadgeText = () => {
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

    const assignedUser = getUsernameFromEmail(task.assignedTo);

    return (
        <CardContainer>
            {/* Header with stage icon and title */}
            <CardHeader>
                <StageIcon $isUpload={isUploadStage}>
                    {isUploadStage ? <Upload size={16} /> : <Tag size={16} />}
                </StageIcon>
                <CardTitle>{task.title}</CardTitle>
            </CardHeader>

            {/* Description Section */}
            <ExpandableSection>
                <SectionHeader onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                    <SectionTitle>Description</SectionTitle>
                    <ExpandIcon>
                        {isDescriptionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </ExpandIcon>
                </SectionHeader>
                {isDescriptionExpanded && (
                    <SectionContent>
                        <DescriptionText>{task.description}</DescriptionText>
                        {task.requirements && (
                            <RequirementsText>{task.requirements}</RequirementsText>
                        )}
                    </SectionContent>
                )}
            </ExpandableSection>

            {/* Attachments Section */}
            {task.uploadData && task.uploadData.uploadedFiles.length > 0 && (
                <ExpandableSection>
                    <SectionHeader onClick={() => setIsAttachmentsExpanded(!isAttachmentsExpanded)}>
                        <SectionTitle>Attachments</SectionTitle>
                        <ExpandIcon>
                            {isAttachmentsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </ExpandIcon>
                    </SectionHeader>
                    {isAttachmentsExpanded && (
                        <SectionContent>
                            {task.uploadData.uploadedFiles.map((file, idx) => (
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
                        </SectionContent>
                    )}
                </ExpandableSection>
            )}

            {/* Rejection Reason Section (only if rejected) */}
            {hasRejection && rejectionReason && (
                <RejectionSection>
                    <SectionHeader>
                        <SectionTitle>Rejection Reason</SectionTitle>
                    </SectionHeader>
                    <RejectionContent>
                        <RejectionText>{rejectionReason}</RejectionText>
                    </RejectionContent>
                </RejectionSection>
            )}

            {/* Review Notes Section (only if completed with notes) */}
            {isCompleted && approvalNotes && (
                <ReviewNotesSection>
                    <SectionHeader>
                        <SectionTitle>Review Notes</SectionTitle>
                    </SectionHeader>
                    <ReviewNotesContent>
                        <ReviewNotesText>{approvalNotes}</ReviewNotesText>
                    </ReviewNotesContent>
                </ReviewNotesSection>
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

            {/* Footer with status and action button */}
            <CardFooter>
                <StatusBadge $stage={task.stage}>
                    {getStatusBadgeText()}
                </StatusBadge>

                {isAwaitingReview && (
                    <ActionButton
                        $variant="primary"
                        onClick={() => onViewSubmission?.(task)}
                    >
                        View Submission
                    </ActionButton>
                )}

                {isInProgress && (
                    <ActionButton
                        $variant="secondary"
                        onClick={() => onEdit?.(task)}
                    >
                        Edit
                    </ActionButton>
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
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.primitives.paddingX.sm};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.lg};
    transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.standard};

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderDefault};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
`;

const StageIcon = styled.div<{ $isUpload: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${({ theme, $isUpload }) =>
            $isUpload ? theme.colors.accentPrimary : theme.colors.brandPrimary};
    color: ${({ theme }) => theme.colors.textInverted};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const CardTitle = styled.h3`
    font-size: ${({ theme }) => theme.typography.size.md};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
    flex: 1;
`;

const ExpandableSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxs} 0`};
    cursor: pointer;
    user-select: none;

    &:hover {
        opacity: 0.8;
    }
`;

const SectionTitle = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textMuted};
`;

const ExpandIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const SectionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.primitives.paddingX.xsm};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-radius: ${({ theme }) => theme.radius.md};
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

const RejectionSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const RejectionContent = styled.div`
    padding: ${({ theme }) => theme.primitives.paddingX.xsm};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-left: 3px solid ${({ theme }) => theme.colors.statusError};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const RejectionText = styled.p`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.statusError};
    margin: 0;
    line-height: 1.5;
`;

const ReviewNotesSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const ReviewNotesContent = styled.div`
    padding: ${({ theme }) => theme.primitives.paddingX.xsm};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-left: 3px solid ${({ theme }) => theme.colors.statusSuccess};
    border-radius: ${({ theme }) => theme.radius.md};
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

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding-top: ${({ theme }) => theme.spacing[2]};
    border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const StatusBadge = styled.div<{ $stage: string }>`
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    color: ${({ theme }) => theme.colors.textMuted};
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const ActionButton = styled(BaseButton)`
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxs} ${theme.primitives.paddingX.sm}`};
    font-size: ${({ theme }) => theme.typography.size.sm};
    border-radius: ${({ theme }) => theme.radius.md};
    min-width: 120px;

    ${({ $variant, theme }) => $variant === 'primary' && `
        background: ${theme.colors.brandPrimary};
        color: ${theme.colors.textInverted};
        
        &:hover:not(:disabled) {
            opacity: 0.9;
        }
    `}

    ${({ $variant, theme }) => $variant === 'secondary' && `
        background: transparent;
        color: ${theme.colors.textPrimary};
        border: 1px solid ${theme.colors.borderDefault};
        
        &:hover:not(:disabled) {
            background: ${theme.colors.backgroundTertiary};
        }
    `}
`;