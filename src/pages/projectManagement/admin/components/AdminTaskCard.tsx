// admin/components/AdminTaskCard.tsx
import React, {useState} from "react";
import styled from "styled-components";
import {
    FileText,
    Paperclip,
    Calendar,
    Tag,
    ChevronDown,
    ChevronUp,
    User,
    AlertCircle,
    CheckCircle,
    Clock,
} from "lucide-react";
import {UnifiedTask} from "../types/admin.types";
import {
    formatRelativeDate,
    formatFileSize,
    getStageLabel,
    getPriorityInfo,
    getDaysUntilDue,
    isTaskOverdue,
    getUploadProgress,
    getUsernameFromEmail,
} from "../utils/adminHelpers";

interface AdminTaskCardProps {
    task: UnifiedTask;
    onClick: (task: UnifiedTask) => void;
}

export const AdminTaskCard: React.FC<AdminTaskCardProps> = ({task, onClick}) => {
    const [isFilesExpanded, setIsFilesExpanded] = useState(false);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

    const priorityInfo = getPriorityInfo(task.priority);
    const stageLabel = getStageLabel(task.stage);
    const daysUntilDue = getDaysUntilDue(task);
    const overdue = isTaskOverdue(task);
    const uploadProgress = getUploadProgress(task);
    const assignedUser = getUsernameFromEmail(task.assignedTo);

    const needsReview = task.stage === 'upload_review' || task.stage === 'labeling_review';
    const isCompleted = task.stage === 'completed' || task.stage === 'labeling_approved';
    const isFailed = task.stage === 'failed';

    // Get review data based on stage
    const reviewData =
        task.stage === 'upload_review' || task.stage === 'upload_approved'
            ? task.uploadData?.review
            : task.labelingData?.review;

    return (
        <CardContainer onClick={() => onClick(task)} $needsReview={needsReview}>
            {/* Title Row */}
            <TitleRow>
                <TitleIcon $priority={task.priority}>
                    <Tag size={14}/>
                </TitleIcon>
                <CardTitle>{task.title}</CardTitle>
            </TitleRow>

            <FooterSection>
                <AssignedTo>
                    <User size={12}/>
                    {assignedUser}
                </AssignedTo>
                <PriorityBadge $color={priorityInfo.color}>
                    {priorityInfo.label}
                </PriorityBadge>
            </FooterSection>

            <ContentSection>
                {/* Details Section */}
                <SectionHeaderRow>
                    <SectionHeader>Details</SectionHeader>
                    <CollapseButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDetailsExpanded(!isDetailsExpanded);
                        }}
                    >
                        {isDetailsExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </CollapseButton>
                </SectionHeaderRow>

                {isDetailsExpanded && (
                    <DetailsContent>
                        <DetailItem>
                            <DetailLabel>Description:</DetailLabel>
                            <DetailText>{task.description}</DetailText>
                        </DetailItem>

                        {task.requirements && (
                            <DetailItem>
                                <DetailLabel>Requirements:</DetailLabel>
                                <DetailText>{task.requirements}</DetailText>
                            </DetailItem>
                        )}

                        {reviewData && (
                            <DetailItem>
                                <DetailLabel>
                                    {reviewData.approved ? 'Review Notes:' : 'Rejection Reason:'}
                                </DetailLabel>
                                <DetailText $isError={!reviewData.approved}>
                                    {reviewData.notes}
                                </DetailText>
                            </DetailItem>
                        )}
                    </DetailsContent>
                )}
            </ContentSection>

            <StyledDivider/>

            {/* Upload Progress (if applicable) */}
            {task.uploadData && task.uploadData.requiredFileCount > 0 && (
                <ProgressSection>
                    <ProgressHeader>
                        <ProgressLabel>Upload Progress</ProgressLabel>
                        <ProgressPercentage>{uploadProgress}%</ProgressPercentage>
                    </ProgressHeader>
                    <ProgressBar>
                        <ProgressFill $progress={uploadProgress}/>
                    </ProgressBar>
                    <ProgressText>
                        {task.uploadData.uploadedFiles.length} of {task.uploadData.requiredFileCount} files uploaded
                    </ProgressText>
                </ProgressSection>
            )}

            {/* Associated Files Section */}
            {task.uploadData && task.uploadData.uploadedFiles.length > 0 && (
                <ContentSection>
                    <SectionHeaderRow>
                        <SectionHeader>Uploaded Files</SectionHeader>
                        <CollapseButton
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFilesExpanded(!isFilesExpanded);
                            }}
                        >
                            {isFilesExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </CollapseButton>
                    </SectionHeaderRow>

                    {isFilesExpanded && (
                        <FileList>
                            {task.uploadData.uploadedFiles.slice(0, 3).map((file, idx) => (
                                <FileItem key={idx}>
                                    <FileDetails>
                                        <FileIcon>
                                            <FileText size={15}/>
                                        </FileIcon>
                                        <FileName>{file.name}</FileName>
                                    </FileDetails>
                                    <FileSize>{formatFileSize(file.size)}</FileSize>
                                </FileItem>
                            ))}
                            {task.uploadData.uploadedFiles.length > 3 && (
                                <FileItem>
                                    <FileDetails>
                                        <FileIcon>
                                            <Paperclip size={15}/>
                                        </FileIcon>
                                        <FileName>{task.uploadData.uploadedFiles.length - 3} more...</FileName>
                                    </FileDetails>
                                </FileItem>
                            )}
                        </FileList>
                    )}
                </ContentSection>
            )}

            {/* Labels (if any) */}
            {task.labelingData && task.labelingData.labels.length > 0 && (
                <LabelsSection>
                    <SectionHeader>Applied Labels</SectionHeader>
                    <LabelChips>
                        {task.labelingData.labels.slice(0, 4).map((label, idx) => (
                            <LabelChip key={idx}>{label}</LabelChip>
                        ))}
                        {task.labelingData.labels.length > 4 && (
                            <LabelChip>+{task.labelingData.labels.length - 4} more</LabelChip>
                        )}
                    </LabelChips>
                </LabelsSection>
            )}

            <StyledDivider/>

            {/* Footer */}
            <FooterSection>
                <FooterLeft>
                    {/* Stage Badge */}
                    <StageBadge $stage={task.stage}>
                        {needsReview && <AlertCircle size={12}/>}
                        {isCompleted && <CheckCircle size={12}/>}
                        {isFailed && <AlertCircle size={12}/>}
                        {!needsReview && !isCompleted && !isFailed && <Clock size={12}/>}
                        {stageLabel}
                    </StageBadge>
                </FooterLeft>

                <FooterRight>
                    {task.dueDate && (
                        <DueDate $overdue={overdue}>
                            <Calendar size={12}/>
                            {daysUntilDue !== null && daysUntilDue >= 0
                                ? `${daysUntilDue}d left`
                                : overdue
                                    ? `${Math.abs(daysUntilDue || 0)}d overdue`
                                    : 'No due date'}
                        </DueDate>
                    )}
                    {task.updatedAt && (
                        <UpdatedAt>Updated {formatRelativeDate(task.updatedAt)}</UpdatedAt>
                    )}
                </FooterRight>
            </FooterSection>
        </CardContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const CardContainer = styled.div<{ $needsReview?: boolean }>`
    display: flex;
    flex-direction: column;
    padding: ${({theme}) => theme.padding.sm} ${({theme}) => theme.padding.xsm};
    gap: ${({theme}) => theme.primitives.spacing[2]};
    background: ${({theme}) => theme.colors.backgroundSecondary};
    border: 2px solid ${({theme, $needsReview}) =>
            $needsReview ? theme.colors.statusWarning : theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.lg};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: ${({theme, $needsReview}) =>
                $needsReview ? theme.colors.statusWarning : theme.colors.borderDefault};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const ContentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.primitives.spacing[1]};
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.primitives.spacing[1]};
    padding: ${({theme}) => theme.primitives.paddingX.xxs};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.md};
`;

