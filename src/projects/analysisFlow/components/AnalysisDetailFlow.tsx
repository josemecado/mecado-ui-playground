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
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import {
  AnalysisGroup,
  Analysis,
  CurrentStepInfo,
} from "../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import { AnalysisIndividualNode } from "../components/AnalysisNode";
import { AnalysisDetailsFooter } from "../components/AnalysisFooter";
import { GitBranch } from "lucide-react";

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

const getMiniMapColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "var(--success)";
    case "failed":
      return "var(--error)";
    case "running":
      return "var(--primary-alternate)";
    default:
      return "var(--text-muted)";
  }
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
    const analysisSpacing = 350;
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
    <DetailContainer>
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
          <StyledControls />

          <Background
            variant={BackgroundVariant.Dots}
            gap={60}
            size={1.5}
            color="var(--text-muted)"
          />

          <MiniMap
            nodeColor={(node) => {
              const status = node.data as Analysis;
              return getMiniMapColor(status.status);
            }}
            maskColor="rgba(0, 0, 0, 0.6)"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-bg)",
              borderRadius: "8px",
            }}
          />
        </ReactFlow>
      </FlowWrapper>

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
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;

  background: var(--bg-primary);
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

  .react-flow__controls-button {
    background: var(--bg-secondary);
    border: 1px solid var(--border-outline);
    color: var(--text-primary);
    border-radius: 8px;
    width: 32px;
    height: 32px;
    margin: 4px;

    &:hover {
      background: var(--hover-bg);
      border-color: var(--primary-alternate);
    }

    .react-flow__minimap {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-bg);
    }

    svg {
      fill: currentColor;
    }
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
