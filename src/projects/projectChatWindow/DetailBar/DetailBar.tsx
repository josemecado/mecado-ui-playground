import styled from "styled-components";
import { useState } from "react";

const DetailBarContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${(props) => (props.isExpanded ? "2 1 0" : "1 1 0")};
  background-color: var(--bg-secondary);
  padding: 24px;
  transition: all 0.3s ease; // Add a transition for a smoother effect
  gap: 32px;
`;

const TopSection = styled.div`
  display: flex;
  flex: 1 1 0;
  background: var(--primary-alternate);
  border-radius: 12px;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 2 1 0;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const ResizableRectangle = styled.div<{ isExpanded: boolean }>`
  width: 100%;
  height: ${(props) => (props.isExpanded ? "100%" : "70%")};
  background: var(--bg-primary);
  transition: all 0.3s ease;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
`;

const ResizeButton = styled.button`
  padding: 8px 16px;
  background-color: var(--accent-primary);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease; // Add a transition for a smoother effect

  &:hover {
    transform: scale(1.05);
  }
`;

export default function DetailBar(): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleToggle = (): void => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <DetailBarContainer isExpanded={isExpanded}>
      <TopSection />
      <BottomSection>
        <ResizableRectangle isExpanded={isExpanded} />
        <ResizeButton onClick={handleToggle}>
          {isExpanded ? "Compact" : "Expand"}
        </ResizeButton>
      </BottomSection>
    </DetailBarContainer>
  );
}
