import React, { useState, useEffect } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import styled from "styled-components";
import {
  ProjectVersion,
  Metric,
  MetricUtils,
} from "../utils/VersionInterfaces";
import {
  Box,
  Info,
  TrendingUp,
  TrendingDown,
  Archive,
  ArchiveRestore,
  Upload,
  RefreshCw,
  Bot,
} from "lucide-react";
import { animated, useSpring } from "@react-spring/web";
import { MetricsPanel } from "./MetricsPanel";
import { useTheme } from "../../../utilities/ThemeContext";
import { AIStepFlowPanel } from "../components/StepFlowPanel";

export interface SortingConfig {
  metricTitle: string;
  order: "asc" | "desc";
  comparisonType: "baseline" | "sequential";
}

// add to VersionNodeData
type AIGenStage =
  | "Creating Variation"
  | "Pre-processing"
  | "FEA Setup"
  | "Solving"
  | "Results";

type VersionNodeData = ProjectVersion & {
  onShowDetails?: (versionId: string) => void;
  onUploadGeometry?: (versionId: string) => void;
  isUploading?: boolean;
  uploadError?: string | null;
  sortConfig?: SortingConfig;

  // NEW: AI gen fields
  aiGenerating?: boolean;
  aiStage?: AIGenStage;
  aiStageIndex?: number; // 0..n for gating
};

interface VersionNodeProps extends NodeProps {
  onShowDetails?: (versionId: string) => void;
  onUploadGeometry?: (versionId: string) => void;
}

