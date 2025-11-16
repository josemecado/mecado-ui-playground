// admin/components/ReviewSubmissionModal.tsx
import React, {useState} from "react";
import styled from "styled-components";
import {X, CheckCircle2, XCircle} from "lucide-react";
import {UnifiedTask, ReviewAction} from "../types/admin.types";
import {BaseButton} from "components/buttons/BaseButton";
import {getUsernameFromEmail, formatFileSize} from "../utils/adminHelpers";

interface ReviewSubmissionModalProps {
    task: UnifiedTask;
    onApprove: (action: ReviewAction) => void;
    onReject: (action: ReviewAction) => void;
    onClose: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
                                                                                task,
                                                                                onApprove,
                                                                                onReject,
                                                                                onClose,
                                                                            }) => {
    const [reviewNotes, setReviewNotes] = useState("");
    const [isApproving, setIsApproving] = useState(true);

    const isUploadReview = task.stage === 'upload_review';
    const isLabelingReview = task.stage === 'labeling_review';

    const handleSubmit = () => {
        const action: ReviewAction = {
            taskId: task.id,
            approved: isApproving,
            notes: reviewNotes,
        };

        if (isApproving) {
            onApprove(action);
        } else {
            onReject(action);
        }
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        {isUploadReview ? 'Review Upload' : 'Review Labels'}
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        <X size={20}/>
                    </CloseButton>
                </ModalHeader>

                <ModalBody>
                    {/* Task Info */}
                    <TaskInfoSection>
                        <InfoLabel>Task:</InfoLabel>
                        <InfoValue>{task.title}</InfoValue>
                    </TaskInfoSection>

                    <TaskInfoSection>
                        <InfoLabel>Assigned to:</InfoLabel>
                        <InfoValue>{getUsernameFromEmail(task.assignedTo)}</InfoValue>
                    </TaskInfoSection>

                    <TaskInfoSection>
                        <InfoLabel>Description:</InfoLabel>
                        <InfoValue>{task.description}</InfoValue>
                    </TaskInfoSection>

                    {/* Upload Review Content */}
                    {isUploadReview && task.uploadData && (
                        <SubmissionSection>
                            <SectionTitle>Uploaded Files</SectionTitle>
                            <FileList>
                                {task.uploadData.uploadedFiles.map((file, idx) => (
                                    <FileItem key={idx}>
                                        <FileName>{file.name}</FileName>
                                        <FileSize>{formatFileSize(file.size)}</FileSize>
                                    </FileItem>
                                ))}
                            </FileList>
                            <ProgressText>
                                {task.uploadData.uploadedFiles.length} of {task.uploadData.requiredFileCount} files
                                uploaded
                            </ProgressText>
                        </SubmissionSection>
                    )}

                    {/* Labeling Review Content */}
                    {isLabelingReview && task.labelingData && (
                        <SubmissionSection>
                            <SectionTitle>Applied Labels</SectionTitle>
                            <LabelList>
                                {task.labelingData.labels.map((label, idx) => (
                                    <LabelChip key={idx}>{label}</LabelChip>
                                ))}
                            </LabelList>
                        </SubmissionSection>
                    )}

                    {/* Review Decision Tabs */}
                    <DecisionTabs>
                        <DecisionTab
                            $active={isApproving}
                            onClick={() => setIsApproving(true)}
                        >
                            <CheckCircle2 size={16}/>
                            Approve
                        </DecisionTab>
                        <DecisionTab
                            $active={!isApproving}
                            onClick={() => setIsApproving(false)}
                        >
                            <XCircle size={16}/>
                            Reject
                        </DecisionTab>
                    </DecisionTabs>

                    {/* Review Notes */}
                    <NotesSection>
                        <NotesLabel>
                            {isApproving ? 'Review Notes (Optional)' : 'Rejection Reason (Required)'}
                        </NotesLabel>
                        <NotesTextarea
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder={
                                isApproving
                                    ? 'Add any notes about this submission...'
                                    : 'Explain why this submission is being rejected...'
                            }
                            rows={4}
                        />
                    </NotesSection>
                </ModalBody>

                <ModalFooter>
                    <CancelButton $variant="secondary" onClick={onClose}>
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        $variant="primary"
                        onClick={handleSubmit}
                        disabled={!isApproving && !reviewNotes.trim()}
                    >
                        {isApproving ? 'Approve' : 'Reject'}
                    </SubmitButton>
                </ModalFooter>
            </ModalContainer>
        </ModalOverlay>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: ${({theme}) => theme.spacing[4]};
`;

const ModalContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    background: ${({theme}) => theme.colors.backgroundSecondary};
    border-radius: ${({theme}) => theme.radius.lg};
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({theme}) => theme.primitives.paddingX.lg};
    border-bottom: 1px solid ${({theme}) => theme.colors.borderDefault};
`;

const ModalTitle = styled.h2`
    font-size: ${({theme}) => theme.typography.size.xl};
    font-weight: ${({theme}) => theme.typography.weight.semiBold};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: ${({theme}) => theme.colors.textMuted};
    cursor: pointer;
    padding: ${({theme}) => theme.primitives.padding.xxs};
    border-radius: ${({theme}) => theme.radius.sm};

    &:hover {
        background: ${({theme}) => theme.colors.backgroundTertiary};
        color: ${({theme}) => theme.colors.textPrimary};
    }
`;

const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[4]};
    padding: ${({theme}) => theme.primitives.paddingX.lg};
    overflow-y: auto;
    flex: 1;
`;

const TaskInfoSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[1]};
`;

const InfoLabel = styled.span`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMuted};
`;

const InfoValue = styled.span`
    font-size: ${({theme}) => theme.typography.size.md};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const SubmissionSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
    padding: ${({theme}) => theme.primitives.paddingX.md};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border-radius: ${({theme}) => theme.radius.md};
`;

const SectionTitle = styled.h3`
    font-size: ${({theme}) => theme.typography.size.md};
    font-weight: ${({theme}) => theme.typography.weight.semiBold};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
`;

const FileList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
`;

const FileItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({theme}) => theme.primitives.paddingX.xsm};
    background: ${({theme}) => theme.colors.backgroundSecondary};
    border-radius: ${({theme}) => theme.radius.sm};
`;

const FileName = styled.span`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-family: ${({theme}) => theme.typography.family.mono};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const FileSize = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textMuted};
`;

const ProgressText = styled.p`
    font-size: ${({theme}) => theme.typography.size.sm};
    color: ${({theme}) => theme.colors.textMuted};
    margin: 0;
`;

const LabelList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing[2]};
`;

const LabelChip = styled.span`
    padding: ${({theme}) => `${theme.primitives.paddingY.xxs} ${theme.primitives.paddingX.sm}`};
    background: ${({theme}) => theme.colors.brandPrimary};
    color: ${({theme}) => theme.colors.textInverted};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
