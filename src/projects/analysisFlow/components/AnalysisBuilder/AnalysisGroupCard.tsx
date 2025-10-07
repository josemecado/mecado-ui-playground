// analysisFlow/components/AnalysisBuilder/AnalysisGroupCard.tsx
import React from "react";
import styled from "styled-components";
import { AnalysisGroup } from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { Edit2, Trash2, Settings, CheckCircle, Clock, XCircle } from "lucide-react";

interface AnalysisGroupCardProps {
  group: AnalysisGroup;
  onEdit: (group: AnalysisGroup) => void;
  onDelete: (id: string) => void;
}

export const AnalysisGroupCard: React.FC<AnalysisGroupCardProps> = ({
  group,
  onEdit,
  onDelete,
}) => {
  const getStatusIcon = () => {
    switch (group.status) {
      case "complete":
        return <CheckCircle size={14} />;
      case "running":
        return <Clock size={14} />;
      case "error":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };


  return (
    <Card>
      <CardHeader>
        <HeaderLeft>
          <StatusBadge $status={group.status}>
            {getStatusIcon()}
          </StatusBadge>
          <CardTitle>{group.name}</CardTitle>
          <AnalysisCount>{group.analyses.length} analyses</AnalysisCount>
        </HeaderLeft>
        <CardActions>
          <IconButton onClick={() => onEdit(group)} title="Edit">
            <Edit2 size={13} />
          </IconButton>
          <IconButton onClick={() => onDelete(group.id)} title="Delete">
            <Trash2 size={13} />
          </IconButton>
        </CardActions>
      </CardHeader>

      <CardBody>
        <AnalysesList>
          {group.analyses.map((analysis) => (
            <AnalysisItem key={analysis.id}>
              <AnalysisIcon>
                <Settings size={12} />
              </AnalysisIcon>
              <AnalysisInfo>
                <AnalysisName>{analysis.name}</AnalysisName>
                <AnalysisType>{analysis.type}</AnalysisType>
              </AnalysisInfo>
              {analysis.requirements && analysis.requirements.length > 0 && (
                <RequirementBadge>
                  {analysis.requirements.length} req
                </RequirementBadge>
              )}
            </AnalysisItem>
          ))}
        </AnalysesList>
      </CardBody>
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  flex-shrink: 0;
  background: ${(props) => {
    switch (props.$status) {
      case "complete":
        return "rgba(34, 197, 94, 0.1)";
      case "running":
        return "rgba(245, 158, 11, 0.1)";
      case "error":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "var(--bg-tertiary)";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "complete":
        return "var(--success)";
      case "running":
        return "var(--caution)";
      case "error":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  }};
`;

const AnalysisCount = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
`;

const CardActions = styled.div`
  display: flex;
  gap: 6px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--accent-primary);
  }
`;

const CardBody = styled.div`
  padding: 12px 16px;
`;

const AnalysesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnalysisItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
  }
`;

const AnalysisIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--accent-primary);
  flex-shrink: 0;
`;

const AnalysisInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const AnalysisName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AnalysisType = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  text-transform: capitalize;
`;

const RequirementBadge = styled.div`
  padding: 3px 8px;
  background: var(--accent-primary);
  color: var(--text-inverted);
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
`;