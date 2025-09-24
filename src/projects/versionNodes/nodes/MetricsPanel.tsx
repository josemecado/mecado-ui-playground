import React from "react";
import styled from "styled-components";
import {
  Metric,
  MetricValue,
  MetricValueDifference,
  MetricUtils,
} from "../utils/VersionInterfaces";
import {
  TrendingUp,
  TrendingDown,
  Archive,
  BarChart3,
  Target,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";

interface MetricsPanelProps {
  metrics: Metric[];
  selectedMetric: string | null;
  isSortedView?: boolean;
  comparisonType?: "baseline" | "sequential";
  isArchived?: boolean;
  isAIGenerating?: boolean; // NEW: For AI generation state
  aiStage?: string; // NEW: Current AI stage
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  metrics,
  selectedMetric,
  isSortedView = false,
  comparisonType = "baseline",
  isArchived = false,
  isAIGenerating = false,
  aiStage,
}) => {
  // Enhanced empty state logic
  if (!metrics || metrics.length === 0) {
    return (
      <Container $isArchived={isArchived}>
        {isArchived ? (
          // Existing archived state (unchanged)
          <>
            <OverviewHeader>
              <SectionLabel>ARCHIVED METRICS</SectionLabel>
              <ArchiveIcon>
                <Archive size={12} />
              </ArchiveIcon>
            </OverviewHeader>
            <ArchivedContent>
              <ArchivedPlaceholder>
                <BarChart3 size={32} />
                <div>Metrics Data Archived</div>
                <ArchivedSummary>No metrics stored</ArchivedSummary>
              </ArchivedPlaceholder>
            </ArchivedContent>
          </>
        ) : isAIGenerating ? (
          // NEW: AI Generation state
          <>
            <OverviewHeader>
              <SectionLabel>GENERATING METRICS</SectionLabel>
              <AIIcon>
                <Zap size={12} />
              </AIIcon>
            </OverviewHeader>
            <AIGeneratingContent>
              <AIPlaceholder>
                <AISpinner>
                  <BarChart3 size={32} />
                </AISpinner>
                <AITitle>Analysis In Progress</AITitle>
                <AIStageText>{aiStage || "Processing..."}</AIStageText>
                <AIDescription>
                  Metrics will appear once analysis completes
                </AIDescription>
              </AIPlaceholder>
              <AIProgress>
                <ProgressBar>
                  <ProgressFill />
                </ProgressBar>
                <ProgressText>Analyzing simulation results...</ProgressText>
              </AIProgress>
            </AIGeneratingContent>
          </>
        ) : (
          // NEW: Enhanced empty state for active versions
          <EmptyStateContainer>
            <OverviewHeader>
              <SectionLabel>METRICS</SectionLabel>
            </OverviewHeader>
            <EmptyContent>
              <EmptyPlaceholder>
                <EmptyIcon>
                  <BarChart3 size={32} />
                </EmptyIcon>
                <EmptyTitle>No Metrics Available</EmptyTitle>
                {/* <EmptyDescription>
                  Metrics will be generated after running analysis on this version's geometry
                </EmptyDescription> */}
              </EmptyPlaceholder>
              
              <EmptyActions>
                <ActionHint>
                  <Clock size={14} />
                  <ActionText>
                    Upload geometry and run FEA analysis to see metrics
                  </ActionText>
                </ActionHint>
              </EmptyActions>
            </EmptyContent>
          </EmptyStateContainer>
        )}
      </Container>
    );
  }

  // Existing logic for when metrics exist (unchanged)
  const getDisplayMetric = () => {
    if (selectedMetric) {
      return metrics.find((m) => m.title === selectedMetric);
    }

    return metrics.reduce((notable, current) => {
      const currentPrimaryDiff =
        current.differences?.find(
          (d) => d.valueLabel === current.primaryValueLabel
        ) || current.difference;

      const notablePrimaryDiff =
        notable?.differences?.find(
          (d) => d.valueLabel === notable.primaryValueLabel
        ) || notable?.difference;

      if (!currentPrimaryDiff) return notable;
      if (!notablePrimaryDiff) return current;

      return Math.abs(currentPrimaryDiff.percentage) >
        Math.abs(notablePrimaryDiff.percentage)
        ? current
        : notable;
    }, metrics[0]);
  };

  const displayMetric = getDisplayMetric();
  if (!displayMetric) return null;

  const isPositiveValueChange = (
    metric: Metric,
    valueLabel: string
  ): boolean => {
    const valueDiff = metric.differences?.find(
      (d) => d.valueLabel === valueLabel
    );
    if (!valueDiff) return true;

    const target = metric.optimizationTarget || "minimize";
    return target === "maximize"
      ? valueDiff.direction === "increase"
      : valueDiff.direction === "decrease";
  };

  const getPrimaryDifference = (metric: Metric) => {
    return (
      metric.differences?.find(
        (d) => d.valueLabel === metric.primaryValueLabel
      ) || metric.difference
    );
  };

  const primaryDiff = getPrimaryDifference(displayMetric);
  const isPrimaryPositive =
    primaryDiff && displayMetric.optimizationTarget
      ? displayMetric.optimizationTarget === "maximize"
        ? primaryDiff.direction === "increase"
        : primaryDiff.direction === "decrease"
      : true;

  const hasSelectedMetric = !!selectedMetric;

  return (
    <Container $isArchived={isArchived}>
      <OverviewHeader>
        {isSortedView && (
          <SectionLabel>
            SORTED BY
          </SectionLabel>
        )}
        <MetricHeaderContainer>
          <MetricName>{displayMetric.title}</MetricName>

          {displayMetric.optimizationTarget && (
            <OptimizationTarget $target={displayMetric.optimizationTarget}>
              <Target size={12} />
            </OptimizationTarget>
          )}
        </MetricHeaderContainer>
      </OverviewHeader>

      <OverviewContent>
        <PrimaryValueSection>
          <PrimaryValue
            $type={displayMetric.type}
            $optimizationTarget={displayMetric.optimizationTarget}
            $metric={displayMetric}
          >
            {MetricUtils.formatValue(
              MetricUtils.getPrimaryValue(displayMetric),
              MetricUtils.getPrimaryUnit(displayMetric)
            )}
            {displayMetric.primaryValueLabel &&
              displayMetric.values.length > 1 && (
                <PrimaryValueLabel>
                  {displayMetric.primaryValueLabel}
                </PrimaryValueLabel>
              )}
          </PrimaryValue>
        </PrimaryValueSection>

        {hasSelectedMetric && displayMetric.values.length > 1 && (
          <MultiValueSection>
            <MultiValueHeader>
              <SectionLabel>ALL VALUES</SectionLabel>
              <ValueCount>({displayMetric.values.length} values)</ValueCount>
            </MultiValueHeader>

            {displayMetric.values.map((value, idx) => {
              const valueDiff = displayMetric.differences?.find(
                (d) => d.valueLabel === value.label
              );
              const parentValue = displayMetric.parentValues?.find(
                (pv) => pv.label === value.label
              );
              const isPositive = isPositiveValueChange(
                displayMetric,
                value.label
              );
              const isPrimary = value.label === displayMetric.primaryValueLabel;

              return (
                <ValueItem
                  key={idx}
                  $isPrimary={isPrimary}
                  $type={displayMetric.type}
                  $optimizationTarget={displayMetric.optimizationTarget}
                >
                  <ValueItemHeader>
                    <ValueLabel $isPrimary={isPrimary}>
                      {value.label}
                    </ValueLabel>
                    <ValueNumber>
                      {MetricUtils.formatValue(value.value, value.unit)}
                    </ValueNumber>
                  </ValueItemHeader>

                  {valueDiff && parentValue && (
                    <ValueComparison>
                      <ComparisonRow>
                        <ComparisonLabel>Parent:</ComparisonLabel>
                        <ComparisonValue>
                          {MetricUtils.formatValue(
                            parentValue.value,
                            parentValue.unit
                          )}
                        </ComparisonValue>
                      </ComparisonRow>

                      <ComparisonRow>
                        <ComparisonLabel>Change:</ComparisonLabel>
                        <ChangeIndicator $isPositive={isPositive}>
                          {valueDiff.direction === "increase" ? (
                            <TrendingUp size={10} />
                          ) : valueDiff.direction === "decrease" ? (
                            <TrendingDown size={10} />
                          ) : (
                            <span>—</span>
                          )}
                          {valueDiff.direction !== "unchanged" && (
                            <span>
                              {Math.abs(valueDiff.percentage).toFixed(1)}%
                            </span>
                          )}
                        </ChangeIndicator>
                      </ComparisonRow>
                    </ValueComparison>
                  )}
                </ValueItem>
              );
            })}
          </MultiValueSection>
        )}

        {!hasSelectedMetric && primaryDiff && (
          <ComparisonSection>
            <ComparisonGrid>
              <ComparisonItem>
                <CompLabel>Parent</CompLabel>
                <CompValue>
                  {displayMetric.parentValue !== undefined
                    ? MetricUtils.formatValue(
                        displayMetric.parentValue,
                        MetricUtils.getPrimaryUnit(displayMetric)
                      )
                    : displayMetric.parentValues?.find(
                        (pv) => pv.label === displayMetric.primaryValueLabel
                      )
                    ? MetricUtils.formatValue(
                        displayMetric.parentValues.find(
                          (pv) => pv.label === displayMetric.primaryValueLabel
                        )!.value,
                        displayMetric.parentValues.find(
                          (pv) => pv.label === displayMetric.primaryValueLabel
                        )!.unit
                      )
                    : "—"}
                </CompValue>
              </ComparisonItem>

              <ComparisonItem>
                <CompLabel>Change</CompLabel>
                <ChangeIndicator $isPositive={isPrimaryPositive}>
                  {primaryDiff.direction === "increase" ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>{Math.abs(primaryDiff.percentage).toFixed(1)}%</span>
                </ChangeIndicator>
              </ComparisonItem>
            </ComparisonGrid>

            {displayMetric.significance && (
              <StatusBar
                $isPositive={isPrimaryPositive}
                $significance={displayMetric.significance}
              >
                {displayMetric.significance === "critical" ? "⚠️ " : ""}
                {isPrimaryPositive
                  ? "Optimization Improved"
                  : "Performance Regression"}
              </StatusBar>
            )}
          </ComparisonSection>
        )}

        {isSortedView && displayMetric && (
          <SortIndicator>
            {comparisonType === "baseline"
              ? "Comparing to baseline (first in sort)"
              : "Comparing to previous in sequence"}
          </SortIndicator>
        )}
      </OverviewContent>
    </Container>
  );
};

// Existing styled components (keeping all the original ones unchanged)
const Container = styled.div<{ $isArchived?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex: 1 1 0;
  height: 100%;
  min-height: 0;
  background: ${(props) =>
    props.$isArchived ? "var(--bg-tertiary)" : "var(--bg-secondary)"};
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  padding: 8px;
  opacity: ${(props) => (props.$isArchived ? 0.6 : 1)};
  filter: ${(props) => (props.$isArchived ? "grayscale(0.4)" : "none")};
  overflow: hidden;
`;

const OverviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MetricHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 4px;
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ArchiveIcon = styled.div`
  color: var(--text-muted);
  opacity: 0.7;
`;

// NEW: AI Generation styling
const AIIcon = styled.div`
  color: var(--accent-primary);
  opacity: 0.8;
`;

const StatusIcon = styled.div`
  color: var(--text-muted);
  opacity: 0.6;
`;

const MetricName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const OptimizationTarget = styled.div<{ $target: "minimize" | "maximize" }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 500;
  color: ${(props) => (props.$target === "maximize" ? "#22c55e" : "#ef4444")};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OverviewContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 8px;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-tertiary);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary-alternate);
    border-radius: 3px;

    &:hover {
      background: var(--text-muted);
    }
  }
`;

// NEW: Enhanced empty state styling
const EmptyContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const EmptyPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: var(--text-muted);
  opacity: 0.3;
  margin-bottom: 8px;
`;

const EmptyTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  margin-top: 0px;
`;

const EmptyDescription = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
  max-width: 180px;
`;

const EmptyActions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionHint = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 6px;
  border-left: 3px solid var(--primary-alternate);
`;

const ActionText = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  flex: 1;
`;

// NEW: AI Generation styling
const AIGeneratingContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 16px;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const AIPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

const AISpinner = styled.div`
  color: var(--accent-primary);
  opacity: 0.7;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 0.3; }
  }
