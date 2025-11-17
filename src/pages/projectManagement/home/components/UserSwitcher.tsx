// home/components/UserSwitcher.tsx
// Component to switch between mock users for testing

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown, User as UserIcon, Check } from 'lucide-react';
import { useUser, User } from '../../context/UserContext';
import { mockUsers } from '../../admin/utils/mockAdminData';

export const UserSwitcher: React.FC = () => {
    const { currentUser, switchUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUserSwitch = (email: string) => {
        switchUser(email);
        setIsOpen(false);
    };

    if (!currentUser) return null;

    return (
        <SwitcherContainer ref={dropdownRef}>
            <CurrentUserButton onClick={() => setIsOpen(!isOpen)}>
                <UserAvatar>
                    <UserIcon size={18} />
                </UserAvatar>
                <UserInfo>
                    <UserName>{currentUser.username}</UserName>
                    <UserRole>{currentUser.role}</UserRole>
                </UserInfo>
                <ChevronIcon $isOpen={isOpen}>
                    <ChevronDown size={16} />
                </ChevronIcon>
            </CurrentUserButton>

            {isOpen && (
                <Dropdown>
                    <DropdownHeader>Switch User (Testing)</DropdownHeader>
                    <UserList>
                        {mockUsers.map((user) => (
                            <UserOption
                                key={user.id}
                                onClick={() => handleUserSwitch(user.email)}
                                $isActive={user.email === currentUser.email}
                            >
                                <UserOptionAvatar>
                                    <UserIcon size={14} />
                                </UserOptionAvatar>
                                <UserOptionInfo>
                                    <UserOptionName>{user.username}</UserOptionName>
                                    <UserOptionRole>{user.role}</UserOptionRole>
                                </UserOptionInfo>
                                {user.email === currentUser.email && (
                                    <CheckIcon>
                                        <Check size={16} />
                                    </CheckIcon>
                                )}
                            </UserOption>
                        ))}
                    </UserList>
                </Dropdown>
            )}
        </SwitcherContainer>
    );
};

// ======================
// 🔹 Styled Components
// ======================

const SwitcherContainer = styled.div`
  position: relative;
`;

const CurrentUserButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => `${theme.primitives.paddingY.xsm} ${theme.primitives.paddingX.sm}`};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundPrimary};
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.pill};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

const UserName = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserRole = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xsm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: capitalize;
`;

const ChevronIcon = styled.div<{ $isOpen: boolean }>`
  display: flex;
  color: ${({ theme }) => theme.colors.textMuted};
  transition: transform ${({ theme }) => theme.animation.duration.fast};
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => theme.spacing[2]});
  right: 0;
  min-width: 240px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.lg};
  z-index: 1000;
  overflow: hidden;
`;

const DropdownHeader = styled.div`
  padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  font-size: ${({ theme }) => theme.typography.size.xsm};
  font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const UserList = styled.div`
  padding: ${({ theme }) => theme.spacing[1]};
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accentPrimary};
    border-radius: ${({ theme }) => theme.radius.pill};
  }
`;

const UserOption = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  width: 100%;
  padding: ${({ theme }) => `${theme.primitives.paddingY.sm} ${theme.primitives.paddingX.md}`};
  background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.brandPrimary + '15' : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.brandPrimary + '25' : theme.colors.backgroundTertiary};
  }
`;

const UserOptionAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: ${({ theme }) => theme.colors.accentPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border-radius: ${({ theme }) => theme.radius.pill};
  flex-shrink: 0;
`;

const UserOptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
`;

const UserOptionName = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const UserOptionRole = styled.div`
  font-size: ${({ theme }) => theme.typography.size.xsm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: capitalize;
`;

const CheckIcon = styled.div`
  display: flex;
  color: ${({ theme }) => theme.colors.brandPrimary};
  flex-shrink: 0;
`;