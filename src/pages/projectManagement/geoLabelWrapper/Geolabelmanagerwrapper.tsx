import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { AlertCircle } from "lucide-react";
import { TaskContext } from "../home/types/types";
import { GeometryData } from "../types/geometry.types";
import { SimpleLabelCreator } from "../simpleLabelCreator/SimpleLabelCreator";
import {BaseButton} from "components/buttons/BaseButton";
interface GeoLabelManagerWrapperProps {
    taskContext: TaskContext;
    geometryData: GeometryData | null;
    onSubmitLabels: (taskId: string, labels: string[]) => void;
    onCancel: () => void;
}

export const GeoLabelManagerWrapper: React.FC<GeoLabelManagerWrapperProps> = ({
                                                                                  taskContext,
                                                                                  geometryData,
                                                                                  onSubmitLabels,
                                                                                  onCancel,
                                                                              }) => {
    const [labelCount, setLabelCount] = useState(0);

    const handleLabelsChange = useCallback((count: number) => {
        setLabelCount(count);
    }, []);

    const handleSubmit = () => {
        // Extract label names from localStorage (where GeoLabelManager saves them)
        try {
            const storageKey = `labels_${taskContext.geometryId}`;
            const savedLabels = localStorage.getItem(storageKey);

            if (savedLabels) {
                const labelsData = JSON.parse(savedLabels);
                const labelNames = labelsData.map((label: any) => label.name);
                onSubmitLabels(taskContext.taskId, labelNames);
            } else if (labelCount > 0) {
                // Fallback: submit with placeholder if we know labels exist
                const placeholderLabels = Array.from({ length: labelCount }, (_, i) => `Label ${i + 1}`);
                onSubmitLabels(taskContext.taskId, placeholderLabels);
            } else {
                alert("Please create at least one label before submitting");
            }
        } catch (error) {
            console.error("Error extracting labels:", error);
            alert("Error extracting labels. Please try again.");
        }
    };

    // No geometry loaded - show SimpleLabelCreator as fallback
    if (!geometryData) {
        return (
            <Container>
                <AlertBanner>
                    <AlertIcon>
                        <AlertCircle size={20} />
                    </AlertIcon>
                    <AlertContent>
                        <AlertTitle>No Geometry Loaded</AlertTitle>
                        <AlertMessage>
                            To use the full geometry labeler with 3D visualization, load a demo geometry file from the Home view.
                            You can still create labels using the simplified form below.
                        </AlertMessage>
                    </AlertContent>
                </AlertBanner>

                <SimpleLabelCreator
                    taskContext={taskContext}
                    onSubmit={onSubmitLabels}
                    onCancel={onCancel}
                />
            </Container>
        );
    }

    // Geometry loaded - show full GeoLabelManager
    return (
        <Container>
            <GeoLabelManagerContainer>
                {/* <GeoLabelManager
          geometryData={geometryData}
          geometryId={taskContext.geometryId}
          geometryMetadata={{
            filename: taskContext.geometryName,
            originalPath: taskContext.modelId,
          }}
          onLabelsChange={handleLabelsChange}
        /> */}
            </GeoLabelManagerContainer>

            <SubmitBar>
                <TaskInfo>
                    <TaskInfoLabel>Task:</TaskInfoLabel>
                    <TaskInfoValue>{taskContext.geometryName}</TaskInfoValue>
                    <TaskInfoSeparator>•</TaskInfoSeparator>
                    <LabelCount $hasLabels={labelCount > 0}>
                        {labelCount} label{labelCount !== 1 ? "s" : ""} created
                    </LabelCount>
                </TaskInfo>

                <SubmitActions>
                    <CancelButton $variant="secondary" onClick={onCancel}>
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        $variant="primary"
                        onClick={handleSubmit}
                        disabled={labelCount === 0}
                    >
                        Submit for Approval
                    </SubmitButton>
                </SubmitActions>
            </SubmitBar>
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
`;

const AlertBanner = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing[3]};
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
    background: ${({ theme }) => theme.colors.statusWarning}22;
    border-bottom: 1px solid ${({ theme }) => theme.colors.statusWarning};
    border-left: 4px solid ${({ theme }) => theme.colors.statusWarning};
`;

const AlertIcon = styled.div`
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.statusWarning};
    flex-shrink: 0;
    margin-top: 2px;
`;

const AlertContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const AlertTitle = styled.div`
    font-size: ${({ theme }) => theme.typography.size.md};
    font-weight: ${({ theme }) => theme.typography.weight.semiBold};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const AlertMessage = styled.div`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.5;
`;

const GeoLabelManagerContainer = styled.div`
    flex: 1;
    overflow: hidden;
`;

const SubmitBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const TaskInfo = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
`;

const TaskInfoLabel = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.typography.weight.semiBold};
`;

const TaskInfoValue = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    font-family: ${({ theme }) => theme.typography.family.mono};
`;

const TaskInfoSeparator = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};
`;

const LabelCount = styled.span<{ $hasLabels: boolean }>`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme, $hasLabels }) =>
            $hasLabels ? theme.colors.statusSuccess : theme.colors.textMuted};
    font-weight: ${({ theme, $hasLabels }) =>
            $hasLabels ? theme.typography.weight.semiBold : theme.typography.weight.regular};
`;

const SubmitActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[3]};
`;

const CancelButton = styled(BaseButton)`
  &:hover {
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-color: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const SubmitButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.statusSuccess};
  border-color: ${({ theme }) => theme.colors.statusSuccess};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.statusSuccess};
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;