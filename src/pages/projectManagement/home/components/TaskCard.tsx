import React, {useState} from "react";
import styled from "styled-components";
import {FileText, Paperclip, Calendar, Tags, Box, ChevronDown, ChevronUp} from "lucide-react";
import {Task} from "../types/types";
import {
    formatRelativeDate,
    getTaskTypeLabel,
} from "../utils/taskHelpers";

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({task, onClick}) => {
    const [isFilesExpanded, setIsFilesExpanded] = useState(true);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

    const isPending = task.status === "pending";
    const isApproved = task.status === "approved";
    const isFailed = task.status === "failed";

    const showReviewInfo = isPending || isApproved || isFailed;

    // Get task title (description or geometry name)
    const taskTitle = task.description ||
        (task.type === "geometry_labeling" ? task.geometryName : task.batchName);

    // Check if we should show details section
    const hasDetails = task.description || (showReviewInfo && task.reviewNotes);

    return (
        <CardContainer onClick={() => onClick(task)}>
            {/* Title */}
            <TitleRow>
                <TitleIcon>
                    {task.type === "geometry_labeling" ? (
                        <Tags size={14}/>
                    ) : (
                        <Box size={14}/>
                    )}
                </TitleIcon>
                <CardTitle>{taskTitle}</CardTitle>
            </TitleRow>

            {/* Associated Files Section */}
            <ContentSection>

                {/* Details Section - Only show if there's content */}
                {hasDetails && (
                    <ContentSection>
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
                                {task.description && (
                                    <DetailItem>
                                        <DetailLabel>Description:</DetailLabel>
                                        <DetailText>{task.description}</DetailText>
                                    </DetailItem>
                                )}

                                {showReviewInfo && task.reviewNotes && (
                                    <DetailItem>
                                        <DetailLabel>
                                            {isFailed ? "Rejection Reason:" : "Review Notes:"}
                                        </DetailLabel>
                                        <DetailText $isError={isFailed}>
                                            {task.reviewNotes}
                                        </DetailText>
                                    </DetailItem>
                                )}
                            </DetailsContent>
                        )}
                    </ContentSection>
                )}

                <StyledDivider/>

                <SectionHeaderRow>
                    <SectionHeader>Associated Files</SectionHeader>
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
                    <AssociatedFilesSection>
                        {task.type === "geometry_labeling" && (
                            <FileList>
                                <FileItem>
                                    <FileDetails>
                                        <FileIcon>
                                            <FileText size={15}/>
                                        </FileIcon>
                                        <FileName>{task.geometryName}</FileName>
                                    </FileDetails>
                                    <FileSize>200 KB</FileSize>
                                </FileItem>

                                {/* Show labels if submitted */}
                                {task.labels && task.labels.length > 0 && (
                                    <FileItem>
                                        <FileDetails>
                                            <FileIcon>
                                                <Paperclip size={15}/>
                                            </FileIcon>
                                            <FileName>{task.labels.length} more...</FileName>
                                        </FileDetails>
                                        <FileSize>200 KB</FileSize>
                                    </FileItem>
                                )}

                                {/* Show default "more files" if no labels */}
                                {(!task.labels || task.labels.length === 0) && (
                                    <FileItem>
                                        <FileDetails>
                                            <FileIcon>
                                                <Paperclip size={15}/>
                                            </FileIcon>
                                            <FileName>2 more...</FileName>
                                        </FileDetails>
                                        <FileSize>200 KB</FileSize>
                                    </FileItem>
                                )}
                            </FileList>
                        )}

                        {task.type === "geometry_upload" && (
                            <FileList>
                                {task.fileNames && task.fileNames.length > 0 ? (
                                    <>
                                        {task.fileNames.slice(0, 2).map((fileName, idx) => (
                                            <FileItem key={idx}>
                                                <FileDetails>
                                                    <FileIcon>
                                                        <FileText size={15}/>
                                                    </FileIcon>
                                                    <FileName>{fileName}</FileName>
                                                </FileDetails>
                                                <FileSize>200 KB</FileSize>
                                            </FileItem>
                                        ))}
                                        {task.fileNames.length > 2 && (
                                            <FileItem>
                                                <FileDetails>
                                                    <FileIcon>
                                                        <Paperclip size={15}/>
                                                    </FileIcon>
                                                    <FileName>{task.fileNames.length - 2} more...</FileName>
                                                </FileDetails>
                                                <FileSize>200 KB</FileSize>
                                            </FileItem>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <FileItem>
                                            <FileDetails>
                                                <FileIcon>
                                                    <FileText size={15}/>
                                                </FileIcon>
                                                <FileName>{task.batchName}.step</FileName>
                                            </FileDetails>
                                            <FileSize>200 KB</FileSize>
                                        </FileItem>
                                        <FileItem>
                                            <FileDetails>
                                                <FileIcon>
                                                    <Paperclip size={15}/>
                                                </FileIcon>
                                                <FileName>2 more...</FileName>
                                            </FileDetails>
                                            <FileSize>200 KB</FileSize>
                                        </FileItem>
                                    </>
                                )}
                            </FileList>
                        )}
                    </AssociatedFilesSection>
                )}
            </ContentSection>

            <StyledDivider/>

            <FooterSection>
                <CardFooter>
                    <TaskTypeBadge>
                        {task.type === "geometry_labeling" ? (
                            <Tags size={13}/>
                        ) : (
                            <Box size={13}/>
                        )}
                        {getTaskTypeLabel(task.type)}
                    </TaskTypeBadge>

                    {task.dueDate && !showReviewInfo && (
                        <DueDate>
                            <DateIcon>
                                <Calendar size={14}/>
                            </DateIcon>
                            <DateText $overdue={new Date(task.dueDate) < new Date()}>
                                Complete by {new Date(task.dueDate).toLocaleDateString('en-US', {
                                month: 'numeric',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                            </DateText>
                        </DueDate>
                    )}

                    {showReviewInfo && (
                        <StatusInfo>
                            {isPending && (
                                <StatusBadge>
                                    <StatusIndicator $status="pending"/>
                                    Submitted {formatRelativeDate(task.submittedAt!)}
                                </StatusBadge>
                            )}

                            {isApproved && (
                                <StatusBadge>
                                    <StatusIndicator $status="approved"/>
                                    Approved {formatRelativeDate(task.reviewedAt!)}
                                </StatusBadge>
                            )}

                            {isFailed && (
                                <StatusBadge>
                                    <StatusIndicator $status="failed"/>
                                    Rejected {formatRelativeDate(task.reviewedAt!)}
                                </StatusBadge>
                            )}
                        </StatusInfo>
                    )}
                </CardFooter>
            </FooterSection>
        </CardContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: ${({theme}) => theme.padding.sm} ${({theme}) => theme.padding.xsm};
    gap: ${({theme}) => theme.primitives.spacing[2]};;
    background: ${({theme}) => theme.colors.backgroundSecondary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.lg};
    cursor: pointer;

    &:hover {
        border-color: ${({theme}) => theme.colors.borderDefault};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    &:active {
        transform: scale(0.995);
    }
`;

const ContentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.primitives.spacing[1]};
`;

const FooterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.primitives.spacing[2]};
`;

const CardTitle = styled.h3`
    display: flex;
    width: 100%;
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.primitives.spacing[1]};
    padding-left: ${({theme}) => theme.primitives.paddingX.xxs};
    padding-right: ${({theme}) => theme.primitives.paddingX.xxs};
    padding-top: ${({theme}) => theme.primitives.paddingX.xxs};
    padding-bottom: ${({theme}) => theme.primitives.paddingX.xxs};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.md};
`;

const TitleIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${({theme}) => theme.colors.brandPrimary};
    padding: ${({theme}) => theme.primitives.padding.xxs};
    border-radius: ${({theme}) => theme.primitives.radius.md};
    color: ${({theme}) => theme.colors.textInverted};
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

    &:active {
        transform: scale(0.95);
    }
`;

const AssociatedFilesSection = styled.div`
    display: flex;
    flex-direction: column;
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
    min-width: 0;
`;

const FileIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${({theme}) => theme.colors.textMuted};
`;

const FileDetails = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.primitives.spacing[0.5]};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    padding-left: ${({theme}) => theme.primitives.paddingX.xsm};
    padding-right: ${({theme}) => theme.primitives.paddingX.xsm};
    padding-top: ${({theme}) => theme.primitives.paddingX.xxs};
    padding-bottom: ${({theme}) => theme.primitives.paddingX.xxs};
    border-radius: ${({theme}) => theme.radius.md};
`;

const FileName = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textPrimary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FileSize = styled.span`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme}) => theme.colors.textMuted};
    flex-shrink: 0;
    margin-left: ${({theme}) => theme.spacing[2]};
`;

const DetailsContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[2]};
    margin-bottom: ${({ theme }) => theme.primitives.padding.xxs};
    ;
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
            $isError ? theme.colors.statusError : theme.colors.textPrimary
    };
    margin: 0;
    padding: ${({theme}) => theme.primitives.paddingX.xsm};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border-radius: ${({theme}) => theme.radius.md};
    line-height: 1.4;
    ${({$isError, theme}) => $isError && `
        border-left: 2px solid ${theme.colors.statusError};
    `}
