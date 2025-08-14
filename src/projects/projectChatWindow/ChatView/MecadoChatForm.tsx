import React, { useState } from "react";
import styled from "styled-components";
import "./containerStyles.css";

import { ChatInputBubble } from "./ChatInputBubble";

const ChatForm: React.FC = () => {
  const [selectedSpecialMode, setSelectedSpecialMode] = useState<
    "handcalc" | "powerpoint" | null
  >(null);

  const uploadButtonsProps = {
    toolString: "",
    isLoading: false,
    isToolConnected: true,
    userTurn: true,
    selectedFiles: [],
    hasGeometry: false,
    handleFileUpload: async () => {},
    handleGeometryUpload: () => {},
    handleNonGeometryUpload: () => {},
  };

  // 2. Pass the real state and setter to the submitButtonsProps
  const submitButtonsProps = {
    userTurn: true,
    isLoading: false,
    isToolConnected: true,
    disabled: false,
    inputMessage: "",
    selectedSpecialMode: selectedSpecialMode,
    setSelectedSpecialMode: setSelectedSpecialMode,
    isStopping: false,
    stopThinking: () => {},
  };

  return (
    <ChatFormContainer className="ChatFormContainer">
      <InputContainer className="InputContainer">
        <ChatInputBubble
          uploadButtonsProps={uploadButtonsProps}
          submitButtonsProps={submitButtonsProps}
        />
      </InputContainer>
    </ChatFormContainer>
  );
};

export default ChatForm;

// Main form containers
export const ChatFormContainer = styled.form<{ disabled?: boolean }>`
  display: flex;
  flex: 2 1 0; // Grows 2x more than DetailBar
  justify-content: center;
  align-items: flex-end;
  min-width: 300px;
  background: var(--bg-primary);
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
  transition: opacity 0.2s ease;
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 200px;
  transition: all 0.3s ease;
`;
