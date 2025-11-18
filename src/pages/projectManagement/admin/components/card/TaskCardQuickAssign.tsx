// admin/components/task-card/TaskCardQuickAssign.tsx
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { UserPlus, Check } from "lucide-react";
import { User } from "../../types/admin.types";

interface TaskCardQuickAssignProps {
    currentAssignee?: string;
    availableUsers: User[];
    onAssign: (userEmail: string) => void;
}

export const TaskCardQuickAssign: React.FC<TaskCardQuickAssignProps> = ({
                                                                            currentAssignee,
                                                                            availableUsers,
                                                                            onAssign,
                                                                        }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleAssign = (userEmail: string) => {
        onAssign(userEmail);
        setIsOpen(false);
    };

    // Filter out admin/reviewer roles, only show labeler/uploader
    const assignableUsers = availableUsers.filter(
        (user) => user.role === 'labeler' || user.role === 'uploader'
    );

    return (
        <Container ref={dropdownRef}>
            <AssignButton onClick={() => setIsOpen(!isOpen)}>
                <UserPlus size={14} />
                {currentAssignee ? 'Reassign' : 'Assign'}
            </AssignButton>

            {isOpen && (
                <Dropdown>
                    <DropdownHeader>Assign to:</DropdownHeader>
                    {assignableUsers.map((user) => (
                        <DropdownItem
                            key={user.id}
                            onClick={() => handleAssign(user.email)}
                            $isSelected={currentAssignee === user.email}
                        >
                            <UserInfo>
                                <Username>{user.username}</Username>
                                <UserEmail>{user.email}</UserEmail>
                            </UserInfo>
                            {currentAssignee === user.email && (
                                <CheckIcon>
                                    <Check size={14} />
                                </CheckIcon>
                            )}
                        </DropdownItem>
                    ))}
                </Dropdown>
            )}
        </Container>
    );
};

// Styled Components
const Container = styled.div`
    position: relative;
`;

const AssignButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xxs} ${theme.primitives.paddingX.sm}`};
    background: ${({ theme }) => theme.colors.accentPrimary};
    color: ${({ theme }) => theme.colors.textInverted};
    border: none;
    border-radius: ${({ theme }) => theme.radius.md};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.standard};

    &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const Dropdown = styled.div`
    position: absolute;
    bottom: calc(100% + ${({ theme }) => theme.spacing[2]});
    right: 0;
    min-width: 220px;
    background: ${({ theme }) => theme.colors.backgroundSecondary};
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: ${({ theme }) => theme.radius.md};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
`;

const DropdownHeader = styled.div`
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    font-size: ${({ theme }) => theme.typography.size.xsm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textMuted};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const DropdownItem = styled.button<{ $isSelected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
    background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.accentPrimary + '22' : 'transparent'};
    border: none;
    cursor: pointer;
    transition: background ${({ theme }) => theme.animation.duration.fast} ${({ theme }) => theme.animation.easing.standard};

    &:hover {
        background: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.accentPrimary + '33' : theme.colors.backgroundTertiary};
    }

    &:not(:last-child) {
        border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing[0.5]};
`;

const Username = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserEmail = styled.span`
    font-size: ${({ theme }) => theme.typography.size.xsm};
    color: ${({ theme }) => theme.colors.textMuted};
`;

const CheckIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.statusSuccess};
`;