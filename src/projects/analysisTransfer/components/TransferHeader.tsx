import React, { useState } from "react";
import styled from "styled-components";
import { Box } from "lucide-react";

import { BaseButton } from "components/buttons/BaseButton"

interface MockUnmappedData {
  oldGeometry: {
    bodies: number;
    faces: number;
    edges: number;
  };
  newGeometry: {
    bodies: number;
    faces: number;
    edges: number;
  };
}

export const TransferHeader: React.FC = () => {
  const [linkedCount, setLinkedCount] = useState(0);
  const [markedDeleted, setMarkedDeleted] = useState(0);
  const [markedNew, setMarkedNew] = useState(0);

  //Mock Data
  const unmappedData: MockUnmappedData = {
    oldGeometry: {
      bodies: 8,
      faces: 156,
      edges: 342,
    },
    newGeometry: {
      bodies: 12,
      faces: 189,
      edges: 398,
    },
  };

  const totalOriginal =
    Object.values(unmappedData.oldGeometry).reduce((a, b) => a + b, 0) +
    Object.values(unmappedData.newGeometry).reduce((a, b) => a + b, 0);
  const totalProcessed = linkedCount + markedDeleted + markedNew;
  const progressPercent =
    totalOriginal > 0 ? (totalProcessed / totalOriginal) * 100 : 0;

  return (
    <ViewerHeader>
      <ProgressSection>
        <ProgressHeader>
          <ProgressTitle>Transfer Progress</ProgressTitle>
          <ProgressPercent>{Math.round(progressPercent)}%</ProgressPercent>
        </ProgressHeader>
        <ProgressBar>
          <ProgressFill style={{ width: `${progressPercent}%` }} />
        </ProgressBar>
      </ProgressSection>

      <ViewerTitleSection>
        <ViewerTitle>FEA Transfer Wizard</ViewerTitle>
        <ViewerSubtitle>
          Seamlessly transfer analyses between similar geometries
        </ViewerSubtitle>
      </ViewerTitleSection>

      <ButtonsSection>
        <BaseButton onClick={() => {}} $variant="pill" $config="standard">
          Finish
        </BaseButton>
      </ButtonsSection>
    </ViewerHeader>
  );
};

const ViewerHeader = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  height: 40px;

  padding: 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-bg);
`;

const ViewerTitleSection = styled.div`
  flex: 2;
  text-align: center;
`;

const ButtonsSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const ViewerTitle = styled.h3`
  margin: 0 0 2px 0;
  font-size: 18px;
  font-weight: 600;
`;

const ViewerSubtitle = styled.p`
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
`;

// Progress Section Styled Components
const ProgressSection = styled.div`
  flex: 1;
  background-color: var(--bg-secondary);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProgressTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const ProgressPercent = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-muted);
`;

const ProgressBar = styled.div`
  height: 8px;
  background: var(--text-muted);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-action),
    var(--accent-primary)
  );
  transition: width 0.3s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  gap: 16px;
`;

const ProgressStat = styled.div`
  text-align: center;
  flex: 1;
`;

const ProgressStatNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ProgressStatLabel = styled.div`
  font-size: 12px;
  color: var(--text-muted);
`;