export const VersionNode: React.FC<VersionNodeProps> = ({
  data,
  selected,
  onShowDetails,
  onUploadGeometry,
}) => {
  const versionData = data as VersionNodeData;
  const { theme } = useTheme();

  const [selectedMetric, setSelectedMetric] = useState<string | null>(() => {
    // If there's a sort config, auto-select that metric
    if (versionData.sortConfig) {
      const sortedMetric = versionData.metrics.find(
        (m) => m.title === versionData.sortConfig?.metricTitle
      );
      return sortedMetric?.title || null;
    }
    return null;
  });

  const isAIGenerating = !!versionData.aiGenerating;

  // Enhanced animation for archived nodes
  const animationProps = useSpring({
    from: { opacity: 0, transform: "scale(0.8)" },
    to: {
      opacity: versionData.isArchived ? 0.8 : 1,
      transform: versionData.isArchived ? "scale(0.95)" : "scale(1)",
    },
    config: { tension: 200, friction: 20 },
  });

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (versionData.onShowDetails) {
      versionData.onShowDetails(versionData.id);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (versionData.onUploadGeometry && !versionData.isArchived) {
      versionData.onUploadGeometry(versionData.id);
    }
  };

  const handleMetricClick = (metricTitle: string) => {
    // Don't allow metric interaction for archived versions
    if (versionData.isArchived) return;

    // Toggle selection normally
    setSelectedMetric((current) =>
      current === metricTitle ? null : metricTitle
    );
  };

  // UPDATED: Use new multi-value difference checking with dynamic optimization
  const isPositiveChange = (metric: Metric): boolean => {
    // Check if we have multi-value differences
    if (metric.differences && metric.differences.length > 0) {
      // Find the primary value difference
      const primaryDiff =
        metric.differences.find(
          (d) => d.valueLabel === metric.primaryValueLabel
        ) || metric.differences[0]; // Fallback to first difference

      const target = metric.optimizationTarget || "minimize";
      return target === "maximize"
        ? primaryDiff.direction === "increase"
        : primaryDiff.direction === "decrease";
    }

    // Fallback to legacy single difference
    if (metric.difference) {
      const target = metric.optimizationTarget || "minimize";
      return target === "maximize"
        ? metric.difference.direction === "increase"
        : metric.difference.direction === "decrease";
    }

    return true;
  };

  // UPDATED: Use MetricUtils for formatting
  const formatMetricValue = (metric: Metric) => {
    const primaryValue = MetricUtils.getPrimaryValue(metric);
    const unit = MetricUtils.getPrimaryUnit(metric);
    return MetricUtils.formatValue(primaryValue, unit);
  };

  // UPDATED: Get primary difference percentage for display
  const getPrimaryDifferencePercentage = (metric: Metric): number => {
    // Check multi-value differences first
    if (metric.differences && metric.differences.length > 0) {
      const primaryDiff =
        metric.differences.find(
          (d) => d.valueLabel === metric.primaryValueLabel
        ) || metric.differences[0];
      return primaryDiff.percentage;
    }

    // Fallback to legacy difference
    return metric.difference?.percentage || 0;
  };

  // UPDATED: Check if primary difference indicates change
  const hasPrimaryDifferenceChange = (metric: Metric): boolean => {
    if (metric.differences && metric.differences.length > 0) {
      const primaryDiff =
        metric.differences.find(
          (d) => d.valueLabel === metric.primaryValueLabel
        ) || metric.differences[0];
      return primaryDiff.direction !== "unchanged";
    }

    return metric.difference?.direction !== "unchanged";
  };

  // UPDATED: Get primary difference direction
  const getPrimaryDifferenceDirection = (
    metric: Metric
  ): "increase" | "decrease" | "unchanged" => {
    if (metric.differences && metric.differences.length > 0) {
      const primaryDiff =
        metric.differences.find(
          (d) => d.valueLabel === metric.primaryValueLabel
        ) || metric.differences[0];
      return primaryDiff.direction;
    }

    return metric.difference?.direction || "unchanged";
  };

  const handleStyle = {
    background: versionData.isArchived ? "var(--text-muted)" : "var(--bg)",
    width: 8,
    height: 8,
    border: `2px solid ${
      versionData.isArchived ? "var(--text-muted)" : "var(--primary-alternate)"
    }`,
    opacity: versionData.isArchived ? 0.5 : 1,
  };

  useEffect(() => {
    if (versionData.sortConfig && !versionData.isArchived) {
      const sortedMetric = versionData.metrics.find(
        (m) => m.title === versionData.sortConfig?.metricTitle
      );
      setSelectedMetric(sortedMetric?.title || null);
    } else {
      // Clear selection when sort is removed or archived
      setSelectedMetric(null);
    }
  }, [versionData.sortConfig, versionData.metrics, versionData.isArchived]);

  // Determine if geometry can be shown (AI gen must be past "Creating Variation")
  const canShowGeometry =
    !!versionData.geometry?.renderContent &&
    !versionData.isArchived &&
    (!versionData.aiGenerating || (versionData.aiStageIndex ?? 0) >= 0);

  // Determine if we should show the upload button
  const hasGeometry = versionData.geometry?.data;
  const showUploadButton = !hasGeometry && !versionData.isArchived;

  return (
    <animated.div style={animationProps}>
      <NodeContainer
        selected={selected}
        $isArchived={versionData.isArchived}
        $hasSelectedMetric={!!selectedMetric && !versionData.isArchived}
      >
        <Handle
          id="top"
          type="target"
          position={Position.Top}
          style={handleStyle}
        />

        <NodeHeader
          className="node-header-drag"
          $theme={theme}
          $isArchived={versionData.isArchived}
        >
          <HeaderLeft>
            <NodeTitle $theme={theme} $isArchived={versionData.isArchived}>
              {versionData.id.toUpperCase()}
            </NodeTitle>
          </HeaderLeft>

          {versionData.parentVersion && (
            <HeaderCenter>
              <NodeSubtitle $theme={theme} $isArchived={versionData.isArchived}>
                ↑ Parent:
              </NodeSubtitle>
              <ParentBadge $isArchived={versionData.isArchived}>
                {versionData.parentVersion.toUpperCase()}
              </ParentBadge>
            </HeaderCenter>
          )}

          <HeaderRight>
            {/* AI status badge */}
            {!versionData.isArchived && versionData.aiGenerating && (
              <AIStatusBadge title={versionData.aiStage || "Generating..."}>
                <RefreshCw className="spin" size={12} />
                <span>{versionData.aiStage || "Generating..."}</span>
              </AIStatusBadge>
            )}

            {versionData.isArchived ? (
              <ArchiveBadge>
                <Archive size={12} />
                <span>ARCHIVED</span>
              </ArchiveBadge>
            ) : (
              <DetailsButton
                onClick={handleDetailsClick}
                title="View version details"
                className="nodrag"
                $isArchived={versionData.isArchived}
              >
                <Info size={14} />
              </DetailsButton>
            )}
          </HeaderRight>
        </NodeHeader>

        <ContentContainer $isArchived={versionData.isArchived}>
          {isAIGenerating ? (
            <AIStepFlowPanel
              currentStage={versionData.aiStage || "Creating Variation"}
              currentStageIndex={versionData.aiStageIndex || 0}
            />
          ) : (
            <MetricsPanel
              metrics={versionData.metrics}
              selectedMetric={versionData.isArchived ? null : selectedMetric}
              isSortedView={!!versionData.sortConfig}
              comparisonType={versionData.sortConfig?.comparisonType}
              isArchived={versionData.isArchived}
              isAIGenerating={isAIGenerating}
              aiStage={versionData.aiStage}
            />
          )}

          <CanvasArea $isArchived={versionData.isArchived}>
            <div
              className="nodrag nowheel"
              onPointerDown={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              style={{ width: "100%", height: "100%" }}
            >
              {canShowGeometry ? (
                <div
                  key={versionData.geometry!.id}
                  style={{ width: "100%", height: "100%" }}
                >
                  {versionData.geometry!.renderContent!()}
                </div>
              ) : (
                <CanvasPlaceholder $isArchived={versionData.isArchived}>
                  {versionData.isArchived ? <Archive /> : <Box />}
                  <div>
                    {versionData.isArchived
                      ? "Archived Geometry"
                      : "Geometry View"}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>
                    {versionData.isArchived
                      ? "Geometry hidden in archived state"
                      : versionData.geometry?.placeholder ||
                        "No geometry loaded"}
                  </div>

                  {/* Upload Button - only show when no geometry and not archived */}
                  {showUploadButton && (
                    <UploadButton
                      onClick={handleUploadClick}
                      disabled={versionData.isUploading}
                      $isUploading={versionData.isUploading}
                      $hasError={!!versionData.uploadError}
                      className="nodrag"
                      title="Upload geometry file"
                    >
                      {versionData.isUploading ? (
                        <>
                          <RefreshCw className="spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload />
                          Upload Geometry
                        </>
                      )}
                    </UploadButton>
                  )}

                  {/* Error message */}
                  {versionData.uploadError && !versionData.isArchived && (
                    <ErrorMessage>{versionData.uploadError}</ErrorMessage>
                  )}
                </CanvasPlaceholder>
              )}
            </div>
          </CanvasArea>
        </ContentContainer>

        {!versionData.isArchived && !isAIGenerating && (
          <MetricsFooter $theme={theme} $isArchived={versionData.isArchived}>
            {versionData.metrics.map((metric, idx) => {
              const isSelected =
                selectedMetric === metric.title && !versionData.isArchived;
              const isPositive = isPositiveChange(metric);
              const isSortedMetric =
                versionData.sortConfig &&
                metric.title === versionData.sortConfig.metricTitle;

              return (
                <MetricButton
                  key={idx}
                  $isSelected={isSelected}
                  $isSorted={isSortedMetric && !versionData.isArchived}
                  $theme={theme}
                  $type={metric.type}
                  $optimizationTarget={metric.optimizationTarget}
                  $isArchived={versionData.isArchived}
                  $metric={metric}
                  onClick={() => handleMetricClick(metric.title)}
                  className="nodrag"
                  title={
                    versionData.isArchived
                      ? "Metrics not interactive in archived state"
                      : isSortedMetric
                      ? "Currently sorting by this metric"
                      : metric.values.length > 1
                      ? `${metric.title} - Click to see all ${metric.values.length} values`
                      : undefined
                  }
                  disabled={versionData.isArchived}
                >
                  <MetricButtonLabel
                    $isSelected={isSelected}
                    $isArchived={versionData.isArchived}
                  >
                    {metric.title}
                    {/* Show indicator for multi-value metrics */}
                    {metric.values.length > 1 && (
                      <MultiValueIndicator>
                        ({metric.values.length})
                      </MultiValueIndicator>
                    )}
                  </MetricButtonLabel>
                  <ValueRow>
                    <MetricButtonValue
                      $isSelected={isSelected}
                      $isArchived={versionData.isArchived}
                    >
                      {formatMetricValue(metric)}
                      {/* Show primary value label for multi-value metrics */}
                      {metric.values.length > 1 && metric.primaryValueLabel && (
                        <PrimaryValueLabel $isSelected={isSelected}>
                          {metric.primaryValueLabel}
                        </PrimaryValueLabel>
                      )}
                    </MetricButtonValue>
                  </ValueRow>
                </MetricButton>
              );
            })}
          </MetricsFooter>
        )}

        <Handle
          id="bottom"
          type="source"
          position={Position.Bottom}
          style={handleStyle}
        />
      </NodeContainer>
    </animated.div>
  );
};

// UPDATED: Styled Components with dynamic coloring
const NodeContainer = styled.div<{
  selected: boolean;
  $isArchived?: boolean;
  $hasSelectedMetric?: boolean;
}>`
  display: flex;
  position: relative;
  border: ${(props) => {
    if (props.$isArchived) {
      return "2px dashed var(--text-muted)";
    }
    if (props.selected) {
      return "2px solid var(--border-outline)";
    }
    return "1px solid var(--border-bg)";
  }};
  border-radius: 12px;
  width: 500px;
  min-height: ${(props) => (props.$hasSelectedMetric ? "400px" : "320px")};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.$isArchived
      ? "rgba(0, 0, 0, 0.1) 0px 1px 3px"
      : "rgba(0, 0, 0, 0.24) 0px 3px 8px"};
  filter: ${(props) => (props.$isArchived ? "grayscale(0.7)" : "none")};
  transition: min-height 0.3s ease-in-out;
`;

const ArchiveBadge = styled.div`
  background: var(--text-muted);
  color: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  letter-spacing: 0.5px;
`;

const NodeHeader = styled.div<{
  $theme: "light" | "dark";
  $isArchived?: boolean;
}>`
  padding: 8px 12px;
  background: ${(props) => {
    if (props.$isArchived) {
      return "var(--bg-secondary)";
    }
    if (props.$theme === "light") {
      return "var(--primary-alternate)";
    }
    return "var(--bg-tertiary)";
  }};
  border-bottom: 1px solid var(--border-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderCenter = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NodeTitle = styled.h3<{
  $theme: "light" | "dark";
  $isArchived?: boolean;
}>`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => {
    if (props.$isArchived) {
      return "var(--text-muted)";
    }
    return props.$theme === "light"
      ? "var(--text-inverted)"
      : "var(--text-primary)";
  }};
