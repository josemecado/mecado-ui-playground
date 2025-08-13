import React from "react";
import styled from "styled-components";
import { ArrowUp, Square, Calculator, Presentation } from "lucide-react";
import { BaseButton, ButtonText } from "./sharedStyles";

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

export const SubmitButtons: React.FC<SubmitButtonsProps> = ({
  userTurn,
  isLoading,
  isToolConnected,
  disabled,
  inputMessage,
  selectedSpecialMode,
  setSelectedSpecialMode,
}) => {
  const handleSpecialModeClick = (mode: "handcalc" | "powerpoint") => {
    // If the clicked mode is already active, deactivate it (set to null)
    // Otherwise, activate the new mode
    setSelectedSpecialMode(selectedSpecialMode === mode ? null : mode);
  };

  return (
    <RightButtons>
      <SpecialModeButton
        className="SubmitButton"
        type="button"
        active={selectedSpecialMode === "handcalc"}
        onClick={() => handleSpecialModeClick("handcalc")}
      >
        <Calculator size={16} />
        <ButtonText>Calculation</ButtonText>
      </SpecialModeButton>

      <SpecialModeButton
        className="SubmitButton"
        type="button"
        active={selectedSpecialMode === "powerpoint"}
        onClick={() => handleSpecialModeClick("powerpoint")}
      >
        <Presentation size={16} />
        <ButtonText>Present</ButtonText>
      </SpecialModeButton>

      {userTurn ? (
        <SendButton className="SubmitButton" type="submit" active={true}>
          <ArrowUp size={16} />
          <ButtonText>Send</ButtonText>
        </SendButton>
      ) : (
        <StopButton className="SubmitButton" type="button">
          <Square size={16} />
          <ButtonText>Stop</ButtonText>
        </StopButton>
      )}
    </RightButtons>
  );
};

// Styled-components (unchanged)
const RightButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SpecialModeButton = styled(BaseButton)<{ active?: boolean }>`
  background: ${(props) =>
    props.active ? "var(--accent-primary)" : "var(--bg-secondary)"};
  color: ${(props) => (props.active ? "#fff" : "var(--text-primary)")};

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.active ? "var(--accent-primary)" : "var(--hover-bg)"};
  }
`;

const SendButton = styled(BaseButton)<{
  active?: boolean;
}>`
  background: var(--primary-action);
  color: ${(props) => (props.active ? "#fff" : "var(--text-primary)")};

  &:hover:not(:disabled) {
    border-color: #000000;
    background: var(--primary-action);
  }
`;

const StopButton = styled(BaseButton)`
  background: #ef4444;
  color: white;
  border-color: #ef4444;

  &:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
  }
`;
