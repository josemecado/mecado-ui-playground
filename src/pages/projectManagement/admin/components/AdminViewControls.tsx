// admin/components/AdminViewControls.tsx
import React from "react";
import styled from "styled-components";
import { LayoutGrid, List, Search, Filter, ArrowUpDown, User, Flag } from "lucide-react";

export type ViewMode = 'board' | 'table';
export type SortBy = 'status' | 'assignedTo' | 'priority' | 'dueDate' | 'title';
export type SortOrder = 'asc' | 'desc';
export type StatusFilter = 'all' | 'assigned' | 'awaiting_review' | 'completed';

interface AdminViewControlsProps {
    // View mode
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;

    // Search
    searchQuery: string;
    onSearchChange: (query: string) => void;

    // Filters
    filterPriority: string;
    onFilterPriorityChange: (priority: string) => void;

    filterStatus: StatusFilter;
    onFilterStatusChange: (status: StatusFilter) => void;

    filterAssignedTo: string;
    onFilterAssignedToChange: (user: string) => void;

    // Sorting
    sortBy: SortBy;
    onSortByChange: (sortBy: SortBy) => void;

    sortOrder: SortOrder;
    onSortOrderChange: (order: SortOrder) => void;

    // Available users for filter
    availableUsers?: string[];
}

export const AdminViewControls: React.FC<AdminViewControlsProps> = ({
                                                                        viewMode,
                                                                        onViewModeChange,
                                                                        searchQuery,
                                                                        onSearchChange,
                                                                        filterPriority,
                                                                        onFilterPriorityChange,
                                                                        filterStatus,
                                                                        onFilterStatusChange,
                                                                        filterAssignedTo,
                                                                        onFilterAssignedToChange,
                                                                        sortBy,
                                                                        onSortByChange,
                                                                        sortOrder,
                                                                        onSortOrderChange,
                                                                        availableUsers = [],
                                                                    }) => {
    const toggleSortOrder = () => {
        onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    return (
        <ControlsContainer>
            {/* Top Row: View Toggle */}
            <TopRow>
                <ViewTabs>
                    <ViewTab
                        $active={viewMode === 'board'}
                        onClick={() => onViewModeChange('board')}
                    >
                        <LayoutGrid size={16} />
                        Board
                    </ViewTab>
                    <ViewTab
                        $active={viewMode === 'table'}
                        onClick={() => onViewModeChange('table')}
                    >
                        <List size={16} />
                        Table
                    </ViewTab>
                </ViewTabs>

                {/* Search */}
                <SearchBar>
                    <SearchIcon>
                        <Search size={16} />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </SearchBar>
            </TopRow>

            {/* Bottom Row: Filters and Sorting */}
            <BottomRow>
                <FiltersGroup>
                    {/* Status Filter */}
                    <FilterControl>
                        <FilterIcon>
                            <Flag size={16} />
                        </FilterIcon>
                        <FilterLabel>Status:</FilterLabel>
                        <FilterSelect
                            value={filterStatus}
                            onChange={(e) => onFilterStatusChange(e.target.value as StatusFilter)}
                        >
                            <option value="all">All</option>
                            <option value="assigned">Assigned/To Do</option>
                            <option value="awaiting_review">Awaiting Review</option>
                            <option value="completed">Completed</option>
                        </FilterSelect>
                    </FilterControl>

                    {/* Assigned To Filter */}
                    <FilterControl>
                        <FilterIcon>
                            <User size={16} />
                        </FilterIcon>
                        <FilterLabel>Assigned To:</FilterLabel>
                        <FilterSelect
                            value={filterAssignedTo}
                            onChange={(e) => onFilterAssignedToChange(e.target.value)}
                        >
                            <option value="all">All Users</option>
                            {availableUsers.map((user) => (
                                <option key={user} value={user}>
                                    {user.split('@')[0]}
                                </option>
                            ))}
                        </FilterSelect>
                    </FilterControl>

                    {/* Priority Filter */}
                    <FilterControl>
                        <FilterIcon>
                            <Filter size={16} />
                        </FilterIcon>
                        <FilterLabel>Priority:</FilterLabel>
                        <FilterSelect
                            value={filterPriority}
                            onChange={(e) => onFilterPriorityChange(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </FilterSelect>
                    </FilterControl>
                </FiltersGroup>

                {/* Sorting */}
                <SortingGroup>
                    <SortControl>
                        <SortIcon>
                            <ArrowUpDown size={16} />
                        </SortIcon>
                        <SortLabel>Sort By:</SortLabel>
                        <SortSelect
                            value={sortBy}
                            onChange={(e) => onSortByChange(e.target.value as SortBy)}
                        >
                            <option value="status">Status</option>
                            <option value="assignedTo">Assigned To</option>
                            <option value="priority">Priority</option>
                            <option value="dueDate">Due Date</option>
                            <option value="title">Title</option>
                        </SortSelect>
                    </SortControl>

                    <SortOrderButton onClick={toggleSortOrder} title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </SortOrderButton>
                </SortingGroup>
            </BottomRow>
        </ControlsContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const ControlsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[3]};
`;

const TopRow = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[4]};
    align-items: center;
`;

const BottomRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[4]};
    flex-wrap: wrap;
`;

const ViewTabs = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[1]};
    padding: ${({ theme }) => theme.primitives.paddingX.xxs};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const ViewTab = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.md}`};
    background: ${({ theme, $active }) =>
    $active ? theme.colors.brandPrimary : 'transparent'};
    color: ${({ theme, $active }) =>
    $active ? theme.colors.textInverted : theme.colors.textMuted};
    border: none;
    border-radius: ${({ theme }) => theme.radius.sm};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animation.duration.fast};

    &:hover {
        background: ${({ theme, $active }) =>
    $active ? theme.colors.brandPrimary : theme.colors.backgroundPrimary};
        color: ${({ theme, $active }) =>
    $active ? theme.colors.textInverted : theme.colors.textPrimary};
    }
`;

const SearchBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    flex: 1;
    max-width: 400px;
    padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.sm}`};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.md};

    &:focus-within {
        border-color: ${({ theme }) => theme.colors.brandPrimary};
    }
`;

const SearchIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }
`;

const FiltersGroup = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[3]};
    align-items: center;
    flex-wrap: wrap;
`;

const FilterControl = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.sm}`};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const FilterIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const FilterLabel = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const FilterSelect = styled.select`
    border: none;
    background: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    cursor: pointer;
    min-width: 100px;

    &:hover {
        color: ${({ theme }) => theme.colors.brandPrimary};
    }
`;

const SortingGroup = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing[2]};
    align-items: center;
`;

const SortControl = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.sm}`};
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.md};
`;

const SortIcon = styled.div`
    display: flex;
    color: ${({ theme }) => theme.colors.textMuted};
`;

const SortLabel = styled.span`
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textMuted};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const SortSelect = styled.select`
    border: none;
    background: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weight.medium};
    cursor: pointer;
    min-width: 120px;

    &:hover {
        color: ${({ theme }) => theme.colors.brandPrimary};
    }
`;

const SortOrderButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: ${({ theme }) => theme.colors.backgroundTertiary};
    border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    border-radius: ${({ theme }) => theme.radius.md};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.size.lg};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    cursor: pointer;
    transition: all ${({ theme }) => theme.animation.duration.fast};

    &:hover {
        background: ${({ theme }) => theme.colors.brandPrimary};
        color: ${({ theme }) => theme.colors.textInverted};
        border-color: ${({ theme }) => theme.colors.brandPrimary};
    }
`;