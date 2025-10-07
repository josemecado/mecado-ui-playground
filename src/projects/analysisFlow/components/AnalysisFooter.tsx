// components/AnalysisDetailsFooter.tsx
import React, { useState, useMemo } from "react";
import styled from "styled-components";
import {
  Analysis,
  Requirement,
} from "../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Activity,
  FileText,
  Settings,
  X,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";

interface AnalysisDetailsFooterProps {
  analysis: Analysis | null;
  onClose: () => void;
}

type SortOption = "default" | "status" | "priority";

export const AnalysisDetailsFooter: React.FC<AnalysisDetailsFooterProps> = ({
  analysis,
  onClose,
}) => {
  const [requirementSort, setRequirementSort] = useState<SortOption>("default");

  if (!analysis) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={14} />;
      case "failed":
        return <XCircle size={14} />;
      case "running":
        return <Activity size={14} className="spin" />;
      default:
        return <Clock size={14} />;
    }
  };

  const getRequirementStatusIcon = (status?: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle size={12} />;
      case "fail":
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  // Helper to calculate difference between actual and target
  const calculateDifference = (
    req: Requirement
  ): { value: number; percentage: number; isGood: boolean } | null => {
    if (req.currentValue === undefined) return null;

    const diff = req.currentValue - req.targetValue;
    const percentage =
      req.targetValue !== 0 ? (diff / req.targetValue) * 100 : 0;

    // Determine if difference is "good" based on comparator and whether requirement passed
    const isGood = req.status === "pass";

    return { value: diff, percentage, isGood };
  };

  // Sort requirements based on selected option
  const sortedRequirements = useMemo(() => {
    if (!analysis.requirements) return [];

    const reqs = [...analysis.requirements];
    switch (requirementSort) {
      case "status":
        return reqs.sort((a, b) => {
          const order = { fail: 0, pending: 1, pass: 2 };
          return (
            (order[a.status || "pending"] || 1) -
            (order[b.status || "pending"] || 1)
          );
        });
      case "priority":
        return reqs.sort((a, b) => {
          const order = { critical: 0, important: 1, standard: 2 };
          return order[a.priority] - order[b.priority];
        });
      default:
        return reqs;
    }
  }, [analysis.requirements, requirementSort]);

  const cycleSortOption = () => {
    setRequirementSort((prev) => {
      if (prev === "default") return "status";
      if (prev === "status") return "priority";
      return "default";
    });
  };

  return (
    <FooterContainer>
      <FooterHeader>
        <HeaderLeft>
          <TitleSection>
            <Title>Analysis Details</Title>
            <AnalysisName>{analysis.name}</AnalysisName>
          </TitleSection>
          <InfoCardsRow>
            <InfoCard>
              <InfoValue $status={analysis.status}>
                {getStatusIcon(analysis.status)}
                <span>{analysis.status}</span>
              </InfoValue>
            </InfoCard>
          </InfoCardsRow>
        </HeaderLeft>

        <HeaderRight>
          <ActionButtons>
            <ActionButton
              $variant="primary"
              disabled={analysis.status === "running"}
            >
              <Settings size={14} />
              Configure
            </ActionButton>
            <ActionButton
              $variant="secondary"
              disabled={analysis.status === "running"}
            >
              <Activity size={14} />
              {analysis.status === "failed" ? "Retry" : "Re-run"}
            </ActionButton>
            <ActionButton $variant="tertiary">
              <FileText size={14} />
              View Logs
            </ActionButton>
          </ActionButtons>
          <CloseButton onClick={onClose}>
            <X size={16} />
          </CloseButton>
        </HeaderRight>
      </FooterHeader>

      <FooterContent>
        {/* Requirements Table - Left Side */}
        {analysis.requirements && analysis.requirements.length > 0 && (
          <RequirementsSection>
            <SectionHeader>
              <SectionTitle>
                <FileText size={14} />
                Requirements ({sortedRequirements.length})
              </SectionTitle>
              <SortButton onClick={cycleSortOption}>
                <ArrowUpDown size={12} />
                Sort: {requirementSort}
              </SortButton>
            </SectionHeader>
            <RequirementsTable>
              <TableHeader>
                <HeaderCell $width="24%">Requirement</HeaderCell>
                <HeaderCell $width="19%">Target</HeaderCell>
                <HeaderCell $width="19%">Actual</HeaderCell>
                <HeaderCell $width="19%">Difference</HeaderCell>
                <HeaderCell $width="19%">Priority</HeaderCell>
              </TableHeader>
              <TableBody>
                {sortedRequirements.map((req) => {
                  const difference = calculateDifference(req);
                  return (
                    <TableRow key={req.id} $status={req.status}>
                      <TableCell $width="24%">
                        <RequirementNameCell>
                          <StatusIconCell $status={req.status}>
                            {getRequirementStatusIcon(req.status)}
                          </StatusIconCell>
                          <RequirementDetails>
                            <RequirementName $status={req.status}>
                              {req.name}
                            </RequirementName>
                          </RequirementDetails>
                        </RequirementNameCell>
                      </TableCell>
                      <TableCell $width="19%">
                        <TargetValue>
                          {req.comparator} {req.targetValue.toFixed(2)}{" "}
                          {req.unit}
                        </TargetValue>
                      </TableCell>
                      <TableCell $width="19%">
                        <CurrentValue $status={req.status}>
                          {req.currentValue !== undefined
                            ? `${req.currentValue.toFixed(2)} ${req.unit}`
                            : "—"}
                        </CurrentValue>
                      </TableCell>
                      <TableCell $width="19%">
                        {difference ? (
                          <DifferenceValue $isGood={difference.isGood}>
                            {difference.value > 0 ? "+" : ""}
                            {difference.value.toFixed(2)} {req.unit}
                            <DifferencePercentage $isGood={difference.isGood}>
                              ({difference.percentage > 0 ? "+" : ""}
                              {difference.percentage.toFixed(1)}%)
                            </DifferencePercentage>
                          </DifferenceValue>
                        ) : (
                          <DifferenceValue $isGood={false}>—</DifferenceValue>
                        )}
                      </TableCell>
                      <TableCell $width="19%">
                        <PriorityBadge $priority={req.priority}>
                          {req.priority}
                        </PriorityBadge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </RequirementsTable>
          </RequirementsSection>
        )}

        {/* Metrics & Errors/Warnings - Right Side */}
        <RightSection>
          <SectionHeader>
            <SectionTitle>
              {analysis.errors && analysis.errors.length > 0 ? (
                <>
                  <XCircle size={14} />
                  Errors ({analysis.errors.length})
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  Errors
                </>
              )}
            </SectionTitle>
          </SectionHeader>

          <RightSectionContent>
            {analysis.status === "failed" && analysis.requirements ? (
              <ErrorSection>
                <ErrorHeader>
                  <XCircle size={12} />
                  Analysis Failed - Requirements Not Met
                </ErrorHeader>
                <FailedRequirementsSummary>
                  {analysis.requirements
                    .filter((r) => r.status === "fail")
                    .map((req) => (
                      <FailedRequirementItem key={req.id}>
                        <ChevronRight size={10} />
                        <span>
                          <strong>{req.name}:</strong> Expected {req.comparator}{" "}
                          <TargetValueHighlight>
                            {req.targetValue.toFixed(2)} {req.unit}
                          </TargetValueHighlight>
                          , got{" "}
                          <CurrentValueHighlight>
                            {req.currentValue?.toFixed(2)} {req.unit}
                          </CurrentValueHighlight>
                        </span>
                      </FailedRequirementItem>
                    ))}
                </FailedRequirementsSummary>
              </ErrorSection>
            ) : (
              <EmptyErrorState>
                <ErrorStateTitle>
                  <EmptyIcon>
                    <CheckCircle size={18} />
                  </EmptyIcon>
                  <EmptyTitle>No Errors</EmptyTitle>
                </ErrorStateTitle>
                <EmptyDescription>
                  {analysis.status === "completed"
                    ? "Analysis completed successfully"
                    : analysis.status === "running"
                    ? "Analysis in progress..."
                    : "No errors to report"}
                </EmptyDescription>
              </EmptyErrorState>
            )}
          </RightSectionContent>
        </RightSection>
      </FooterContent>

      {/* Warnings */}
      <BottomSection>
        <SectionHeader>
          <SectionTitle>
            {analysis.warnings && analysis.warnings.length > 0 && (
              <>
                <AlertTriangle size={14} />
                Warnings ({analysis.warnings.length})
              </>
            )}
          </SectionTitle>
        </SectionHeader>

        {analysis.warnings && analysis.warnings.length > 0 && (
          <WarningSection>
            <WarningList>
              {analysis.warnings.map((warning, index) => (
                <WarningItem key={index}>
                  <ChevronRight size={12} />
                  <span>{warning}</span>
                </WarningItem>
              ))}
            </WarningList>
          </WarningSection>
        )}
      </BottomSection>
    </FooterContainer>
  );
};

// Styled Components
const FooterContainer = styled.div`
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-outline);
  border-radius: 12px 12px 0px 0px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const FooterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 12px 12px 0px 0px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
  min-height: 32px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AnalysisName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
`;

const InfoCardsRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const InfoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-outline);
  color: var(--text-primary);
  white-space: nowrap;
  text-transform: capitalize;
`;

const InfoValue = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${(props) => {
    switch (props.$status) {
      case "completed":
        return "var(--success)";
      case "failed":
        return "var(--error)";
      case "running":
        return "var(--accent-primary)";
      default:
        return "var(--text-primary)";
    }
  }};

  svg {
    opacity: 0.8;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{
  $variant: "primary" | "secondary" | "tertiary";
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  height: 32px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background: var(--accent-primary);
          color: white;
          border: none;
          
          &:hover:not(:disabled) {
            background: var(--primary-action);
            transform: translateY(-1px);
          }
        `;
      case "secondary":
        return `
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-outline);
          
          &:hover:not(:disabled) {
            background: var(--hover-bg);
            border-color: var(--primary-alternate);
            transform: translateY(-1px);
          }
        `;
      case "tertiary":
        return `
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-bg);
          
          &:hover:not(:disabled) {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border-color: var(--border-outline);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    opacity: 0.8;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
  margin-left: 8px;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--primary-alternate);
  }
`;

const FooterContent = styled.div`
  display: flex;
  padding: 12px;
  gap: 16px;
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary-alternate);
    border-radius: 3px;
  }
`;

const RequirementsSection = styled.div`
  flex: 2 1 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const RightSection = styled.div`
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0px 16px 16px 16px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-outline);
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.2s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--primary-alternate);
  }