`;

const AITitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const AIStageText = styled.div`
  font-size: 12px;
  color: var(--accent-primary);
  font-weight: 500;
  margin-bottom: 8px;
`;

const AIDescription = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  max-width: 160px;
`;

const AIProgress = styled.div`
  width: 100%;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  width: 60%;
  animation: progress 3s ease-in-out infinite;

  @keyframes progress {
    0% { width: 20%; }
    50% { width: 80%; }
    100% { width: 60%; }
  }
`;

const ProgressText = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
`;

// Keep all existing styled components for when metrics exist...
const PrimaryValueSection = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const PrimaryValue = styled.div<{
  $type: string;
  $optimizationTarget?: "minimize" | "maximize";
  $metric: Metric;
}>`
  font-size: 18px;
  font-weight: 700;
  color: ${(props) => MetricUtils.getValueDifferenceColor(props.$metric)};
  text-align: center;
  padding: 4px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border-left: 4px solid
    ${(props) => MetricUtils.getValueDifferenceColor(props.$metric)};
`;

const PrimaryValueLabel = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.8;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MultiValueSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
  min-height: 0;
`;

const MultiValueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const ValueCount = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.8;
`;

const ValueItem = styled.div<{
  $isPrimary?: boolean;
  $type: string;
  $optimizationTarget?: "minimize" | "maximize";
}>`
  padding: 4px 6px;
  background: var(--bg-tertiary);
  border: 1px solid
    ${(props) =>
      props.$isPrimary ? "var(--primary-action)" : "var(--border-bg)"};
  border-radius: 4px;
  font-size: 10px;
  border-left: ${props => props.$isPrimary ? "3px solid var(--primary-alternate)" : "none"};
