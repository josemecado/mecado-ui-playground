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
  MoreHorizontal,
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
    if (versionData.sortConfig) {
      const sortedMetric = versionData.metrics.find(
        (m) => m.title === versionData.sortConfig?.metricTitle
      );
      return sortedMetric?.title || null;
    }
    return null;
  });

  const isAIGenerating = !!versionData.aiGenerating;

  // Limit displayed metrics to 3
  const MAX_DISPLAYED_METRICS = 3;
  const displayedMetrics = versionData.metrics.slice(0, MAX_DISPLAYED_METRICS);
  const hasMoreMetrics = versionData.metrics.length > MAX_DISPLAYED_METRICS;
  const hiddenMetricsCount = versionData.metrics.length - MAX_DISPLAYED_METRICS;

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
    if (versionData.isArchived) return;
    setSelectedMetric((current) =>
      current === metricTitle ? null : metricTitle
    );
  };

  const handleMoreMetricsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (versionData.onShowDetails) {
      versionData.onShowDetails(versionData.id);
    }
  };

  // UPDATED: Use new multi-value difference checking with dynamic optimization
  const isPositiveChange = (metric: Metric): boolean => {
    if (metric.differences && metric.differences.length > 0) {
      const primaryDiff =
        metric.differences.find(
          (d) => d.valueLabel === metric.primaryValueLabel
        ) || metric.differences[0];

      const target = metric.optimizationTarget || "minimize";
      return target === "maximize"
        ? primaryDiff.direction === "increase"
        : primaryDiff.direction === "decrease";
    }

    if (metric.difference) {
      const target = metric.optimizationTarget || "minimize";
      return target === "maximize"
        ? metric.difference.direction === "increase"
        : metric.difference.direction === "decrease";
    }

    return true;
  };

  const formatMetricValue = (metric: Metric) => {
    const primaryValue = MetricUtils.getPrimaryValue(metric);
    const unit = MetricUtils.getPrimaryUnit(metric);
    return MetricUtils.formatValue(primaryValue, unit);
  };

  const handleStyle = {
    background: versionData.isArchived
      ? "var(--text-muted)"
      : "var(--primary-alternate)",
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
      setSelectedMetric(null);
    }
  }, [versionData.sortConfig, versionData.metrics, versionData.isArchived]);

  const canShowGeometry =
    !!versionData.geometry?.renderContent &&
    !versionData.isArchived &&
    (!versionData.aiGenerating || (versionData.aiStageIndex ?? 0) >= 0);

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

                  {versionData.uploadError && !versionData.isArchived && (
                    <ErrorMessage>{versionData.uploadError}</ErrorMessage>
                  )}
                </CanvasPlaceholder>
              )}
            </div>
          </CanvasArea>
        </ContentContainer>

        {!versionData.isArchived && !isAIGenerating && versionData.metrics.length > 0 && (
          <MetricsFooter $theme={theme} $isArchived={versionData.isArchived}>
            {displayedMetrics.map((metric, idx) => {
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
                  </MetricButtonLabel>
                  <ValueRow>
                    <MetricButtonValue
                      $isSelected={isSelected}
                      $isArchived={versionData.isArchived}
                    >
                      {formatMetricValue(metric)}
                    </MetricButtonValue>
                  </ValueRow>
                </MetricButton>
              );
            })}

            {hasMoreMetrics && (
              <MoreMetricsButton
                onClick={handleMoreMetricsClick}
                className="nodrag"
                title={`View ${hiddenMetricsCount} more metric${
                  hiddenMetricsCount > 1 ? "s" : ""
                }`}
              >
                <MoreHorizontal size={16} />
                <MoreMetricsLabel>+{hiddenMetricsCount} more</MoreMetricsLabel>
              </MoreMetricsButton>
            )}
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
    return "1px solid var(--border-outline)";
  }};
  border-radius: 12px;
  width: 540px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.$isArchived
      ? "rgba(0, 0, 0, 0.1) 0px 1px 3px"
      : "rgba(0, 0, 0, 0.24) 0px 3px 8px"};
  filter: ${(props) => (props.$isArchived ? "grayscale(0.7)" : "none")};
  transition: min-height 0.3s ease-in-out;
  background-color: var(--bg-tertiary);
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
      props.$hasError ? "var(--error)" : "var(--hover-primary)"};
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
  justify-content: space-evenly;
  gap: 32px;
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
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${(props) =>
      props.$theme === "dark" ? "var(--bg-primary)" : "var(--text-muted)"};
  }
  &::-webkit-scrollbar-thumb {
    background: var(--primary-alternate);
    border-radius: 8px;
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
      return "var(--primary-action)";
    }
    if (props.$theme === "light") {
      return "var(--bg-primary)";
    }
    return "var(--bg-secondary)";
  }};

  color: ${(props) => {
    if (props.$isArchived) {
      return "var(--text-muted)";
    }

    if (props.$theme === "light") {
      return props.$isSelected ? "#B1BEC9" : "var(--text-muted)";
    }

    return props.$isSelected ? "#B1BEC9" : "var(--text-muted)";
  }};

  border: 1px solid
    ${(props) => {
      if (props.$isArchived) return "var(--border-outline)";
      if (props.$isSorted) return "var(--primary-action)";
      if (props.$isSelected) return "var(--primary-action)";
      return "var(--border-outline)";
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
      return props.$isSelected ? "var(--hover-primary)" : "var(--hover-bg)";
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
    color: ${props => props.$isSelected ? 'white' : 'var(--text-primary)'};
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
    props.$isSelected && !props.$isArchived ? "600" : "600"};
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: center;

  &:hover {
    color: reds;
  }
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
    return props.$isSelected ? "white" : "var(--text-primary)";
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

const MoreMetricsButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border: 1px dashed var(--border-outline);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;

  &:hover {
    background: var(--hover-bg);
      border: 1px solid var(--border-outline);
    transform: translateY(-1px);

    svg {
      color: var(--primary-alternate);
    }
  }

  svg {
    color: var(--text-primary);
    transition: color 0.2s ease;
  }
`;

const MoreMetricsLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.3px;
`;