`;

// components/AnalysisDetailsFooter.tsx - Update the table structure

const RequirementsTable = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-outline);
  padding: 8px 12px;
`;

const HeaderCell = styled.div<{ $width: string }>`
  flex: 0 0 ${(props) => props.$width};
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const TableBody = styled.div`
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary-alternate);
    border-radius: 2px;
  }
`;

const TableRow = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  padding: 8px 12px; /* Match header padding */
  border-bottom: 1px solid var(--border-bg);
  transition: all 0.2s ease;
  background: ${(props) =>
    props.$status === "fail" ? "rgba(var(--error-rgb), 0.03)" : "transparent"};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(props) =>
      props.$status === "fail"
        ? "rgba(var(--error-rgb), 0.06)"
        : "var(--hover-bg)"};
  }
`;

const TableCell = styled.div<{ $width: string }>`
  flex: 0 0 ${(props) => props.$width};
  font-size: 11px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
`;

const StatusIconCell = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
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

const RequirementName = styled.span<{ $status?: string }>`
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) =>
    props.$status === "fail" ? "var(--error)" : "var(--text-primary)"};
`;

const RequirementNameCell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

const RequirementDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const TargetValue = styled.span`
  font-size: 10px;
  color: var(--text-muted);
`;

const FailureReason = styled.div`
  font-size: 10px;
  color: var(--error);
  opacity: 0.8;
  line-height: 1.3;
  font-weight: 500;
`;

