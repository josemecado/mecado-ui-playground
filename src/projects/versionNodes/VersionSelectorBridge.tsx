// nodeVisuals/versionNodes/VersionMiniSelector.bridge.tsx
import React, { useMemo } from "react";
import { VersionMiniSelector } from "./VersionMiniSelector";
import { ProjectVersion } from "./mockData"; // ✅ same type used by your new selector
import { extractVersionNumber } from "../../../types/project";

type BridgeProps = {
  projectVersions: string[] | null;           // legacy
  projectVersion: number;                     // legacy
  onVersionChange: (version: number) => void; // legacy
  onNewProjectVersion?: () => void | Promise<void>; // legacy
  showPreviewOnHover?: boolean;
};

/**
 * Bridges legacy props (labels + numeric active) to the new VersionMiniSelector (ProjectVersion graph).
 * We synthesize a linear ancestry: each version's parent is the previous one numerically.
 */
export const VersionMiniSelectorBridge: React.FC<BridgeProps> = ({
  projectVersions,
  projectVersion,
  onVersionChange,
  onNewProjectVersion,
  showPreviewOnHover = false,
}) => {
  // 1) Normalize + sort the incoming labels (e.g. ["v1","v3","v2"] → v1, v2, v3)
  const sorted = useMemo(() => {
    const list = (projectVersions ?? [])
      .map((label) => ({ label, num: extractVersionNumber(label) }))
      .filter((x) => Number.isFinite(x.num));
    list.sort((a, b) => a.num - b.num);
    return list;
  }, [projectVersions]);

  // 2) Build a minimal ProjectVersion[] with linear parent pointers
  const versions: ProjectVersion[] = useMemo(() => {
    const now = new Date().toISOString();
    return sorted.map((v, i) => ({
      id: v.label,                             // keep the original label as the id
      title: `Version ${v.num}`,               // display title (customize if you want label)
      parentVersion: i > 0 ? sorted[i - 1].label : null, // linear graph
      createdAt: now,                           // placeholder (not used by mini)
      geometries: [],
      equations: [],
      files: [],
      edges: [],
    }));
  }, [sorted]);

  if (!versions.length) return null;

  // 3) Compute the active node id by matching the numeric value
  const activeVersionId = useMemo(() => {
    const match = versions.find(
      (v) => extractVersionNumber(v.id) === projectVersion
    );
    // Fallback: last version or a synthetic id
    return match?.id ?? versions[versions.length - 1].id;
  }, [versions, projectVersion]);

  return (
    <VersionMiniSelector
      versions={versions}
      activeVersionId={activeVersionId}
      onVersionChange={(id) => onVersionChange(extractVersionNumber(id))}
      onNewVersion={onNewProjectVersion}
      showPreviewOnHover={showPreviewOnHover}
    />
  );
};
