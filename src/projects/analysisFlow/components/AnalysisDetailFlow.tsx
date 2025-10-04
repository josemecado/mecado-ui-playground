// views/AnalysisDetailFlow.tsx
import React, { useMemo, useEffect, useCallback, useRef } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ControlButton,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import {
  AnalysisGroup,
  Analysis,
} from "../../versionNodes/utils/VersionInterfaces";
import { AnalysisIndividualNode } from "../components/AnalysisNode";
import { AnalysisDetailsFooter } from "../components/AnalysisFooter";
import { Maximize2, Minimize2, GitBranch } from "lucide-react";
import { CurrentStepInfo } from "../../versionNodes/utils/VersionInterfaces";

interface AnalysisDetailFlowProps {
  analysisGroup: AnalysisGroup;
  allAnalysisGroups?: AnalysisGroup[];
  onAnalysisClick?: (analysis: Analysis) => void;
  isAnimating?: boolean;
  currentAnalysisId?: string | null;
  currentStepInfo?: CurrentStepInfo | null; // NEW
}

const nodeTypes: NodeTypes = {
  analysis: AnalysisIndividualNode,
};

// REMOVED forwardRef - no longer needed since we don't control animation from here
export const AnalysisDetailFlow: React.FC<AnalysisDetailFlowProps> = ({
  analysisGroup,
  allAnalysisGroups = [],
  onAnalysisClick,
  isAnimating = false,
  currentAnalysisId = null,
  currentStepInfo,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedAnalysis, setSelectedAnalysis] =
    React.useState<Analysis | null>(null);
  const prevAnalysesRef = useRef<Analysis[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Detect when an analysis fails and auto-show footer
  useEffect(() => {
    const prevAnalyses = prevAnalysesRef.current;
    const currentAnalyses = analysisGroup.analyses;

    currentAnalyses.forEach((currentAnalysis, index) => {
      const prevAnalysis = prevAnalyses[index];

      if (
        prevAnalysis &&
        prevAnalysis.status !== "failed" &&
        currentAnalysis.status === "failed"
      ) {
        console.log(`Analysis failed: ${currentAnalysis.name}`);
        setSelectedAnalysis(currentAnalysis);
        onAnalysisClick?.(currentAnalysis);
      }
    });

    prevAnalysesRef.current = [...currentAnalyses];
  }, [analysisGroup.analyses, onAnalysisClick]);

  // Helper: Find analyses from OTHER groups that share steps with the current analysis
  const findSharedAnalysesFromOtherGroups = useCallback(
    (currentAnalysisId: string): Analysis[] => {
      const currentAnalysis = analysisGroup.analyses.find(
        (a) => a.id === currentAnalysisId
      );
      if (!currentAnalysis?.sharedSteps) return [];

      const sharedAnalyses: Analysis[] = [];

      // Get all shared analysis IDs from current analysis
      const sharedAnalysisIds = new Set<string>();
      currentAnalysis.sharedSteps.forEach((config) => {
        config.sharedWithAnalyses.forEach((id) => sharedAnalysisIds.add(id));
      });

      // Find these analyses in OTHER groups
      allAnalysisGroups.forEach((group) => {
        if (group.id === analysisGroup.id) return; // Skip current group

        group.analyses.forEach((analysis) => {
          if (sharedAnalysisIds.has(analysis.id)) {
            sharedAnalyses.push(analysis);
          }
        });
      });

      return sharedAnalyses;
    },
    [analysisGroup, allAnalysisGroups]
  );

  // Create a stable key that represents the actual state of analyses
  const analysesStateKey = useMemo(() => {
    return analysisGroup.analyses
      .map(
        (a) =>
          `${a.id}-${a.status}-${a.sharedStepRunning}-${a.currentStepIndex}-${a.progress}`
      )
      .join("|");
  }, [analysisGroup.analyses]);

  // Update nodes whenever analysisGroup changes OR the analyses state changes

  useEffect(() => {
    const analysisSpacing = 300;
    const startX = 200;
    const centerY = 250;

    // Main group nodes
    const mainNodes: Node[] = analysisGroup.analyses.map((analysis, index) => ({
      id: `${analysisGroup.id}-${analysis.id}`,
      type: "analysis",
      position: {
        x: startX + index * analysisSpacing,
        y: centerY,
      },
      data: {
        ...analysis,
        currentStepInfo,
        _updateKey: `${analysis.id}-${currentStepInfo?.stepIndex}-${currentStepInfo?.progress}`,
      },
    }));

    // Ghost nodes with intelligent placement
    if (currentAnalysisId && isAnimating) {
      const sharedAnalyses =
        findSharedAnalysesFromOtherGroups(currentAnalysisId);
      const currentAnalysisIndex = analysisGroup.analyses.findIndex(
        (a) => a.id === currentAnalysisId
      );

      if (currentAnalysisIndex !== -1 && sharedAnalyses.length > 0) {
        const currentNodeX = startX + currentAnalysisIndex * analysisSpacing;

        // Group shared analyses by their group
        const analysesByGroup = new Map<
          string,
          { analysis: Analysis; groupName: string }[]
        >();

        sharedAnalyses.forEach((analysis) => {
          // Find which group this analysis belongs to
          const group = allAnalysisGroups.find((g) =>
            g.analyses.some((a) => a.id === analysis.id)
          );

          if (group) {
            if (!analysesByGroup.has(group.id)) {
              analysesByGroup.set(group.id, []);
            }
            analysesByGroup.get(group.id)!.push({
              analysis,
              groupName: group.name,
            });
          }
        });

        const ghostNodes: Node[] = [];
        let groupIndex = 0;

        analysesByGroup.forEach((groupAnalyses, groupId) => {
          const verticalSpacing = 350;
          const horizontalSpacing = 250;

          groupAnalyses.forEach((item, analysisIndex) => {
            // Intelligent placement strategy:
            // 1. Place groups vertically (above/below alternating)
            // 2. Within each group, spread horizontally
            // 3. Avoid overlapping with main nodes

            const isAbove = groupIndex % 2 === 0;
            const verticalOffset = isAbove
              ? -(verticalSpacing + Math.floor(groupIndex / 2) * 60)
              : verticalSpacing + Math.floor(groupIndex / 2) * 60;

            // Calculate x position to avoid main nodes
            let xPosition = currentNodeX;

            // If multiple analyses in group, spread them out
            if (groupAnalyses.length > 1) {
              const spread =
                (analysisIndex - (groupAnalyses.length - 1) / 2) *
                horizontalSpacing;
              xPosition += spread;

              // Check if this would overlap with a main node and adjust
              const mainNodeXPositions = mainNodes.map((n) => n.position.x);
              const threshold = 100; // Minimum distance from main nodes

              for (const mainX of mainNodeXPositions) {
                if (Math.abs(xPosition - mainX) < threshold) {
                  // Shift to avoid overlap
                  xPosition =
                    mainX < xPosition ? mainX + threshold : mainX - threshold;
                }
              }
            }

            ghostNodes.push({
              id: `ghost-${item.analysis.id}`,
              type: "analysis",
              position: {
                x: xPosition,
                y: centerY + verticalOffset,
              },
              data: {
                ...item.analysis,
                isGhostNode: true,
                ghostGroupName: item.groupName, // Add group name to data
              },
              style: {
                opacity: 0.6,
                pointerEvents: "none" as const,
              },
            });
          });

          groupIndex++;
        });

        setNodes([...mainNodes, ...ghostNodes]);
        return;
      }
    }

    setNodes(mainNodes);
  }, [
    analysesStateKey,
    currentAnalysisId,
    isAnimating,
    findSharedAnalysesFromOtherGroups,
    setNodes,
    analysisGroup.id,
    currentStepInfo,
    allAnalysisGroups, // Add this dependency
  ]);

  // Update edges whenever analysisGroup or animation state changes
  useEffect(() => {
    const edgeList: Edge[] = [];

    // Main edges between analyses in the group
    analysisGroup.analyses.forEach((analysis, index) => {
      if (index > 0) {
        const prevAnalysis = analysisGroup.analyses[index - 1];
        const prevNodeId = `${analysisGroup.id}-${prevAnalysis.id}`;
        const currentNodeId = `${analysisGroup.id}-${analysis.id}`;

        const isCompleted =
          prevAnalysis.status === "completed" ||
          prevAnalysis.status === "failed";
        const isFailed = prevAnalysis.status === "failed";
        const isActive = currentAnalysisId === analysis.id;

        edgeList.push({
          id: `edge-${prevNodeId}-${currentNodeId}`,
          source: prevNodeId,
          target: currentNodeId,
          type: "smoothstep",
          animated: isActive,
          style: {
            stroke: isFailed
              ? "var(--text-muted)"
              : isCompleted
              ? "var(--success)"
              : "var(--text-muted)",
            strokeWidth: 2,
            strokeDasharray: isCompleted ? "0" : "5 5",
            opacity: isCompleted ? 1 : 0.5,
          },
        });
      }
    });

    // Add edges to ghost nodes if current analysis is running
    if (currentAnalysisId && isAnimating) {
      const sharedAnalyses =
        findSharedAnalysesFromOtherGroups(currentAnalysisId);
      const currentNodeId = `${analysisGroup.id}-${currentAnalysisId}`;

      sharedAnalyses.forEach((analysis) => {
        edgeList.push({
          id: `edge-ghost-${currentNodeId}-${analysis.id}`,
          source: currentNodeId,
          target: `ghost-${analysis.id}`,
          type: "smoothstep",
          animated: true,
          label: "Shared Preprocessing",
          labelBgStyle: {
            fill: "var(--bg-secondary)",
            fillOpacity: 0.9,
          },
          labelStyle: {
            fill: "var(--accent-secondary)",
            fontSize: 10,
            fontWeight: 600,
          },
          style: {
            stroke: "var(--accent-secondary)",
            strokeWidth: 2,
            strokeDasharray: "5 5",
            opacity: 0.7,
          },
        });
      });
    }

    setEdges(edgeList);
  }, [
    analysisGroup.analyses,
    analysisGroup.id,
    currentAnalysisId,
    isAnimating,
    findSharedAnalysesFromOtherGroups,
    setEdges,
  ]);

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === "analysis" && !node.data.isGhostNode) {
        const analysis = node.data as Analysis;
        setSelectedAnalysis(analysis);
        onAnalysisClick?.(analysis);
      }
    },
    [onAnalysisClick]
  );

  return (
    <DetailContainer $fullscreen={isFullscreen}>
      <FlowWrapper>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.3,
            maxZoom: 1.2,
          }}
          minZoom={0.4}
          maxZoom={2}
        >
          <StyledControls>
            <ControlButton
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </ControlButton>
          </StyledControls>
          <Background
            variant={BackgroundVariant.Dots}
            gap={60}
            size={1.5}
            color="var(--text-muted)"
          />
        </ReactFlow>
      </FlowWrapper>

      {isAnimating && (
        <StatusOverlay>
          <StatusCard>
            <StatusPulse />
            <StatusContent>
              <StatusTitle>Analyzing {analysisGroup.name}</StatusTitle>
              <StatusProgress>
                Running:{" "}
                {analysisGroup.analyses.find((a) => a.id === currentAnalysisId)
                  ?.name || "..."}
              </StatusProgress>
              {currentAnalysisId &&
                findSharedAnalysesFromOtherGroups(currentAnalysisId).length >
                  0 && (
                  <SharedStepIndicator>
                    <GitBranch size={10} />
                    Shared with{" "}
                    {
                      findSharedAnalysesFromOtherGroups(currentAnalysisId)
                        .length
                    }{" "}
                    other{" "}
                    {findSharedAnalysesFromOtherGroups(currentAnalysisId)
                      .length === 1
                      ? "analysis"
                      : "analyses"}
                  </SharedStepIndicator>
                )}
            </StatusContent>
          </StatusCard>
        </StatusOverlay>
      )}

      {selectedAnalysis && (
        <AnalysisDetailsFooter
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
        />
      )}
    </DetailContainer>
  );
};