`;

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({theme}) => theme.spacing[3]};
`;

const TaskTypeBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding-left: ${({theme}) => theme.primitives.paddingX.xsm};
    padding-right: ${({theme}) => theme.primitives.paddingX.xsm};
    padding-top: ${({theme}) => theme.primitives.paddingX.xxxs};
    padding-bottom: ${({theme}) => theme.primitives.paddingX.xxxs};
    background: ${({theme}) => theme.colors.accentPrimary};
    color: ${({theme}) => theme.primitives.colors.text1000};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    white-space: nowrap;
`;

const DueDate = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
`;

const DateIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({theme}) => theme.colors.textMuted};
    opacity: 0.7;
`;

const DateText = styled.span<{ $overdue?: boolean }>`
    font-size: ${({theme}) => theme.typography.size.xsm};
    color: ${({theme, $overdue}) =>
            $overdue ? theme.colors.textMuted : theme.colors.textMuted};
    white-space: nowrap;
`;

const StatusInfo = styled.div`
    display: flex;
    align-items: center;
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: ${({theme}) => theme.spacing[1]};
    padding-left: ${({theme}) => theme.primitives.paddingX.xxs};
    padding-right: ${({theme}) => theme.primitives.paddingX.xxs};
    padding-top: ${({theme}) => theme.primitives.paddingX.xxxs};
    padding-bottom: ${({theme}) => theme.primitives.paddingX.xxxs};
    background: ${({theme}) => theme.colors.backgroundTertiary};
    border: 1px solid ${({theme}) => theme.colors.borderSubtle};
    border-radius: ${({theme}) => theme.radius.md};
    font-size: ${({theme}) => theme.typography.size.xsm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMuted};
    white-space: nowrap;
`;

const StatusIndicator = styled.div<{ $status: "pending" | "approved" | "failed" }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${({theme, $status}) => {
        if ($status === "approved") return theme.colors.statusSuccess;
        if ($status === "failed") return theme.colors.statusError;
        return theme.colors.statusWarning;
    }};
`;

const StyledDivider = styled.div`
    width: 100%;
    height: 2px;
    background-color: ${({theme}) => theme.colors.borderSubtle};
`;