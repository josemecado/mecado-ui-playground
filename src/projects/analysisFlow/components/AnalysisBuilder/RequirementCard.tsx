// analysisFlow/components/AnalysisBuilder/RequirementCard.tsx
import React from "react";
import styled from "styled-components";
import { Requirement } from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { Check, Edit2, Trash2 } from "lucide-react";

interface RequirementCardProps {
  requirement: Requirement;
  onEdit: (requirement: Requirement) => void;
  onDelete: (id: string) => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader>
        <HeaderLeft>
          <IconBadge>
            <Check size={13} />
          </IconBadge>
          <CardTitle>{requirement.name}</CardTitle>
        </HeaderLeft>
        <CardActions>
          <IconBadge
            $isButton={true}
            onClick={() => onEdit(requirement)}
            title="Edit"
          >
            <Edit2 size={13} />
          </IconBadge>
          <IconBadge
            $isButton={true}
            onClick={() => onDelete(requirement.id)}
            title="Delete"
          >
            <Trash2 size={13} />
          </IconBadge>
        </CardActions>
      </CardHeader>

      <CardBody>
        <ExpressionDisplay>
          <code>{requirement.expression}</code>
          <Comparator>{requirement.comparator}</Comparator>
          <code>
            {requirement.targetValue} {requirement.unit}
          </code>
        </ExpressionDisplay>

        {requirement.description && (
          <Description>{requirement.description}</Description>
        )}
      </CardBody>
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
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

const IconBadge = styled.div<{ $isButton?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$isButton ? "22px" : "18px")};
  height: ${(props) => (props.$isButton ? "22px" : "18px")};
  border: 1px solid var(--border-outline);
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  background: ${(props) =>
    props.$isButton ? "var(--bg-secondary)" : "var(--primary-alternate)"};
  color: ${(props) =>
    props.$isButton ? "var(--text-primary)" : "var(--text-inverted)"};
  transition: all 0.2s ease;

  &:hover {
    cursor: pointer;
    background: ${(props) =>
      props.$isButton ? "var(--hover-bg)" : "var(--primary-alternate)"};
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 6px;
`;

const CardBody = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ExpressionDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 11px;
  flex-wrap: wrap;

  code {
    color: var(--text-muted);
    font-weight: 600;
  }
`;

const Comparator = styled.span`
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
`;

const Description = styled.p`
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
`;
