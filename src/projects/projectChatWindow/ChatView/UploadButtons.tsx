import React from "react";
import styled from "styled-components";
import { Paperclip, Download, Box, ChevronDown } from "lucide-react";
import { BaseButton } from "./sharedStyles";
import "./containerStyles.css";

interface UploadButtonsProps {
  toolString: string;
  isLoading: boolean;
  disabled?: boolean;
  isToolConnected: boolean;
  userTurn: boolean;
  selectedFiles: File[];
  hasGeometry: boolean;
  handleFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  handleGeometryUpload: () => void;
  handleNonGeometryUpload: () => void;
}

export const UploadButtons: React.FC<UploadButtonsProps> = ({ toolString }) => {
  const isOpen = false; // static for stripped version

  return (
    <DropdownContainer>
      <DropdownButton className="DropDownButton" isOpen={isOpen} type="button">
        <Download size={14} />
        <span>Import</span>
        <ChevronDown size={14} />
      </DropdownButton>

      <DropdownMenu isOpen={isOpen}>
        <DropdownItem type="button">
          <Paperclip size={16} />
          <span>Upload Files</span>
        </DropdownItem>

        <DropdownItem type="button">
          <Box size={16} />
          <span>Upload 3D Geometry (STEP/STP)</span>
        </DropdownItem>
      </DropdownMenu>

      <HiddenFileInput type="file" multiple />
    </DropdownContainer>
  );
};

// ========================
// Styled Components BELOW
// ========================

// Main dropdown container
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

// Main dropdown button
const DropdownButton = styled(BaseButton)<{ isOpen?: boolean }>`
  ${(props) =>
    props.isOpen &&
    `
    background: var(--bg-tertiary);
    border-color: var(--text-muted);
  `}
`;

// Dropdown menu
const DropdownMenu = styled.div<{ isOpen: boolean }>`
  display: flex;
  width: 180px;
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  border: 1px solid var(--text-muted);
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  overflow: hidden;
  display: ${(props) => (props.isOpen ? "block" : "none")};
`;

// Dropdown menu items
const DropdownItem = styled.button<{ disabled?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  transition: background-color 0.2s ease;
  font-size: 12px;
  text-align: left;

  &:hover:not(:disabled) {
    background: var(--bg-hover);
  }

  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
`;

// Hidden file input
const HiddenFileInput = styled.input`
  display: none;
`;