const CurrentValue = styled.span<{ $status?: string }>`
  font-size: 11px;
  font-weight: 600;
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

const PriorityBadge = styled.div<{ $priority: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${(props) => {
    switch (props.$priority) {
      case "critical":
        return "rgba(239, 68, 68, 0.1)";
      case "important":
        return "rgba(99, 102, 241, 0.1)";
      default:
        return "var(--bg-secondary)";
    }
  }};
  color: ${(props) => {
    switch (props.$priority) {
      case "critical":
        return "var(--error)";
      case "important":
        return "var(--accent-primary)";
      default:
        return "var(--text-muted)";
    }
  }};
`;

const RightSectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ErrorSection = styled.div`
  background: var(--bg-tertiary);
  border: 1px solid var(--error);
  border-radius: 8px;
  padding: 10px;
`;

const ErrorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--error);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const WarningSection = styled.div`
  display: flex;
  justify-content: stretch;
  background: var(--bg-secondary);
  border: 1px solid var(--caution);
  border-radius: 8px;
  padding: 10px;
`;

const WarningList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WarningItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 10px;
  color: var(--caution);
  line-height: 1.4;

  svg {
    margin-top: 2px;
    flex-shrink: 0;
  }
`;

const FailedRequirementsSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FailedRequirementItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 10px;
  color: var(--text-primary);
  line-height: 1.4;
  padding: 4px 6px;
  background: rgba(var(--error-rgb), 0.05);
  border-radius: 4px;

  svg {
    margin-top: 3px;
    flex-shrink: 0;
    color: var(--error);
  }

  strong {
    color: var(--error);
    font-weight: 600;
  }
`;

// Add new styled components for difference column
const DifferenceValue = styled.div<{ $isGood: boolean }>`
  font-size: 11px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: ${(props) => (props.$isGood ? "var(--success)" : "var(--error)")};
`;

const DifferencePercentage = styled.span<{ $isGood: boolean }>`
  font-size: 9px;
  font-weight: 500;
  opacity: 0.8;
`;

// Add styled components for color-coded values in failed requirements
const TargetValueHighlight = styled.span`
  color: var(--success);
  font-weight: 600;
`;

const CurrentValueHighlight = styled.span`
  color: var(--error);
  font-weight: 600;
`;

// Add empty state components
const EmptyErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  text-align: center;
`;

const ErrorStateTitle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
`;

const EmptyIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--success);
  opacity: 0.6;
`;

const EmptyTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const EmptyDescription = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
`;