// Styled Components (unchanged)
const DetailContainer = styled.div<{ $fullscreen: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: ${(props) => (props.$fullscreen ? "fixed" : "relative")};
  ${(props) =>
    props.$fullscreen &&
    `
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  `}
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
`;

const FlowWrapper = styled.div`
  flex: 1;
  position: relative;

  .react-flow__renderer {
    background: transparent;
  }

  .react-flow__edge-path {
    transition: all 0.3s ease;
  }

  .react-flow__edge.animated .react-flow__edge-path {
    stroke: var(--accent-primary) !important;
    stroke-width: 2.5 !important;
    stroke-dasharray: 5 5 !important;
    opacity: 1 !important;
    filter: drop-shadow(0 0 4px rgba(var(--accent-primary-rgb), 0.4));
    animation: dashFlow 0.5s linear infinite;
  }

  @keyframes dashFlow {
    to {
      stroke-dashoffset: -10;
    }
  }

  .react-flow__attribution {
    display: none;
  }
`;

const StyledControls = styled(Controls)`
  button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 4px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--primary-alternate);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .react-flow__controls-button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    border-radius: 8px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--primary-alternate);
    }

    svg {
      fill: currentColor;
    }
  }
`;

const StatusOverlay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
`;

const StatusCard = styled.div`
  position: relative;
  padding: 16px 20px;
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 240px;
`;

const StatusPulse = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-alternate);
  animation: statusPulse 1.5s ease-in-out infinite;

  @keyframes statusPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
  }
`;

const StatusContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatusTitle = styled.div`
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
`;

const StatusProgress = styled.div`
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
`;

const SharedStepIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--accent-secondary);
  font-size: 10px;
  font-weight: 500;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;
