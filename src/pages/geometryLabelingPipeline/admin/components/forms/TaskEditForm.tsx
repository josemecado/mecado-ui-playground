// admin/components/TaskEditForm.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { X, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";
import { UnifiedTask, TaskPriority } from "../../../types";
import { mockUsers } from "../../../services/mockData";
import { BaseButton } from "components/buttons/BaseButton";

interface TaskEditFormProps {
    task: UnifiedTask;
    onSubmit: (taskId: string, updates: Partial<UnifiedTask>) => void;
    onCancel: () => void;
}

export const TaskEditForm: React.FC<TaskEditFormProps> = ({
                                                              task,
                                                              onSubmit,
                                                              onCancel,
                                                          }) => {
    // Initialize state with existing task data
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [requirements, setRequirements] = useState(task.requirements || "");
    const [assignedTo, setAssignedTo] = useState(task.assignedTo || "");
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [requiredFileCount, setRequiredFileCount] = useState(
        task.uploadData?.requiredFileCount || 1
    );
    const [dueDate, setDueDate] = useState(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    const [referenceLinks, setReferenceLinks] = useState<string[]>(
        task.referenceLinks || []
    );
    const [newLink, setNewLink] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) newErrors.title = "Title is required";
        if (!description.trim()) newErrors.description = "Description is required";
        if (requiredFileCount < 1) newErrors.fileCount = "Must require at least 1 file";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const updates: Partial<UnifiedTask> = {
            title: title.trim(),
            description: description.trim(),
            requirements: requirements.trim() || undefined,
            assignedTo: assignedTo || undefined,
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
        };

        // Update uploadData if requiredFileCount changed
        if (task.uploadData && requiredFileCount !== task.uploadData.requiredFileCount) {
            updates.uploadData = {
                ...task.uploadData,
                requiredFileCount,
            };
        }

        onSubmit(task.id, updates);
    };

    const addLink = () => {
        if (newLink.trim()) {
            setReferenceLinks([...referenceLinks, newLink.trim()]);
            setNewLink("");
        }
    };

    const removeLink = (index: number) => {
        setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
    };

    return (
        <FormOverlay onClick={onCancel}>
            <FormContainer onClick={(e) => e.stopPropagation()}>
                <FormHeader>
                    <HeaderTitle>Edit Task</HeaderTitle>
                    <CloseButton onClick={onCancel}>
                        <X size={20} />
                    </CloseButton>
                </FormHeader>

                <FormContent>
                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <FormField>
                            <Label>
                                Task Title <Required>*</Required>
                            </Label>
                            <Input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Label bolt hole mating faces"
                                $hasError={!!errors.title}
                            />
                            {errors.title && <ErrorText>{errors.title}</ErrorText>}
                        </FormField>

                        {/* Description */}
                        <FormField>
                            <Label>
                                Description <Required>*</Required>
                            </Label>
                            <TextArea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what needs to be done..."
                                rows={3}
                                $hasError={!!errors.description}
                            />
                            {errors.description && <ErrorText>{errors.description}</ErrorText>}
                        </FormField>

                        {/* Requirements */}
                        <FormField>
                            <Label>Requirements (Optional)</Label>
                            <TextArea
                                value={requirements}
                                onChange={(e) => setRequirements(e.target.value)}
                                placeholder="Specific instructions or guidelines..."
                                rows={2}
                            />
                        </FormField>

                        {/* Two Column Layout */}
                        <TwoColumnGrid>
                            {/* Assign To */}
                            <FormField>
                                <Label>
                                    Assign To <OptionalLabel>(Optional)</OptionalLabel>
                                </Label>
                                <Select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                >
                                    <option value="">Unassigned (assign later)</option>
                                    {mockUsers
                                        .filter((u) => u.role === "labeler" || u.role === "uploader")
                                        .map((user) => (
                                            <option key={user.id} value={user.email}>
                                                {user.username} ({user.email})
                                            </option>
                                        ))}
                                </Select>
                                <HelpText>Change assignment or leave unassigned</HelpText>
                            </FormField>

                            {/* Priority */}
                            <FormField>
                                <Label>Priority</Label>
                                <Select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </Select>
                            </FormField>
                        </TwoColumnGrid>

                        <TwoColumnGrid>
                            {/* Required Files */}
                            <FormField>
                                <Label>
                                    Required Files <Required>*</Required>
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={requiredFileCount}
                                    onChange={(e) => setRequiredFileCount(Number(e.target.value))}
                                    $hasError={!!errors.fileCount}
                                />
                                {errors.fileCount && <ErrorText>{errors.fileCount}</ErrorText>}
                                {task.uploadData && task.uploadData.uploadedFiles.length > 0 && (
                                    <HelpText>
                                        Currently has {task.uploadData.uploadedFiles.length} file(s) uploaded
                                    </HelpText>
                                )}
                            </FormField>

                            {/* Due Date */}
                            <FormField>
                                <Label>
                                    <Calendar size={14} /> Due Date (Optional)
                                </Label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </FormField>
                        </TwoColumnGrid>

                        {/* Reference Links */}
                        <FormField>
                            <Label>Reference Links (Optional)</Label>
                            <LinkInputRow>
                                <Input
                                    type="url"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    placeholder="https://example.com/reference"
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addLink();
                                        }
                                    }}
                                />
                                <IconButton type="button" onClick={addLink}>
                                    <Plus size={18} />
                                </IconButton>
                            </LinkInputRow>

                            {referenceLinks.length > 0 && (
                                <LinkList>
                                    {referenceLinks.map((link, idx) => (
                                        <LinkItem key={idx}>
                                            <LinkText
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {link}
                                            </LinkText>
                                            <IconButton type="button" onClick={() => removeLink(idx)}>
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </LinkItem>
                                    ))}
                                </LinkList>
                            )}
                        </FormField>

                        {/* Info Banner */}
                        <InfoBanner>
                            <AlertCircle size={16} />
                            <InfoText>
                                Changes will be saved and a history entry will be added. Current stage: <strong>{task.stage}</strong>
                            </InfoText>
                        </InfoBanner>

                        {/* Actions */}
                        <FormActions>
                            <CancelButton type="button" onClick={onCancel}>
                                Cancel
                            </CancelButton>
                            <SubmitButton type="submit">Save Changes</SubmitButton>
                        </FormActions>
                    </form>
                </FormContent>
            </FormContainer>
        </FormOverlay>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const FormOverlay = styled.div`
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
    padding: ${({ theme }) => theme.spacing[4]};
`;