`;

const NodeSubtitle = styled.span<{
  $theme: "light" | "dark";
  $isArchived?: boolean;
}>`
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => {
    if (props.$isArchived) {
      return "var(--text-muted)";
    }
    return props.$theme === "light"
      ? "var(--text-inverted)"
      : "var(--text-muted)";
  }};
`;

const DetailsButton = styled.button<{ $isArchived?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-muted);
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};

  &:hover {
    background: var(--hover-bg);
    border-color: var(--primary-action);
    transform: ${(props) => (props.$isArchived ? "none" : "scale(1.05)")};
  }

  &:active {
    transform: ${(props) => (props.$isArchived ? "none" : "scale(0.95)")};
  }

  svg {
    color: var(--text-muted);
  }
`;

const ContentContainer = styled.div<{ $isArchived?: boolean }>`
  display: flex;
  flex: 1 1 0;
  overflow: hidden;
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};
`;

const CanvasArea = styled.div<{ $isArchived?: boolean }>`
  flex: 2 1 0;
  background: ${(props) =>
    props.$isArchived ? "var(--bg-secondary)" : "var(--bg-primary)"};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px;
  position: relative;
  overflow: hidden;
`;

const CanvasPlaceholder = styled.div<{ $isArchived?: boolean }>`
  height: 100%;
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};
  padding: 20px;

  svg {
    width: 48px;
    height: 48px;
    opacity: 0.3;
  }
`;

