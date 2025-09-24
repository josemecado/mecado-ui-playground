import React, { useMemo, useState } from "react";
import styled from "styled-components";
import {
  Weight,
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Check,
} from "lucide-react";
import { Metric } from "../utils/VersionInterfaces";

export type SortOrder = "asc" | "desc";

export type ComparisonType = "baseline" | "sequential";

export type SortingConfig = {
  metricTitle: string;
  order: SortOrder;
  comparisonType: ComparisonType;
};

export interface DynamicSortingModalProps {
  availableMetrics: Metric[];
  defaultSelectedMetric?: string;
  defaultOrder?: SortOrder;
  defaultComparisonType?: ComparisonType;
  onConfirm: (config: SortingConfig) => void;
  onCancel: () => void;
  title?: string;
  confirmLabel?: string;
  className?: string;
}

/**
 * Get an appropriate icon for a metric based on its title and type
 */
const getMetricIcon = (metric: Metric) => {
  const lowerTitle = metric.title.toLowerCase();

  if (
    metric.type === "mass" ||
    lowerTitle.includes("weight") ||
    lowerTitle.includes("mass")
  ) {
    return Weight;
  }

  if (
    metric.type === "margin_of_safety" ||
    lowerTitle.includes("safety") ||
    lowerTitle.includes("margin")
  ) {
    return Shield;
  }

  if (lowerTitle.includes("drag") || lowerTitle.includes("coefficient")) {
    return TrendingUp;
  }

  if (lowerTitle.includes("force") || lowerTitle.includes("downforce")) {
    return Zap;
  }

  if (lowerTitle.includes("performance") || lowerTitle.includes("efficiency")) {
    return Target;
  }

  return BarChart3;
};

export default function DynamicSortingModal({
  availableMetrics,
  defaultSelectedMetric,
  defaultOrder = "asc",
  defaultComparisonType = "baseline",
  onConfirm,
  onCancel,
  title = "Sort",
  confirmLabel = "Apply",
  className,
}: DynamicSortingModalProps) {
  // Get unique metrics by title
  const uniqueMetrics = useMemo(() => {
    const metricMap = new Map<string, Metric>();
    availableMetrics.forEach((metric) => {
      if (!metricMap.has(metric.title)) {
        metricMap.set(metric.title, metric);
      }
    });
    return Array.from(metricMap.values());
  }, [availableMetrics]);

  const [selectedMetric, setSelectedMetric] = useState<string>(
    defaultSelectedMetric ?? uniqueMetrics[0]?.title ?? ""
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);
  const [comparisonType, setComparisonType] = useState<ComparisonType>(
    defaultComparisonType
  );

  const handleConfirm = () => {
    if (!selectedMetric) return;
    onConfirm({
      metricTitle: selectedMetric,
      order: sortOrder,
      comparisonType: comparisonType,
    });
  };

  if (uniqueMetrics.length === 0) {
    return (
      <ModalContainer className={className}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <NoMetricsMessage>No metrics available for sorting</NoMetricsMessage>
        </ModalBody>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer className={className}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>

      <ModalBody>
        {/* Metric Selection Grid */}
        <Section>
          <SectionLabel>Sort by</SectionLabel>
          <MetricGrid>
            {uniqueMetrics.map((metric) => {
              const Icon = getMetricIcon(metric);
              const isSelected = selectedMetric === metric.title;
              return (
                <MetricButton
                  key={metric.title}
                  onClick={() => setSelectedMetric(metric.title)}
                  $selected={isSelected}
                >
                  <MetricButtonContent>
                    <MetricIcon $selected={isSelected}>
                      <Icon size={16} />
                    </MetricIcon>
                    <MetricButtonText>
                      <MetricName $selected={isSelected}>{metric.title}</MetricName>
                    </MetricButtonText>
                    {isSelected && (
                      <SelectedIndicator>
                        <Check size={12} />
                      </SelectedIndicator>
                    )}
                  </MetricButtonContent>
                </MetricButton>
              );
            })}
          </MetricGrid>
        </Section>

        {/* Sort Order - Segmented Control */}
        <Section>
          <SectionLabel>Sort order</SectionLabel>
          <SegmentedControl>
            <SegmentButton
              $active={sortOrder === "asc"}
              onClick={() => setSortOrder("asc")}
            >
              Ascending
            </SegmentButton>
            <SegmentButton
              $active={sortOrder === "desc"}
              onClick={() => setSortOrder("desc")}
            >
              Descending
            </SegmentButton>
          </SegmentedControl>
        </Section>

        {/* Comparison Type */}
        <Section>
          <SectionLabel>Comparison type</SectionLabel>
          <SegmentedControl>
            <SegmentButton
              $active={comparisonType === "baseline"}
              onClick={() => setComparisonType("baseline")}
            >
              Baseline
            </SegmentButton>
            <SegmentButton
              $active={comparisonType === "sequential"}
              onClick={() => setComparisonType("sequential")}
            >
              Sequential
            </SegmentButton>
          </SegmentedControl>
          <ComparisonHint>
            {comparisonType === "baseline"
              ? "Compare all to first in sort order"
              : "Compare each to previous in sort order"}
          </ComparisonHint>
        </Section>
      </ModalBody>

      <ModalFooter>
        <FooterButtons>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <ConfirmButton onClick={handleConfirm} disabled={!selectedMetric}>
            {confirmLabel}
          </ConfirmButton>
        </FooterButtons>
      </ModalFooter>
    </ModalContainer>
  );
}

/* ======================= Styled Components ======================= */

const ModalContainer = styled.div`
  width: 400px;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
`;

const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const MetricButton = styled.button<{ $selected: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${({ $selected }) =>
    $selected ? "var(--primary-alternate)" : "var(--bg-tertiary)"};
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--primary-action)" : "var(--border-bg)"};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? "var(--primary-alternate)" : "var(--bg-tertiary)"};
    border-color: ${({ $selected }) =>
      $selected ? "var(--border-outline)" : "var(--border-outline)"};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const MetricButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

const MetricIcon = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  color: ${props => props.$selected ? "var(--text-inverted)" : "var(--text-primary)"};;
  flex-shrink: 0;

  ${MetricButton}[data-selected="true"] & {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const MetricButtonText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  flex: 1;
`;

const MetricName = styled.span<{ $selected: boolean }>`
  font-size: 13px;
  font-weight: ${props => props.$selected ? "600" : "500"};;
  color: ${props => props.$selected ? "var(--text-inverted)" : "var(--text-primary)"};;
  line-height: 1.3;

  ${MetricButton}[data-selected="true"] & {
    color: white;
  }
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: var(--text-inverted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
`;

const SegmentedControl = styled.div`
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid var(--border-bg);
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: ${props => props.$active ? "600" : "500"};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  background: ${({ $active }) =>
    $active ? "var(--primary-alternate)" : "transparent"};
  color: ${({ $active }) => ($active ? "var(--text-inverted)" : "var(--text-primary)")};

  &:hover {
    background: ${({ $active }) =>
      $active ? "var(--primary-alternate)" : "var(--hover-bg)"};
  }
`;

const ComparisonHint = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
`;

const ModalFooter = styled.div`
  padding: 0 20px 20px 20px;
`;

const FooterButtons = styled.div`
  display: flex;
  justify-content: space-between;
`;

const CancelButton = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--hover-bg);
    color: var(--text-primary);
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  background: var(--primary-action);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoMetricsMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
`;
