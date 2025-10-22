// analysisFlow/components/AnalysisBuilder/RequirementCard.tsx
import React from "react";
import styled from "styled-components";
import { Requirement, AnalysisGroup } from "../../../versionNodes/utils/VersionInterfaces";
import { Edit2, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface RequirementCardProps {
  requirement: Requirement;
  analysisGroups: AnalysisGroup[];
  onEdit: (requirement: Requirement) => void;
  onDelete: (id: string) => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  analysisGroups,
  onEdit,
  onDelete,
}) => {
  // Find all analyses that use this requirement
  const associatedAnalyses = analysisGroups.flatMap((group) =>
    group.analyses
      .filter((analysis) =>
        analysis.requirements?.some((req) => req.id === requirement.id)
      )
      .map((analysis) => ({
        analysis,
        groupName: group.name,
        requirement: analysis.requirements?.find((req) => req.id === requirement.id)!,
      }))
  );

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle size={14} />;
      case "fail":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  };

  return (
    <Card>
      <CardHeader>
        <HeaderLeft>
          <IconBadge>
            <CheckCircle size={13} />
          </IconBadge>
          <CardTitle>{requirement.name}</CardTitle>
        </HeaderLeft>
        <CardActions>
          <IconButton onClick={() => onEdit(requirement)} title="Edit">
            <Edit2 size={14} />
          </IconButton>
          <IconButton onClick={() => onDelete(requirement.id)} title="Delete">
            <Trash2 size={14} />
          </IconButton>
        </CardActions>
      </CardHeader>

      <CardBody>
        {/* Requirement Expression */}
        <Section>
          <SectionLabel>Condition</SectionLabel>
          <ExpressionDisplay>
            <code>{requirement.expression}</code>
            <Comparator>{requirement.comparator}</Comparator>
            <code>
              {requirement.targetValue} {requirement.unit}
            </code>
          </ExpressionDisplay>
        </Section>

        {/* Description */}
        {requirement.description && (
          <Section>
            <Description>{requirement.description}</Description>
          </Section>
        )}

        {/* Associated Analyses */}
        <Section>
          <SectionLabel>
            Applied to {associatedAnalyses.length} Analyse{associatedAnalyses.length !== 1 ? 's' : ''}
          </SectionLabel>

          {associatedAnalyses.length > 0 ? (
            <AnalysesList>
              {associatedAnalyses.map(({ analysis, groupName, requirement: analysisReq }) => (
                <AnalysisItem key={`${analysis.id}-${requirement.id}`}>
                  <AnalysisHeader>
                    <AnalysisInfo>
                      <AnalysisName>{analysis.name}</AnalysisName>
                      <GroupLabel>{groupName}</GroupLabel>
                    </AnalysisInfo>
                    <StatusBadge $status={analysisReq.status}>
                      {getStatusIcon(analysisReq.status)}
                    </StatusBadge>
                  </AnalysisHeader>

                  {/* Evaluation Result */}
                  {analysisReq.currentValue !== undefined ? (
                    <EvaluationRow $status={analysisReq.status}>
                      <EvaluationLabel>Result:</EvaluationLabel>
                      <ValueDisplay $isActual>
                        {analysisReq.currentValue.toFixed(3)} {analysisReq.unit}
                      </ValueDisplay>
                      <ComparatorSymbol>{analysisReq.comparator}</ComparatorSymbol>
                      <ValueDisplay $isTarget $passed={analysisReq.status === "pass"}>
                        {analysisReq.targetValue.toFixed(3)} {analysisReq.unit}
                      </ValueDisplay>
                      <StatusText $status={analysisReq.status}>
                        {analysisReq.status === "pass" ? "PASS" : "FAIL"}
                      </StatusText>
                    </EvaluationRow>
                  ) : (
                    <PendingRow>
                      <Clock size={12} />
                      <PendingText>Awaiting evaluation</PendingText>
                    </PendingRow>
                  )}
                </AnalysisItem>
              ))}
            </AnalysesList>
          ) : (
            <EmptyAnalyses>
              <AlertTriangle size={16} />
              <EmptyText>Not applied to any analyses yet</EmptyText>
            </EmptyAnalyses>
          )}
        </Section>
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
  padding: 12px 14px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-outline);
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

const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1px solid var(--border-outline);
  border-radius: 5px;
  flex-shrink: 0;
  background: var(--primary-alternate);
  color: var(--text-inverted);
`;

const CardActions = styled.div`
  display: flex;
  gap: 6px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  width: 30px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 5px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--accent-primary);
  }
`;

const CardBody = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
    color: var(--accent-primary);
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
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid var(--accent-primary);
`;

const AnalysesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnalysisItem = styled.div`
  padding: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnalysisHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
`;

const GroupLabel = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StatusBadge = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${(props) => {
    switch (props.$status) {
      case "pass":
        return "rgba(34, 197, 94, 0.1)";
      case "fail":
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "var(--bg-secondary)";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  }};
`;

const EvaluationRow = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: ${(props) => {
    switch (props.$status) {
      case "pass":
        return "rgba(34, 197, 94, 0.08)";
      case "fail":
        return "rgba(239, 68, 68, 0.08)";
      default:
        return "var(--bg-secondary)";
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.$status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--border-bg)";
    }
  }};
  border-radius: 6px;
  font-size: 10px;
  flex-wrap: wrap;
`;

const EvaluationLabel = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const ValueDisplay = styled.span<{ $isActual?: boolean; $isTarget?: boolean; $passed?: boolean }>`
  font-weight: 700;
  color: ${(props) => {
    if (props.$isActual) return "var(--text-primary)";
    if (props.$isTarget) return props.$passed ? "var(--success)" : "var(--error)";
    return "var(--text-muted)";
  }};
`;

const ComparatorSymbol = styled.span`
  color: var(--text-muted);
  font-weight: 600;
  padding: 0 2px;
`;

const StatusText = styled.span<{ $status?: string }>`
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: ${(props) => {
    switch (props.$status) {
      case "pass":
        return "var(--success)";
      case "fail":
        return "var(--error)";
      default:
        return "var(--text-muted)";
    }
  }};
  color: white;
`;

const PendingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  color: var(--text-muted);
`;

const PendingText = styled.span`
  font-size: 10px;
  font-weight: 500;
`;

const EmptyAnalyses = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px dashed var(--border-bg);
  border-radius: 6px;
  color: var(--text-muted);
`;

const EmptyText = styled.span`
  font-size: 11px;
  font-weight: 500;
`;