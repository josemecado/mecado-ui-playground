// useSelectionStateHook.ts
import { useCallback, useState } from 'react';
import {
  GeometryRef,
  GeometrySelectionProvider,
} from './geometry-selection.types';

type Mode = 'face' | 'edge' | 'body';

type ShowSelectionOptions = {
  /** replace (default) replaces current selection; merge unions with current; hover shows as hover only */
  behavior?: 'replace' | 'merge' | 'hover';
  /** If behavior=hover, set which element to hover (defaults to first) */
  hoverIndex?: number;
  /** Clear hover after ms (only when behavior=hover). If omitted, hover persists. */
  hoverFlashMs?: number;
};

export function useSelectionStateHook() {
  const [selectedFaces, setSelectedFaces] = useState<Set<number>>(new Set());
  const [selectedEdges, setSelectedEdges] = useState<Set<number>>(new Set());
  const [selectedBodies, setSelectedBodies] = useState<Set<number>>(new Set());
  const [hoveredElement, setHoveredElement] = useState<{ id: number; type: Mode } | null>(null);
  const [mode, setMode] = useState<Mode>('face');

  const applyRefs = (refs: GeometryRef[], behavior: 'replace' | 'merge') => {
    const nextFaces = behavior === 'replace' ? new Set<number>() : new Set(selectedFaces);
    const nextEdges = behavior === 'replace' ? new Set<number>() : new Set(selectedEdges);
    const nextBodies = behavior === 'replace' ? new Set<number>() : new Set(selectedBodies);

    for (const r of refs) {
      if (r.type === 'face') nextFaces.add(r.id);
      else if (r.type === 'edge') nextEdges.add(r.id);
      else nextBodies.add(r.id);
    }

    setSelectedFaces(nextFaces);
    setSelectedEdges(nextEdges);
    setSelectedBodies(nextBodies);
    setHoveredElement(null);
  };

  const removeRefs = (refs: GeometryRef[]) => {
    const nextFaces = new Set(selectedFaces);
    const nextEdges = new Set(selectedEdges);
    const nextBodies = new Set(selectedBodies);
    for (const r of refs) {
      if (r.type === 'face') nextFaces.delete(r.id);
      else if (r.type === 'edge') nextEdges.delete(r.id);
      else nextBodies.delete(r.id);
    }
    setSelectedFaces(nextFaces);
    setSelectedEdges(nextEdges);
    setSelectedBodies(nextBodies);
  };

  /** Show/highlight whatever the provider currently selects. */
  const showSelection = useCallback(
    (provider: GeometrySelectionProvider, opts?: ShowSelectionOptions) => {
      const behavior = opts?.behavior ?? 'replace';
      const refs = provider.getSelected();

      if (behavior === 'hover') {
        const idx = Math.min(Math.max(opts?.hoverIndex ?? 0, 0), Math.max(refs.length - 1, 0));
        const ref = refs[idx];
        setHoveredElement(ref ? { id: ref.id, type: ref.type } : null);

        if (opts?.hoverFlashMs && ref) {
          const id = setTimeout(() => setHoveredElement(null), opts.hoverFlashMs);
          // optional: store id in a ref to clear on unmount
        }
        return;
      }

      applyRefs(refs, behavior);
    },
    [/* state setters are stable */]
  );

  /** Merge provider's selection into current. */
  const addSelection = useCallback(
    (provider: GeometrySelectionProvider) => {
      const refs = provider.getSelected();
      applyRefs(refs, 'merge');
    },
    []
  );

  /** Remove provider's selection from current. */
  const removeSelection = useCallback(
    (provider: GeometrySelectionProvider) => {
      const refs = provider.getSelected();
      removeRefs(refs);
    },
    [selectedFaces, selectedEdges, selectedBodies]
  );

  const onElementClick = useCallback(/* existing impl */ () => {}, []);
  const onElementHover = useCallback(/* existing impl */ () => {}, []);
  const onModeChange = useCallback((m: Mode) => setMode(m), []);
  const onClearAll = useCallback(() => {
    setSelectedFaces(new Set());
    setSelectedEdges(new Set());
    setSelectedBodies(new Set());
    setHoveredElement(null);
  }, []);

  const getSnapshot = useCallback(() => ({
    faces: Array.from(selectedFaces),
    edges: Array.from(selectedEdges),
    bodies: Array.from(selectedBodies),
  }), [selectedFaces, selectedEdges, selectedBodies]);

  const loadSnapshot = useCallback((snap: { faces: number[]; edges: number[]; bodies: number[] }) => {
    setSelectedFaces(new Set(snap.faces ?? []));
    setSelectedEdges(new Set(snap.edges ?? []));
    setSelectedBodies(new Set(snap.bodies ?? []));
    setHoveredElement(null);
  }, []);

  return {
    // current state
    selectedFaces, selectedEdges, selectedBodies, hoveredElement, mode,

    // new generic methods
    showSelection, addSelection, removeSelection,

    // existing handlers
    onElementClick, onElementHover, onModeChange, onClearAll,

    // snapshot I/O for persistence
    getSnapshot, loadSnapshot,
  };
}
