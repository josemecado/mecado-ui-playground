// admin/components/AdminTaskCard.tsx
import React, {useState} from "react";
import styled from "styled-components";
import {Tags, FileText, CheckCircle2, FileBox} from "lucide-react";
import {UnifiedTask} from "../../types/admin.types";
import {formatFileSize, getUsernameFromEmail} from "../../utils/adminHelpers";
import {TaskCardHeader} from "./TaskCardHeader";
import {TaskCardExpandableSection} from "./TaskCardExpandableSection";
import {TaskCardFooter} from "./TaskCardFooter";

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
    // Expansion state
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

    return (
        <CardContainer>
            {/* Header */}
            <TaskCardHeader
                icon={isUploadStage ? <FileBox size={14}/> : <Tags size={14}/>}
                title={task.title}
                isUploadStage={isUploadStage}
            />

            {/* Description Section */}
            <TaskCardExpandableSection
                title="Description"
                isExpanded={isDescriptionExpanded}
                onToggle={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
                <DescriptionText>{task.description}</DescriptionText>
                {task.requirements && (
                    <RequirementsText>{task.requirements}</RequirementsText>
                )}
            </TaskCardExpandableSection>

            {/* Attachments Section */}
            {task.uploadData && task.uploadData.uploadedFiles.length > 0 && (
                <TaskCardExpandableSection
                    title="Attachments"
                    isExpanded={isAttachmentsExpanded}
                    onToggle={() => setIsAttachmentsExpanded(!isAttachmentsExpanded)}
                >
                    {task.uploadData.uploadedFiles.map((file, idx) => (
                        <FileRow key={idx}>
                            <FileInfo>
                                <FileIcon>
                                    <FileText size={14}/>
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
                    onToggle={() => {
                    }}
                    alwaysOpen
                >
                    <RejectionText>{rejectionReason}</RejectionText>
                </TaskCardExpandableSection>
            )}

            {/* Review Notes Section (only if completed with notes) */}
            {isCompleted && approvalNotes && (
                <TaskCardExpandableSection
                    title="Review Notes"
                    isExpanded={true}
                    onToggle={() => {
                    }}
                    alwaysOpen
                >
                    <ReviewNotesText>{approvalNotes}</ReviewNotesText>
                </TaskCardExpandableSection>
            )}

            {/* Labels Section (if in labeling stage and has labels) */}
            {task.labelingData && task.labelingData.labels.length > 0 && (
                <LabelsRow>
                    {task.labelingData.labels.slice(0, 2).map((label, idx) => (
                        <LabelBadge key={idx}>
                            <CheckCircle2 size={12}/>
                            {label}
                        </LabelBadge>
                    ))}
                    {task.labelingData.labels.length > 2 && (
                        <LabelBadge>
                            <CheckCircle2 size={12}/>
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
            />
        </CardContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
    padding: ${({theme}) => theme.components.card.padding.containerPadding};
    background: ${({theme}) => theme.colors.backgroundSecondary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.lg};
    transition: all ${({theme}) => theme.animation.duration.fast} ${({theme}) => theme.animation.easing.standard};

    &:hover {
        border-color: ${({theme}) => theme.colors.borderDefault};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
`;

const DescriptionText = styled.p`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
    line-height: 1.5;
`;

const RequirementsText = styled.p`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.textMuted};
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
    gap: ${({theme}) => theme.spacing[1]};
`;

const FileIcon = styled.span`
    display: flex;
    align-items: center;
    color: ${({theme}) => theme.colors.textMuted};
`;

const FileName = styled.span`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.textPrimary};
    font-family: ${({theme}) => theme.typography.family.mono};
`;

const FileSize = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textMuted};
`;

const RejectionText = styled.p`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.statusError};
    margin: 0;
    line-height: 1.5;
`;

const ReviewNotesText = styled.p`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
    line-height: 1.5;
`;

const LabelsRow = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing[1]};
    flex-wrap: wrap;
`;

const LabelBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding: ${({theme}) => `${theme.primitives.paddingY.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({theme}) => theme.colors.statusSuccess};
    color: ${({theme}) => theme.colors.textInverted};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
`;