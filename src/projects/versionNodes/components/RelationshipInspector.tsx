import React, { useMemo, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowInstance,
  ConnectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { SimpleVersionRelationshipStorage } from "../hooks/versionRelationshipStorage";

type TabKey = "graph" | "json" | "diagnostics";

interface RelationshipInspectorProps {
  projectId: string;
  // Optional: a fixed height (default 420)
  height?: number;
  // Optional: allow initializing sequential relationships using current version IDs
  onInitializeSequential?: () => string[] | null | undefined;
  // Optional: style overrides
  className?: string;
}

/* -------------------- Styled -------------------- */

const InspectorContainer = styled.div`
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-bg);
  border-radius: 12px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-bg);
`;

const Title = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid var(--border-bg);
  background: ${({ $primary }) => ($primary ? "var(--primary-action)" : "var(--bg-secondary)")};
  color: ${({ $primary }) => ($primary ? "white" : "var(--text-primary)")};
  transition: all 0.15s ease;
  &:hover {
    filter: brightness(0.98);
    border-color: var(--border-outline);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid var(--border-bg);
  background: var(--bg-secondary);
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid ${({ $active }) => ($active ? "var(--primary-action)" : "var(--border-bg)")};
  background: ${({ $active }) => ($active ? "var(--primary-alternate)" : "var(--bg-tertiary)")};
  color: ${({ $active }) => ($active ? "var(--text-inverted)" : "var(--text-primary)")};
  cursor: pointer;
`;

const Body = styled.div<{ $h: number }>`
  height: ${({ $h }) => `${$h}px`};
  position: relative;
`;

const JsonPane = styled.pre`
  margin: 0;
  height: 100%;
  overflow: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 12px;
  font-size: 12px;
  line-height: 1.4;
  border-top: 1px solid var(--border-bg);
`;

const DiagPane = styled.div`
  height: 100%;
  overflow: auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 12px;
  font-size: 13px;
  border-top: 1px solid var(--border-bg);
`;

const List = styled.ul`
  margin: 6px 0 14px 16px;
  padding: 0;
  li { margin: 2px 0; }
`;

const Tag = styled.span<{ $kind: "ok" | "warn" | "err" }>`
  display: inline-block;
  padding: 2px 6px;
  font-size: 11px;
  border-radius: 6px;
  margin-left: 6px;
  color: white;
  background: ${({ $kind }) =>
    $kind === "ok" ? "var(--success, #16a34a)" :
    $kind === "warn" ? "var(--warning, #d97706)" :
    "var(--danger, #dc2626)"};
`;

/* -------------------- Utils: graph + diagnostics -------------------- */

// Build nodes/edges for React Flow
function buildGraph(relationships: Record<string, string[]>): { nodes: Node[]; edges: Edge[] } {
  // A simple grid layout (columns by parent chain depth)
  const { depthById, roots } = computeDepths(relationships);
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const xSpacing = 240;
  const ySpacing = 120;

  // Group nodes by depth
  const byDepth = new Map<number, string[]>();
  const allNodes = new Set<string>([
    ...Object.keys(relationships),
    ...Object.values(relationships).flat(),
  ]);
  for (const id of allNodes) {
    const d = depthById.get(id) ?? 0;
    const arr = byDepth.get(d) ?? [];
    arr.push(id);
    byDepth.set(d, arr);
  }

  // Create nodes with grid positions
  for (const [depth, ids] of [...byDepth.entries()].sort((a, b) => a[0] - b[0])) {
    ids.forEach((id, row) => {
      nodes.push({
        id,
        type: "default",
        position: { x: depth * xSpacing, y: row * ySpacing },
        data: { label: id },
        style: {
          border: "1px solid var(--border-bg)",
          background: roots.has(id) ? "var(--primary-alternate)" : "var(--bg-secondary)",
          color: roots.has(id) ? "var(--text-inverted)" : "var(--text-primary)",
          borderRadius: 8,
          padding: 6,
          width: 120,
          textAlign: "center",
        },
      });
    });
  }

  // Create edges
  for (const [parent, children] of Object.entries(relationships)) {
    for (const child of children) {
      edges.push({
        id: `${parent}→${child}`,
        source: parent,
        target: child,
        animated: true,
        style: { stroke: "var(--accent-neutral)", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--accent-neutral)" },
      });
    }
  }

  return { nodes, edges };
}

function computeDepths(relationships: Record<string, string[]>) {
  // Roots: appear as key but never as a child
  const allChildren = new Set<string>(Object.values(relationships).flat());
  const roots = new Set<string>(Object.keys(relationships).filter(k => !allChildren.has(k)));

  const depthById = new Map<string, number>();
  const visit = (id: string, depth: number) => {
    const prev = depthById.get(id);
    if (prev === undefined || depth > prev) depthById.set(id, depth);
    const children = relationships[id] ?? [];
    children.forEach(c => visit(c, depth + 1));
  };
  roots.forEach(r => visit(r, 0));

  // Also include nodes that only appear as children (orphans from missing keys)
  for (const child of allChildren) {
    if (!depthById.has(child)) depthById.set(child, 0);
  }

  return { depthById, roots };
}

function findOrphans(relationships: Record<string, string[]>): string[] {
  const keys = new Set(Object.keys(relationships));
  const children = new Set(Object.values(relationships).flat());
  // orphan = child that never appears as a key (no outgoing entry)
  return [...children].filter((c) => !keys.has(c));
}

function findMissingChildren(relationships: Record<string, string[]>): string[] {
  // Child IDs that are referenced but absent in keys (same as orphans, but named differently)
  return findOrphans(relationships);
}

function findCycles(relationships: Record<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const temp = new Set<string>();
  const perm = new Set<string>();
  const stack: string[] = [];

  const visit = (node: string) => {
    if (perm.has(node)) return;
    if (temp.has(node)) {
      // cycle: find node in stack
      const idx = stack.lastIndexOf(node);
      if (idx !== -1) cycles.push(stack.slice(idx).concat(node));
      return;
    }
    temp.add(node);
    stack.push(node);

    for (const c of relationships[node] ?? []) visit(c);

    temp.delete(node);
    perm.add(node);
    stack.pop();
  };

  const all = new Set<string>([
    ...Object.keys(relationships),
    ...Object.values(relationships).flat(),
  ]);
  for (const n of all) visit(n);

  // Deduplicate cycles that are rotations of each other
  const sig = (cycle: string[]) => {
    const minIdx = cycle.reduce((mi, _, i) => (cycle[i] < cycle[mi] ? i : mi), 0);
    const rot = cycle.slice(minIdx).concat(cycle.slice(0, minIdx));
    return rot.join("→");
  };
  const seen = new Set<string>();
  return cycles.filter((c) => {
    const s = sig(c);
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });
}

/* -------------------- Component -------------------- */

export const RelationshipInspector: React.FC<RelationshipInspectorProps> = ({
  projectId,
  height = 420,
  onInitializeSequential,
  className,
}) => {
  const [tab, setTab] = useState<TabKey>("graph");
  const [rf, setRf] = useState<ReactFlowInstance | null>(null);

  const relationships = useMemo(
    () => SimpleVersionRelationshipStorage.getProjectRelationships(projectId),
    [projectId]
  );

  const { nodes, edges } = useMemo(() => buildGraph(relationships), [relationships]);

  const [rNodes, setRNodes, onNodesChange] = useNodesState<Node>(nodes);
  const [rEdges, setREdges, onEdgesChange] = useEdgesState<Edge>(edges);

  useEffect(() => {
    setRNodes(nodes);
    setREdges(edges);
  }, [nodes, edges, setRNodes, setREdges]);

  // Diagnostics
  const roots = useMemo(() => {
    const allChildren = new Set<string>(Object.values(relationships).flat());
    return Object.keys(relationships).filter((k) => !allChildren.has(k));
  }, [relationships]);

  const orphans = useMemo(() => findOrphans(relationships), [relationships]);
  const cycles = useMemo(() => findCycles(relationships), [relationships]);

  const handleRefresh = useCallback(() => {
    // no-op here; parent can re-mount this component or we can force a tiny state toggle
    // simplest: flip tab twice to force re-render, but better to depend on projectId change.
    // In practice: you're likely to re-render this component when relationships change.
    setTab((t) => (t === "graph" ? "json" : "graph"));
    setTimeout(() => setTab("graph"), 0);
  }, []);

  const handleInitSequential = useCallback(() => {
    if (!onInitializeSequential) return;
    const versionIds = onInitializeSequential() || [];
    if (versionIds.length > 0) {
      SimpleVersionRelationshipStorage.initializeSequentialRelationships(projectId, versionIds);
      // trigger a re-read by flipping tabs
      handleRefresh();
    }
  }, [onInitializeSequential, projectId, handleRefresh]);

  return (
    <InspectorContainer className={className}>
      <Header>
        <Title>
          Version Relationship Inspector <Tag $kind="ok">project: {projectId}</Tag>
        </Title>
        <Actions>
          {onInitializeSequential && (
            <Button onClick={handleInitSequential}>Initialize Sequential</Button>
          )}
          <Button onClick={handleRefresh}>Refresh</Button>
        </Actions>
      </Header>

      <Tabs>
        <Tab $active={tab === "graph"} onClick={() => setTab("graph")}>Graph</Tab>
        <Tab $active={tab === "json"} onClick={() => setTab("json")}>JSON</Tab>
        <Tab $active={tab === "diagnostics"} onClick={() => setTab("diagnostics")}>
          Diagnostics
          {cycles.length > 0 && <Tag $kind="err">cycles: {cycles.length}</Tag>}
          {orphans.length > 0 && <Tag $kind="warn">orphans: {orphans.length}</Tag>}
          {roots.length > 0 && <Tag $kind="ok">roots: {roots.length}</Tag>}
        </Tab>
      </Tabs>

      <Body $h={height}>
        {tab === "graph" && (
          <ReactFlow
            nodes={rNodes}
            edges={rEdges}
            onInit={setRf}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={{}}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesConnectable={false}
            elementsSelectable
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick={false}
            panOnDrag
            panOnScroll={false}
            preventScrolling
            proOptions={{ hideAttribution: true }}
            style={{ background: "var(--bg-secondary)" }}
          >
            <Background variant="dots" gap={40} size={2} color="var(--text-secondary)" />
          </ReactFlow>
        )}

        {tab === "json" && (
          <JsonPane>{JSON.stringify(relationships, null, 2)}</JsonPane>
        )}

        {tab === "diagnostics" && (
          <DiagPane>
            <div>
              <strong>Roots</strong> (keys that never appear as a child)
              <Tag $kind="ok">{roots.length}</Tag>
              <List>{roots.map((r) => <li key={r}>{r}</li>)}</List>
            </div>

            <div>
              <strong>Orphans / Missing Keys</strong> (children referenced but missing as keys)
              <Tag $kind={orphans.length ? "warn" : "ok"}>
                {orphans.length}
              </Tag>
              <List>{orphans.map((o) => <li key={o}>{o}</li>)}</List>
            </div>

            <div>
              <strong>Cycles</strong> (parent→child loops)
              <Tag $kind={cycles.length ? "err" : "ok"}>{cycles.length}</Tag>
              <List>
                {cycles.map((c, i) => (
                  <li key={i}>{c.join(" → ")}</li>
                ))}
              </List>
            </div>
          </DiagPane>
        )}
      </Body>
    </InspectorContainer>
  );
};

export default RelationshipInspector;
