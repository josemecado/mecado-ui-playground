import React from "react";
import styled from "styled-components";
import "./containerStyles.css";

import { UploadButtons } from "./UploadButtons";
import { SubmitButtons } from "./SubmitButtons";

// Props interface
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

interface SubmitButtonsProps {
  userTurn: boolean;
  isLoading: boolean;
  isToolConnected: boolean;
  disabled?: boolean;
  inputMessage: string;
  selectedSpecialMode: "handcalc" | "powerpoint" | null;
  setSelectedSpecialMode: React.Dispatch<
    React.SetStateAction<"handcalc" | "powerpoint" | null>
  >;
  isStopping: boolean;
  stopThinking: () => void;
}

interface MessageInputBoxProps {
  uploadButtonsProps: UploadButtonsProps;
  submitButtonsProps: SubmitButtonsProps;
}

// ✅ Main UI component — STRIPPED DOWN
export const ChatInputBubble: React.FC<MessageInputBoxProps> = ({
  uploadButtonsProps,
  submitButtonsProps,
}) => {
  return (
    <ChatBox className="ChatBox">
      <ChatTextArea placeholder="Enter your message..." />

      <ButtonRowContainer className="ButtonRowContainer">
        <LeftControls>
          <UploadButtons {...uploadButtonsProps} />
        </LeftControls>

        <RightControls>
          <SubmitButtons {...submitButtonsProps} />
        </RightControls>
      </ButtonRowContainer>
    </ChatBox>
  );
};

const ChatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-height: 250px;
  border-radius: 32px;
  padding: 16px;
  background: var(--bg-secondary);
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  transition: all 0.3s ease;
`;

// The text area
const ChatTextArea = styled.textarea<{ disabled?: boolean }>`
  width: 100%;
  min-height: 40px;
  border: 0px solid #d1d5db;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;

  background-color: transparent;
  color: var(--text-primary);

  &:disabled {
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

// Controls section at the bottom
const ButtonRowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

// Left side controls (upload buttons)
const LeftControls = styled.div`
  display: flex;
  align-items: center;
`;

// Right side controls (submit buttons)
const RightControls = styled.div`
  display: flex;
  align-items: center;
`;
