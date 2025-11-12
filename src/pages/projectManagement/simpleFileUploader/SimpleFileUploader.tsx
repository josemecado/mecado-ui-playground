import React, { useState, useRef } from "react";
import styled from "styled-components";
import { TaskContext } from "../home/types/types";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Filter for .step and .stp files only
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

  const handleSubmit = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one STEP file before submitting");
      return;
    }

    const fileNames = selectedFiles.map((file) => file.name);
    onSubmit(taskContext.taskId, fileNames);
  };

  const requiredCount = taskContext.requiredFileCount || 0;
  const uploadedCount = selectedFiles.length;
  const progress = requiredCount > 0 ? (uploadedCount / requiredCount) * 100 : 0;
  const isComplete = uploadedCount >= requiredCount;

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Title>📦 Upload Geometry Files</Title>
          <Subtitle>Select STEP files for this batch, then submit for approval</Subtitle>
        </Header>

        <TaskInfoSection>
          <SectionTitle>Task Information</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Batch Name:</InfoLabel>
              <InfoValue>{taskContext.batchName || "Unknown"}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Required Files:</InfoLabel>
              <InfoValue>
                <CountBadge $complete={isComplete}>
                  {uploadedCount} / {requiredCount}
                </CountBadge>
              </InfoValue>
            </InfoItem>
          </InfoGrid>

          {requiredCount > 0 && (
            <ProgressSection>
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
            </ProgressSection>
          )}
        </TaskInfoSection>

        <UploadSection>
          <SectionTitle>Select Files</SectionTitle>

          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".step,.stp"
            multiple
            onChange={handleFileSelect}
          />

          <UploadDropZone onClick={handleBrowseClick}>
            <UploadIcon>📁</UploadIcon>
            <UploadText>Click to browse for STEP files</UploadText>
            <UploadHint>Accepts .step and .stp files</UploadHint>
          </UploadDropZone>

          {selectedFiles.length > 0 && (
            <FilesListSection>
              <ListHeader>Selected Files ({selectedFiles.length})</ListHeader>
              <FilesList>
                {selectedFiles.map((file, index) => (
                  <FileItem key={index}>
                    <FileInfo>
                      <FileIcon>📄</FileIcon>
                      <FileDetails>
                        <FileName>{file.name}</FileName>
                        <FileSize>{(file.size / 1024).toFixed(1)} KB</FileSize>
                      </FileDetails>
                    </FileInfo>
                    <RemoveButton onClick={() => handleRemoveFile(index)}>×</RemoveButton>
                  </FileItem>
                ))}
              </FilesList>
            </FilesListSection>
          )}

          {selectedFiles.length === 0 && (
            <EmptyState>
              <EmptyIcon>📦</EmptyIcon>
              <EmptyText>No files selected yet</EmptyText>
              <EmptyHint>Click the area above to select STEP files</EmptyHint>
            </EmptyState>
          )}
        </UploadSection>

        <ActionsSection>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={selectedFiles.length === 0}>
            Submit for Approval
          </SubmitButton>
        </ActionsSection>
      </ContentWrapper>
    </Container>
  );
};

// ======================
// 🔹 Styled Components
// ======================

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  padding: ${({ theme }) => theme.spacing[8]};
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
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

const TaskInfoSection = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const CountBadge = styled.span<{ $complete: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[3]}`};
  background: ${({ theme, $complete }) =>
    $complete ? theme.colors.statusSuccess : theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  font-family: ${({ theme }) => theme.typography.family.mono};
`;

const ProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.pill};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number; $complete: boolean }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ theme, $complete }) =>
    $complete ? theme.colors.statusSuccess : theme.colors.brandPrimary};
  transition: all ${({ theme }) => theme.animation.duration.medium} ${({ theme }) => theme.animation.easing.standard};
`;

const ProgressText = styled.div<{ $complete: boolean }>`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme, $complete }) =>
    $complete ? theme.colors.statusSuccess : theme.colors.textMuted};
  font-weight: ${({ theme, $complete }) =>
    $complete ? theme.typography.weight.semiBold : theme.typography.weight.regular};
`;

const UploadSection = styled.div`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing[5]};
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadDropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[8]};
  border: 2px dashed ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.backgroundPrimary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandPrimary};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const UploadText = styled.div`
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

const UploadHint = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FilesListSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ListHeader = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  flex: 1;
  min-width: 0;
`;

const FileIcon = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xl};
  flex-shrink: 0;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  min-width: 0;
`;

const FileName = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  width: 28px;
  height: 28px;
  padding: 0;
  background: ${({ theme }) => theme.colors.statusError};
  color: ${({ theme }) => theme.colors.textInverted};
  border: none;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.statusError};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[6]};
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textMuted};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const EmptyHint = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

const ActionsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const CancelButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
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

const HelpSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-radius: ${({ theme }) => theme.radius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.brandPrimary};
`;

const HelpIcon = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xl};
  flex-shrink: 0;
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0;
  line-height: 1.5;
`;