const TitleIcon = styled.span<{ $priority: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({theme, $priority}) => {
        const colors = {
            urgent: '#ef4444',
            high: '#f59e0b',
            medium: '#3b82f6',
            low: '#6b7280',
        };
        return colors[$priority as keyof typeof colors] || theme.colors.brandPrimary;
    }};
    padding: ${({theme}) => theme.primitives.padding.xxs};
    border-radius: ${({theme}) => theme.primitives.radius.md};
    color: ${({theme}) => theme.colors.textInverted};
`;

const CardTitle = styled.h3`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textPrimary};
    margin: 0;
    flex: 1;
`;

const StageBadge = styled.div<{ $stage: string }>`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding: ${({theme}) => `${theme.primitives.paddingX.xxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({theme, $stage}) => {
        if ($stage.includes('review')) return theme.colors.statusWarning;
        if ($stage === 'completed' || $stage === 'labeling_approved') return theme.colors.statusSuccess;
        if ($stage === 'failed') return theme.colors.statusError;
        return theme.colors.accentPrimary;
    }};
    color: ${({theme}) => theme.colors.textInverted};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    width: fit-content;
`;

const SectionHeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SectionHeader = styled.div`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMuted};
    text-transform: capitalize;
`;

const CollapseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: ${({theme}) => theme.colors.textMuted};
    cursor: pointer;
    padding: ${({theme}) => theme.primitives.padding.xxs};
    border-radius: ${({theme}) => theme.radius.sm};
    transition: all 0.2s;

    &:hover {
        background: ${({theme}) => theme.colors.backgroundTertiary};
        color: ${({theme}) => theme.colors.textPrimary};
    }
`;

const DetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
    margin-bottom: ${({theme}) => theme.primitives.padding.xxs};
`;

const DetailItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.primitives.spacing[0.5]};
`;

const DetailLabel = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMuted};
`;