const FormContainer = styled.div`
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border-radius: ${({ theme }) => theme.radius.lg};
    width: 100%;
    max-width: 700px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const FormHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[6]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

const HeaderTitle = styled.h2`
    font-size: ${({ theme }) => theme.typography.size.xl};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
`;

const CloseButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.radius.md};

    &:hover {
        background: ${({ theme }) => theme.colors.backgroundTertiary};
        color: ${({ theme }) => theme.colors.textPrimary};
    }
`;

const FormContent = styled.div`
    padding: ${({ theme }) => theme.spacing[6]};
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.accentPrimary};
        border-radius: ${({ theme }) => theme.radius.sm};
    }
`;

const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const Label = styled.label`
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textPrimary};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
`;

const Required = styled.span`
    color: ${({ theme }) => theme.colors.statusError};
`;

const OptionalLabel = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.typography.weight.regular};
    font-style: italic;
`;

const Input = styled.input<{ $hasError?: boolean }>`
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    border: 1px solid
    ${({ theme, $hasError }) =>
    $hasError ? theme.colors.statusError : theme.colors.borderDefault};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.size.md};

    &:focus {
        outline: none;
        border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.statusError : theme.colors.brandPrimary};
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    border: 1px solid
    ${({ theme, $hasError }) =>
    $hasError ? theme.colors.statusError : theme.colors.borderDefault};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.size.md};
    font-family: inherit;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.statusError : theme.colors.brandPrimary};
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }
`;

const Select = styled.select<{ $hasError?: boolean }>`
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    border: 1px solid
    ${({ theme, $hasError }) =>
    $hasError ? theme.colors.statusError : theme.colors.borderDefault};
    border-radius: ${({ theme }) => theme.radius.md};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.size.md};
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.statusError : theme.colors.brandPrimary};
    }
`;

const HelpText = styled.span`
    font-size: ${({ theme }) => theme.typography.size.xsm};
    color: ${({ theme }) => theme.colors.textMuted};
    font-style: italic;
`;

const TwoColumnGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing[4]};

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const LinkInputRow = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[2]};
`;

const IconButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => theme.spacing[2]};
    background: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.textInverted};
    border: none;
    border-radius: ${({ theme }) => theme.radius.md};
    cursor: pointer;

    &:hover {
        background: ${({ theme }) => theme.colors.accentSecondary};
    }
`;

const LinkList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[2]};
    margin-top: ${({ theme }) => theme.spacing[2]};
`;

const LinkItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[2]};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const LinkText = styled.a`
    color: ${({ theme }) => theme.colors.brandPrimary};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.size.sm};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
        text-decoration: underline;
    }
`;

const ErrorText = styled.span`
    font-size: ${({ theme }) => theme.typography.size.xsm};
    color: ${({ theme }) => theme.colors.statusError};
`;

const InfoBanner = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => theme.spacing[3]};
    background: ${({ theme }) => theme.colors.accentPrimary}33;
    border-radius: ${({ theme }) => theme.radius.md};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const InfoText = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const FormActions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[3]};
    justify-content: flex-end;
`;

const CancelButton = styled(BaseButton)`
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    color: ${({ theme }) => theme.colors.textPrimary};

    &:hover {
        background: ${({ theme }) => theme.colors.hoverBackground};
    }
`;

const SubmitButton = styled(BaseButton)`
    background: ${({ theme }) => theme.colors.brandPrimary};
    color: ${({ theme }) => theme.colors.textInverted};

    &:hover {
        background: ${({ theme }) => theme.colors.brandSecondary};
    }
`;