`;

const DecisionTabs = styled.div`
    display: flex;
    gap: ${({theme}) => theme.spacing[2]};
    border-bottom: 2px solid ${({theme}) => theme.colors.borderSubtle};
`;

const DecisionTab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding: ${({theme}) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
    background: none;
    border: none;
    border-bottom: 2px solid ${({theme, $active}) =>
            $active ? theme.colors.brandPrimary : 'transparent'};
    color: ${({theme, $active}) =>
            $active ? theme.colors.brandPrimary : theme.colors.textMuted};
    font-size: ${({theme}) => theme.typography.size.md};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    cursor: pointer;
    margin-bottom: -2px;
    transition: all ${({theme}) => theme.animation.duration.fast};

    &:hover {
        color: ${({theme}) => theme.colors.brandPrimary};
    }
`;

const NotesSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
`;

const NotesLabel = styled.label`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const NotesTextarea = styled.textarea`
    padding: ${({theme}) => theme.primitives.paddingX.sm};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border: 1px solid ${({theme}) => theme.colors.borderDefault};
    border-radius: ${({theme}) => theme.radius.md};
    color: ${({theme}) => theme.colors.textPrimary};
    font-size: ${({theme}) => theme.typography.size.md};
    font-family: ${({theme}) => theme.typography.family.base};
    resize: vertical;
    min-height: 80px;

    &:focus {
        outline: none;
        border-color: ${({theme}) => theme.colors.brandPrimary};
    }

    &::placeholder {
        color: ${({theme}) => theme.colors.textMuted};
    }
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${({theme}) => theme.spacing[3]};
    padding: ${({theme}) => theme.primitives.paddingX.lg};
    border-top: 1px solid ${({theme}) => theme.colors.borderDefault};
`;

const CancelButton = styled(BaseButton)`
    padding: ${({theme}) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.lg}`};
    background: transparent;
    color: ${({theme}) => theme.colors.textPrimary};
    border: 1px solid ${({theme}) => theme.colors.borderDefault};

    &:hover:not(:disabled) {
        background: ${({theme}) => theme.colors.backgroundTertiary};
    }
`;

const SubmitButton = styled(BaseButton)`
    padding: ${({theme}) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.lg}`};
    background: ${({theme}) => theme.colors.brandPrimary};
    color: ${({theme}) => theme.colors.textInverted};

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;