`;

const ValueItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
`;

const ValueLabel = styled.div<{ $isPrimary?: boolean }>`
  font-weight: ${(props) => (props.$isPrimary ? 600 : 500)};
  color: ${(props) =>
    props.$isPrimary ? "var(--text-primary)" : "var(--text-muted)"};
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
`;

const ValueNumber = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 10px;
`;

const ValueComparison = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  margin-top: 2px;
  padding-top: 2px;
  border-top: 1px solid var(--border-bg);
`;

const ComparisonRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex: 1;
`;

const ComparisonLabel = styled.div`
  font-size: 8px;
  font-weight: 400;
  color: var(--text-muted);
  text-transform: uppercase;
`;

const ComparisonValue = styled.div`
  font-size: 9px;
  font-weight: 500;
  color: var(--text-primary);
`;

const ComparisonSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const ComparisonItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  background: var(--bg-tertiary);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  border-radius: 4px;
`;

const CompLabel = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 4px;
`;

const CompValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ChangeIndicator = styled.div<{ $isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 600;
  color: ${(props) => (props.$isPositive ? "#22c55e" : "#ef4444")};

  svg {
    width: 10px;
    height: 10px;
  }
`;

const StatusBar = styled.div<{ $isPositive: boolean; $significance?: string }>`
  margin-top: 8px;
  text-align: center;
  padding: 6px;
  background: ${(props) =>
    props.$isPositive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"};
  border: 1px solid
    ${(props) =>
      props.$isPositive ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"};
  border-radius: 4px;
  font-size: 11px;
  font-weight: ${(props) =>
    props.$significance === "critical" ? "600" : "500"};
  color: ${(props) => (props.$isPositive ? "#22c55e" : "#ef4444")};
`;

const SortIndicator = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
`;

// Keep all existing archived components unchanged
const ArchivedContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 12px;
  align-items: center;
  justify-content: center;
`;

const ArchivedPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  text-align: center;

  svg {
    opacity: 0.4;
  }

  > div {
    font-size: 14px;
    font-weight: 500;
  }
`;

const ArchivedSummary = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.8;
`;

export default MetricsPanel;


const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column; 
  `;