const DetailText = styled.p<{ $isError?: boolean }>`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme, $isError}) =>
            $isError ? theme.colors.statusError : theme.colors.textPrimary};
    margin: 0;
    padding: ${({theme}) => theme.primitives.paddingX.xsm};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border-radius: ${({theme}) => theme.radius.md};
    line-height: 1.4;
    ${({$isError, theme}) =>
            $isError &&
            `
    border-left: 2px solid ${theme.colors.statusError};
  `}
`;

const ProgressSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[1]};
    padding: ${({theme}) => theme.primitives.paddingX.xsm};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border-radius: ${({theme}) => theme.radius.md};
`;

const ProgressHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ProgressLabel = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMuted};
`;

const ProgressPercentage = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.semiBold};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 6px;
    background: ${({theme}) => theme.colors.backgroundPrimary};
    border-radius: ${({theme}) => theme.radius.pill};
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
    width: ${({$progress}) => $progress}%;
    height: 100%;
    background: ${({theme}) => theme.colors.brandPrimary};
    transition: width 0.3s ease;
`;

const ProgressText = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textMuted};
`;

const FileList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
`;

const FileItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const FileIcon = styled.span`
    display: flex;
    align-items: center;
    color: ${({theme}) => theme.colors.textMuted};
`;

const FileDetails = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.primitives.spacing[0.5]};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    padding: ${({theme}) => `${theme.primitives.paddingX.xxs} ${theme.primitives.paddingX.xsm}`};
    border-radius: ${({theme}) => theme.radius.md};
`;

const FileName = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const FileSize = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textMuted};
    margin-left: ${({theme}) => theme.spacing[2]};
`;

const LabelsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[1]};
`;

const LabelChips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({theme}) => theme.spacing[1]};
`;

const LabelChip = styled.span`
    display: inline-flex;
    align-items: center;
    padding: ${({theme}) => `${theme.primitives.paddingX.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({theme}) => theme.colors.accentPrimary};
    color: ${({theme}) => theme.colors.textInverted};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
`;

const StyledDivider = styled.div`
    width: 100%;
    height: 2px;
    background-color: ${({theme}) => theme.colors.borderSubtle};
`;

const FooterSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({theme}) => theme.spacing[2]};
`;

const FooterLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[2]};
    flex-wrap: wrap;
`;

const FooterRight = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: ${({theme}) => theme.spacing[0.5]};
`;

const AssignedTo = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding: ${({theme}) => `${theme.primitives.paddingX.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const PriorityBadge = styled.div<{ $color: string }>`
    padding: ${({theme}) => `${theme.primitives.paddingX.xxxs} ${theme.primitives.paddingX.xsm}`};
    background: ${({$color}) => $color};
    color: white;
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
`;

const DueDate = styled.div<{ $overdue: boolean }>`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme, $overdue}) =>
            $overdue ? theme.colors.statusError : theme.colors.textMuted};
    font-weight: ${({$overdue}) => ($overdue ? 600 : 400)};
`;

const UpdatedAt = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textMuted};
`;