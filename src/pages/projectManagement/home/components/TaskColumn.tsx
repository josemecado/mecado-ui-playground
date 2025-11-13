import React from "react";
import styled from "styled-components";
import {BoardColumn, Task} from "../types/types";
import {TaskCard} from "./TaskCard";
import {EmptyColumn} from "./EmptyColumn";

interface TaskColumnProps {
    column: BoardColumn;
    onTaskClick: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({column, onTaskClick}) => {
    return (
        <ColumnContainer>
            <ColumnHeader>
                <ColumnTitle>{column.title}</ColumnTitle>

                <TaskCount>
                    {column.tasks.length} {column.tasks.length === 1 ? "task" : "tasks"}
                </TaskCount>
            </ColumnHeader>

            <StyledDivider/>

            <ColumnContent>
                {column.tasks.length === 0 ? (
                    <EmptyColumn status={column.status}/>
                ) : (
                    column.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick}/>
                    ))
                )}
            </ColumnContent>
        </ColumnContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const ColumnContainer = styled.div`
    display: flex;
    flex-direction: column;
    //min-width: 300px;
    //max-width: 350px;
    height: fit-content;
    padding: ${({theme}) => theme.spacing[3]};
    gap: ${({theme}) => theme.primitives.spacing[3]};
    border-radius: ${({ theme }) => theme.primitives.radius.lg};

    background: ${({theme}) => theme.colors.backgroundTertiary};
`;

const ColumnHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${({theme}) => theme.spacing[1]};
`;

const ColumnTitle = styled.h2`
    font-family: ${({ theme }) => theme.typography.family.base};
    font-size: ${({theme}) => theme.typography.size.md};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    color: ${({theme}) => theme.colors.textPrimary};
    text-wrap: nowrap;
`;

const TaskCount = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({theme}) => `${theme.spacing[0.5]} ${theme.spacing[2]}`};
    background: ${({ theme }) => theme.colors.accentPrimary};
    
    color: #fff;
    
    border-radius: ${({theme}) => theme.radius.pill};
    font-size: ${({theme}) => theme.typography.size.sm};
    font-weight: ${({theme}) => theme.typography.weight.medium};
    opacity: 0.9;
`;

const ColumnContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({theme}) => theme.spacing[3]};
    border-radius: ${({theme}) => `0 0 ${theme.radius.lg} ${theme.radius.lg}`};
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: ${({theme}) => theme.colors.accentPrimary};
        border-radius: ${({theme}) => theme.radius.sm};
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${({theme}) => theme.colors.accentSecondary};
    }
`;

const StyledDivider = styled.div`
    width: 100%;
    height: 2px;
    background-color: ${({theme}) => theme.colors.accentTertiary};
`;