const UploadButton = styled.button<{
  $isUploading?: boolean;
  $hasError?: boolean;
}>`
  padding: 8px;
  background: ${(props) =>
    props.$hasError
      ? "var(--error-bg)"
      : props.$isUploading
      ? "var(--bg-tertiary)"
      : "var(--primary-action)"};
  color: ${(props) => (props.$hasError ? "var(--error-text)" : "white")};
  border: 1px solid
    ${(props) =>
      props.$hasError
        ? "var(--error-border)"
        : props.$isUploading
        ? "var(--border-bg)"
        : "var(--primary-action)"};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: ${(props) => (props.$isUploading ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$hasError ? "var(--error-hover)" : "var(--primary-action-hover)"};
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
  }

  svg {
    width: 16px;
    height: 16px;
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

const ErrorMessage = styled.div`
  padding: 8px 12px;
  background: var(--error-bg);
  color: var(--error-text);
  border: 1px solid var(--error-border);
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.4;
  margin-top: 8px;
  max-width: 200px;
`;

const ParentBadge = styled.div<{ $isArchived?: boolean }>`
  background: ${(props) =>
    props.$isArchived ? "var(--text-muted)" : "var(--bg-secondary)"};
  color: ${(props) =>
    props.$isArchived ? "var(--bg-primary)" : "var(--text-primary)"};
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};
`;

const MetricsFooter = styled.div<{
  $theme: "dark" | "light";
  $isArchived?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 8px;
  background: ${(props) => {
    if (props.$isArchived) {
      return "var(--bg-secondary)";
    }
    return props.$theme === "light"
      ? "var(--bg-secondary)"
      : "var(--bg-tertiary)";
  }};
  border-top: 1px solid var(--border-bg);
  overflow-x: auto;
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-bg);
    border-radius: 2px;
  }
`;

