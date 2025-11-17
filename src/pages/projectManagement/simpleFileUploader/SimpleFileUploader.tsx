import React, { useState, useRef } from "react";
import styled from "styled-components";
import { ChevronDown, ChevronUp, Upload, X, FileText, Package } from "lucide-react";
import { BaseButton } from "components/buttons/BaseButton";
import { taskService } from "../api/services/taskService";
import { useUser } from "../context/UserContext";

interface TaskContext {
    taskId: string;
    taskType: 'geometry_upload' | 'geometry_labeling';
    requiredFileCount?: number;
    modelId?: string;
    geometryId?: string;
    geometryType?: 'edge' | 'face' | 'body';
    geometryName?: string;
    batchName?: string;
}

interface SimpleFileUploaderProps {
    taskContext: TaskContext;
    onSubmit: (taskId: string, fileNames: string[]) => void;
    onCancel: () => void;
}

export const SimpleFileUploader: React.FC<SimpleFileUploaderProps> = ({
                                                                          taskContext,
                                                                          onSubmit,
                                                                          onCancel,
                                                                      }) => {
    const { currentUser } = useUser();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [filesExpanded, setFilesExpanded] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const validFiles = filesArray.filter(
                (file) =>
                    file.name.toLowerCase().endsWith(".step") ||
                    file.name.toLowerCase().endsWith(".stp")
            );

            if (validFiles.length !== filesArray.length) {
                alert("Only .step and .stp files are allowed");
            }

            setSelectedFiles([...selectedFiles, ...validFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select at least one STEP file before submitting");
            return;
        }

        if (!currentUser) {
            alert("No user logged in");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare file metadata (in real implementation, you'd upload to S3 here)
            const fileMetadata = selectedFiles.map(file => ({
                name: file.name,
                size: file.size,
            }));

            console.log(`[SimpleFileUploader] Submitting ${fileMetadata.length} files for task ${taskContext.taskId}`);

            // Submit files for review via taskService
            await taskService.submitFilesForReview(
                taskContext.taskId,
                fileMetadata,
                currentUser.email
            );

            console.log(`[SimpleFileUploader] Files submitted successfully for task ${taskContext.taskId}`);

            // Call parent callback to navigate back
            onSubmit(taskContext.taskId, selectedFiles.map(f => f.name));
        } catch (error) {
            console.error('[SimpleFileUploader] Failed to submit files:', error);
            alert(`Failed to submit files: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const requiredCount = taskContext.requiredFileCount || 0;
    const uploadedCount = selectedFiles.length;
    const progress = requiredCount > 0 ? (uploadedCount / requiredCount) * 100 : 0;
    const isComplete = uploadedCount >= requiredCount && requiredCount > 0;

    return (
        <Container>
            <Header>
                <HeaderLeft>
                    <TaskIcon>
                        <Package size={20} />
                    </TaskIcon>
                    <HeaderText>
                        <Title>{taskContext.batchName || "Upload Geometry Files"}</Title>
                        <Subtitle>Upload STEP files for review</Subtitle>
                    </HeaderText>
                </HeaderLeft>
                <HeaderActions>
                    <StatusBadge $complete={isComplete}>
                        {uploadedCount} / {requiredCount} files
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
                                    {taskContext.batchName || "Upload required STEP files for this batch"}
                                </DetailValue>

                                {requiredCount > 0 && (
                                    <ProgressWrapper>
                                        <ProgressBar>
                                            <ProgressFill $percent={progress} $complete={isComplete} />
                                        </ProgressBar>
                                        <ProgressText $complete={isComplete}>
                                            {isComplete
                                                ? "✓ All required files selected"
                                                : `${requiredCount - uploadedCount} more file${
                                                    requiredCount - uploadedCount !== 1 ? "s" : ""
                                                } needed`}
                                        </ProgressText>
                                    </ProgressWrapper>
                                )}
                            </SectionContent>
                        )}
                    </CardSection>

                    <SectionDivider />

                    {/* Associated Files Section */}
                    <CardSection>
                        <SectionHeader onClick={() => setFilesExpanded(!filesExpanded)}>
                            <SectionTitle>Associated Files</SectionTitle>
                            <ExpandIcon>
                                {filesExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </ExpandIcon>
                        </SectionHeader>

                        {filesExpanded && (
                            <SectionContent>
                                <HiddenFileInput
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".step,.stp"
                                    multiple
                                    onChange={handleFileSelect}
                                />

                                <UploadZone onClick={handleBrowseClick}>
                                    <UploadIcon>
                                        <Upload size={24} />
                                    </UploadIcon>
                                    <UploadText>Click to browse for STEP files</UploadText>
                                    <UploadHint>Accepts .step and .stp files</UploadHint>
                                </UploadZone>

                                {selectedFiles.length > 0 ? (
                                    <FilesList>
                                        {selectedFiles.map((file, index) => (
                                            <FileItem key={index}>
                                                <FileInfo>
                                                    <FileIconWrapper>
                                                        <FileText size={16} />
                                                    </FileIconWrapper>
                                                    <FileName>{file.name}</FileName>
                                                </FileInfo>
                                                <FileActions>
                                                    <FileSize>{(file.size / 1024).toFixed(1)} KB</FileSize>
                                                    <RemoveButton onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFile(index);
                                                    }}>
                                                        <X size={16} />
                                                    </RemoveButton>
                                                </FileActions>
                                            </FileItem>
                                        ))}
                                    </FilesList>
                                ) : (
                                    <EmptyState>
                                        <EmptyIcon>
                                            <FileText size={32} />
                                        </EmptyIcon>
                                        <EmptyText>No files selected yet</EmptyText>
                                    </EmptyState>
                                )}
                            </SectionContent>
                        )}
                    </CardSection>

                    <SectionDivider />

                    {/* Footer with badges */}
                    <CardFooter>
                        <FooterBadge>
                            <Upload size={14} />
                            Upload Files
                        </FooterBadge>
                        <FooterRight>
                            <CompleteBadge>Task ID: {taskContext.taskId}</CompleteBadge>
                        </FooterRight>
                    </CardFooter>
                </TaskCard>

                {/* Action Buttons */}
                <ActionButtons>
                    <CancelButton $variant={"secondary"} onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        $variant={"primary"}
                        onClick={handleSubmit}
                        disabled={selectedFiles.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit for Approval"}
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

const StatusBadge = styled.div<{ $complete: boolean }>`
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    background: ${({ theme, $complete }) =>
            $complete ? theme.colors.statusSuccess : theme.colors.accentPrimary};
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

const ProgressWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-top: ${({ theme }) => theme.spacing[2]};
`;

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-radius: ${({ theme }) => theme.radius.pill};
    overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number; $complete: boolean }>`
    height: 100%;
    width: ${({ $percent }) => $percent}%;
    background: ${({ theme, $complete }) =>
            $complete ? theme.colors.statusSuccess : theme.colors.brandPrimary};
    transition: width ${({ theme }) => theme.animation.duration.medium};
`;

const ProgressText = styled.div<{ $complete: boolean }>`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme, $complete }) =>
            $complete ? theme.colors.statusSuccess : theme.colors.textMuted};
    font-weight: ${({ $complete }) => ($complete ? 600 : 400)};
`;

const SectionDivider = styled.div`
    width: 100%;
    height: 1px;
    background: ${({ theme }) => theme.colors.borderSubtle};
`;

const HiddenFileInput = styled.input`
    display: none;
`;

const UploadZone = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[6]};
    border: 2px dashed ${({ theme }) => theme.colors.borderDefault};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animation.duration.fast};

    &:hover {
        border-color: ${({ theme }) => theme.colors.brandPrimary};
        background: ${({ theme }) => theme.colors.backgroundQuaternary};
    }
`;

const UploadIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.accentPrimary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const UploadText = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const UploadHint = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
`;

const FilesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-top: ${({ theme }) => theme.spacing[2]};
`;

const FileItem = styled.div`
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

const FileInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    flex: 1;
    min-width: 0;
`;

const FileIconWrapper = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.accentPrimary};
    flex-shrink: 0;
`;

const FileName = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: ${({ theme }) => theme.typography.family.mono};
`;

const FileActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    flex-shrink: 0;
`;

const FileSize = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.family.mono};
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

const CancelButton = styled(BaseButton)<{ $variant: "primary" | "secondary" }>`

    &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.backgroundTertiary};
        border-color: ${({ theme }) => theme.colors.accentPrimary};
        color: ${({ theme }) => theme.colors.textPrimary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SubmitButton = styled(BaseButton)<{ $variant: "primary" | "secondary" }>`
    &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.statusSuccess};
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;