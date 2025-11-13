import React from "react";
import styled from "styled-components";
import {FileText, Paperclip, Calendar} from "lucide-react";
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
    const isPending = task.status === "pending";
    const isApproved = task.status === "approved";
    const isFailed = task.status === "failed";

    const showReviewInfo = isPending || isApproved || isFailed;

    // Get task title (description or geometry name)
    const taskTitle = task.description ||
        (task.type === "geometry_labeling" ? task.geometryName : task.batchName);

    return (
        <CardContainer onClick={() => onClick(task)}>
            {/* Title */}
            <CardTitle>{taskTitle}</CardTitle>

            <ContentSection>
                <SectionHeader>Associated Files</SectionHeader>

                {/* Associated Files Section */}
                <AssociatedFilesSection>
                    {task.type === "geometry_labeling" && (
                        <FileList>
                            {/*New format*/}
                            <FileItem>
                                <FileDetails>
                                    <FileIcon>
                                        <FileText size={16}/>
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
                                            <Paperclip size={16}/>
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
                                            <Paperclip size={16}/>
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
                                                    <FileText size={16}/>
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
                                                    <Paperclip size={16}/>
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
                                                <FileText size={16}/>
                                            </FileIcon>
                                            <FileName>{task.batchName}.step</FileName>
                                        </FileDetails>
                                        <FileSize>200 KB</FileSize>
                                    </FileItem>
                                    <FileItem>
                                        <FileDetails>
                                            <FileIcon>
                                                <Paperclip size={16}/>
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
            </ContentSection>

            <StyledDivider/>

            <FooterSection>
                {/* Footer with badge and date */}
                <CardFooter>
                    <TaskTypeBadge>
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
    font-size: ${({theme}) => theme.typography.size.md};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textPrimary};
`;

const AssociatedFilesSection = styled.div`
    display: flex;
    flex-direction: column;
`;

const SectionHeader = styled.div`
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textMuted};
    text-transform: capitalize;
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

const CardFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({theme}) => theme.spacing[3]};
`;

const TaskTypeBadge = styled.div`
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