import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { AlertCircle } from "lucide-react";
import { BaseButton } from "components/buttons/BaseButton";
import { GeometryData } from "../../types";
import { SimpleLabelCreator } from "./SimpleLabelCreator";
import { taskService } from "../../services/taskService";
import { useUser } from "../../context/UserContext";

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
    const { currentUser } = useUser();
    const [labelCount, setLabelCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLabelsChange = useCallback((count: number) => {
        setLabelCount(count);
    }, []);

    const handleSubmit = async () => {
        if (!currentUser) {
            alert("No user logged in");
            return;
        }

        if (labelCount === 0) {
            alert("Please create at least one label before submitting");
            return;
        }

        setIsSubmitting(true);

        try {
            // Extract label names from localStorage (where GeoLabelManager saves them)
            let labels: string[] = [];

            try {
                const storageKey = `labels_${taskContext.geometryId}`;
                const savedLabels = localStorage.getItem(storageKey);

                if (savedLabels) {
                    const labelsData = JSON.parse(savedLabels);
                    labels = labelsData.map((label: any) => label.name);
                } else {
                    // Fallback: create placeholder labels
                    labels = Array.from({ length: labelCount }, (_, i) => `Label ${i + 1}`);
                }
            } catch (error) {
                console.error("Error extracting labels:", error);
                // Fallback: create placeholder labels
                labels = Array.from({ length: labelCount }, (_, i) => `Label ${i + 1}`);
            }

            console.log(`[GeoLabelManagerWrapper] Submitting ${labels.length} labels for task ${taskContext.taskId}`);

            // Submit labels for review via taskService
            await taskService.submitLabelsForReview(
                taskContext.taskId,
                labels,
                taskContext.geometryId || taskContext.modelId || 'unknown',
                currentUser.email
            );

            console.log(`[GeoLabelManagerWrapper] Labels submitted successfully for task ${taskContext.taskId}`);

            // Call parent callback to navigate back
            onSubmitLabels(taskContext.taskId, labels);
        } catch (error) {
            console.error('[GeoLabelManagerWrapper] Failed to submit labels:', error);
            alert(`Failed to submit labels: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
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
                    onSubmit={async (taskId: string, labels: string[]) => {
                        // SimpleLabelCreator calls this - we need to route through taskService
                        if (!currentUser) {
                            alert("No user logged in");
                            return;
                        }

                        try {
                            await taskService.submitLabelsForReview(
                                taskId,
                                labels,
                                taskContext.geometryId || taskContext.modelId || 'unknown',
                                currentUser.email
                            );

                            onSubmitLabels(taskId, labels);
                        } catch (error) {
                            console.error('[GeoLabelManagerWrapper] Failed to submit labels:', error);
                            alert(`Failed to submit labels: ${error.message || 'Unknown error'}`);
                        }
                    }}
                    onCancel={onCancel}
                />
            </Container>
        );
    }

    // Geometry loaded - show full GeoLabelManager
    return (
        <Container>
            <GeoLabelManagerContainer>
                {/* Placeholder for actual GeoLabelManager component */}
                <PlaceholderMessage>
                    <h2>3D Geometry Labeler</h2>
                    <p>The full 3D geometry labeling interface would appear here.</p>
                    <p>Geometry loaded: {geometryData.fileName}</p>
                    <p>For now, you can use the submit button below to test the workflow.</p>
                </PlaceholderMessage>
                {/*
                <GeoLabelManager
                  geometryData={geometryData}
                  geometryId={taskContext.geometryId}
                  geometryMetadata={{
                    filename: taskContext.geometryName,
                    originalPath: taskContext.modelId,
                  }}
                  onLabelsChange={handleLabelsChange}
                />
                */}
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
                    <CancelButton $variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        $variant="primary"
                        onClick={handleSubmit}
                        disabled={labelCount === 0 || isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit for Approval"}
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

const PlaceholderMessage = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: ${({ theme }) => theme.spacing[6]};
    text-align: center;
    color: ${({ theme }) => theme.colors.textMuted};

    h2 {
        font-size: ${({ theme }) => theme.typography.size.xl};
        color: ${({ theme }) => theme.colors.textPrimary};
        margin-bottom: ${({ theme }) => theme.spacing[4]};
    }

    p {
        margin: ${({ theme }) => theme.spacing[2]} 0;
        font-size: ${({ theme }) => theme.typography.size.md};
    }
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