// UPDATED: Dynamic metric button with color based on type and optimization target
const MetricButton = styled.button<{
  $isSelected: boolean;
  $isSorted?: boolean;
  $type: string;
  $optimizationTarget?: "minimize" | "maximize";
  $theme: "light" | "dark";
  $isArchived?: boolean;
  $metric: Metric;
}>`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: ${(props) => {
    if (props.$isArchived) {
      return "var(--bg-secondary)";
    }
    if (props.$isSelected) {
      return "var(--primary-alternate)";
    }
    if (props.$theme === "light") {
      return "var(--bg-primary)";
    }
    return "var(--bg-secondary)";
  }};

  border: 1px solid
    ${(props) => {
      if (props.$isArchived) return "var(--text-muted)";
      if (props.$isSorted) return "var(--primary-action)";
      if (props.$isSelected) return "var(--primary-action)";
      return "var(--border-bg)";
    }};

  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
    rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;

  border-radius: 6px;
  cursor: ${(props) => (props.$isArchived ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  min-width: 80px;
  opacity: ${(props) => (props.$isArchived ? 0.8 : 1)};

  /* UPDATED: Dynamic left border color based on metric type */
  ${(props) =>
    !props.$isArchived &&
    `
    border-left: 3px solid ${MetricUtils.getValueDifferenceColor(
      props.$metric
    )};
  `}

  &:hover {
    background: ${(props) => {
      if (props.$isArchived) return "var(--bg-secondary)";
      return props.$isSelected ? "var(--primary-alternate)" : "var(--hover-bg)";
    }};
    border: 1px solid
      ${(props) =>
        props.$isArchived ? "var(--text-muted)" : "var(--border-outline)"};
    ${(props) =>
      !props.$isArchived &&
      `
      border-left: 3px solid ${MetricUtils.getValueDifferenceColor(
        props.$metric
      )};
    `}
    transform: ${(props) => (props.$isArchived ? "none" : "translateY(-1px)")};
  }

  &:disabled {
    cursor: not-allowed;
  }

  ${(props) =>
    props.$isSorted &&
    !props.$isArchived &&
    `
    &::before {
      content: "↕";
      position: absolute;
      top: 2px;
      right: 4px;
      font-size: 10px;
      color: var(--primary-action);
    }
  `}
`;

const MetricButtonLabel = styled.div<{
  $isSelected: boolean;
  $isArchived?: boolean;
}>`
  font-size: 10px;
  font-weight: ${(props) =>
    props.$isSelected && !props.$isArchived ? "600" : "500"};
  color: ${(props) => {
    if (props.$isArchived) {
      return "var(--text-muted)";
    }
    return props.$isSelected ? "var(--text-inverted)" : "var(--text-muted)";
  }};
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: center;
`;

const MetricButtonValue = styled.div<{
  $isSelected: boolean;
  $isArchived?: boolean;
}>`
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => {
    if (props.$isArchived) {
      return "var(--text-muted)";
    }
    return props.$isSelected ? "var(--text-inverted)" : "var(--text-primary)";
  }};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const DiffIndicator = styled.div<{ $isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => (props.$isPositive ? "#22c55e" : "#ef4444")};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ValueRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

// Multi-value indicators
const MultiValueIndicator = styled.span`
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.7;
  font-weight: 400;
`;

const PrimaryValueLabel = styled.div<{ $isSelected: boolean }>`
  font-size: 8px;
  color: ${(props) =>
    props.$isSelected ? "var(--text-inverted)" : "var(--text-muted)"};
  opacity: 0.8;
  font-weight: 500;
`;

const AIStatusBadge = styled.div`
  background: var(--accent-primary);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-bg);
  .spin {
    animation: spin 0.9s linear infinite;
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

const RedactedPanel = styled.div`
  flex: 1 1 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-bg);
`;

const RedactedLine = styled.div`
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  animation: shimmer 1.2s infinite;
  @keyframes shimmer {
    0% {
      background-position: 0% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  background-size: 200% 100%;
`;

export default VersionNode;
