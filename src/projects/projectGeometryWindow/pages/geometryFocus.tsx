// ─────────────────────── useSelectionStateHook ──────────────────────
import * as React from 'react';
import { useCallback, useRef, useState } from 'react';

function toSet(arr: number[] | Set<number> | undefined): Set<number> {
  return arr instanceof Set ? new Set(arr) : new Set(arr ?? []);
}
const toArray = (s: Set<number>) => Array.from(s.values());

export type SelectionUpdateMode = 'replace' | 'merge' | 'subtract' | 'toggle';

/**
 * Single source of truth for selections. No separate "focused" state;
 * focus simply *sets* the selection via the focus manager.
 */
export function useSelectionStateHook(opts?: {
  debugMappings?: {
    toMechanicalId?: (type: ElementType, id: number) => string | null;
    toDiscoveryId?: (type: ElementType, id: number) => string | null;
  };
}) {
  const [selectedFaces, setFaces] = useState<Set<number>>(new Set());
  const [selectedEdges, setEdges] = useState<Set<number>>(new Set());
  const [selectedBodies, setBodies] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<ElementType>('face');
  const [hoveredElement, setHovered] = useState<{ id: number; type: ElementType } | null>(null);

  const log = useCallback((type: ElementType, id: number, action: string) => {
    if (!opts?.debugMappings) return;
    const mech = opts.debugMappings.toMechanicalId?.(type, id) ?? '—';
    const disco = opts.debugMappings.toDiscoveryId?.(type, id) ?? '—';
    // eslint-disable-next-line no-console
    console.debug(`[selection] ${action} ${type}#${id} → mech=${mech} disco=${disco}`);
  }, [opts?.debugMappings]);

  const replaceAll = useCallback((sel: Selections) => {
    setFaces(toSet(sel.faces));
    setEdges(toSet(sel.edges));
    setBodies(toSet(sel.bodies));
  }, []);

  const mergeAll = useCallback((sel: Selections) => {
    setFaces(prev => new Set([...prev, ...sel.faces]));
    setEdges(prev => new Set([...prev, ...sel.edges]));
    setBodies(prev => new Set([...prev, ...sel.bodies]));
  }, []);

  const subtractAll = useCallback((sel: Selections) => {
    setFaces(prev => mutateRemove(prev, sel.faces));
    setEdges(prev => mutateRemove(prev, sel.edges));
    setBodies(prev => mutateRemove(prev, sel.bodies));
  }, []);

  const setSelection = useCallback((sel: Selections, how: SelectionUpdateMode = 'replace') => {
    if (how === 'replace') return replaceAll(sel);
    if (how === 'merge') return mergeAll(sel);
    if (how === 'subtract') return subtractAll(sel);
    // toggle
    setFaces(prev => toggleMany(prev, sel.faces));
    setEdges(prev => toggleMany(prev, sel.edges));
    setBodies(prev => toggleMany(prev, sel.bodies));
  }, [mergeAll, replaceAll, subtractAll]);

  // Convenience mutators (for UI gestures)
  const addSelections = useCallback((delta: PartialSelections) => {
    if (delta.faces) setFaces(prev => new Set([...prev, ...delta.faces!]));
    if (delta.edges) setEdges(prev => new Set([...prev, ...delta.edges!]));
    if (delta.bodies) setBodies(prev => new Set([...prev, ...delta.bodies!]));
  }, []);

  const removeSelections = useCallback((delta: PartialSelections) => {
    if (delta.faces) setFaces(prev => mutateRemove(prev, delta.faces!));
    if (delta.edges) setEdges(prev => mutateRemove(prev, delta.edges!));
    if (delta.bodies) setBodies(prev => mutateRemove(prev, delta.bodies!));
  }, []);

  const clearAll = useCallback(() => replaceAll({ faces: [], edges: [], bodies: [] }), [replaceAll]);

  const onElementClick = useCallback((el: { id: number; type: ElementType }) => {
    log(el.type, el.id, 'click');
    if (el.type === 'face') setFaces(prev => toggleOne(prev, el.id));
    else if (el.type === 'edge') setEdges(prev => toggleOne(prev, el.id));
    else setBodies(prev => toggleOne(prev, el.id));
  }, [log]);

  const onElementHover = useCallback((el: { id: number; type: ElementType } | null) => setHovered(el), []);

  const onModeChange = useCallback((next: ElementType) => setMode(next), []);

  const loadSnapshot = useCallback((snap: SelectionSnapshot) => { setMode(snap.mode); replaceAll(snap); }, [replaceAll]);
  const getSnapshot = useCallback((): SelectionSnapshot => ({
    faces: toArray(selectedFaces),
    edges: toArray(selectedEdges),
    bodies: toArray(selectedBodies),
    mode,
  }), [selectedFaces, selectedEdges, selectedBodies, mode]);

  return {
    // state
    selectedFaces, selectedEdges, selectedBodies,
    hoveredElement, mode,

    // primary API
    setSelection,           // (selections, 'replace' | 'merge' | 'subtract' | 'toggle')
    addSelections,          // (partial) – convenience
    removeSelections,       // (partial) – convenience
    clearAll,

    // interaction callbacks
    onElementClick, onElementHover, onModeChange,

    // bulk ops
    loadSnapshot, getSnapshot,
  } as const;
}

function toggleOne(prev: Set<number>, id: number) {
  const next = new Set(prev);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}
function toggleMany(prev: Set<number>, ids: number[]) {
  const next = new Set(prev);
  ids.forEach(id => next.has(id) ? next.delete(id) : next.add(id));
  return next;
}
function mutateRemove(prev: Set<number>, ids: number[]) {
  const next = new Set(prev);
  ids.forEach(id => next.delete(id));
  return next;
}

// ──────────────────── useGeometryFocusManagerHook ───────────────────
/**
 * Adapts any `GeometrySelectable` to the app selection.
 * Set `strategy` to control how focus applies: default `'replace'`.
 */
export function useGeometryFocusManagerHook(args: {
  setSelection: (s: Selections, how?: SelectionUpdateMode) => void;
  clearSelection: () => void;
  strategy?: SelectionUpdateMode;
  lockWhileFocused?: boolean;
}) {
  const strategy = args.strategy ?? 'replace';
  const focusedRef = useRef<GeometrySelectable | null>(null);

  const focusOn = useCallback((selectable: GeometrySelectable | null) => {
    focusedRef.current = selectable;
    if (!selectable) return args.clearSelection();
    const sel = selectable.getSelections();
    args.setSelection(sel, strategy);
  }, [args, strategy]);

  return {
    focusOn,                 // primary: apply focused object's selections
    onFocus: focusOn,        // alias for readability in some call sites
    getFocusedItem: () => focusedRef.current,
    isFocused: () => focusedRef.current != null,
    isLocked: () => !!args.lockWhileFocused && focusedRef.current != null,
  } as const;
}

// ──────────────────────── useVTKRendererHook ────────────────────────
/**
 * VTK adapter: consumes the unified selection sets and updates highlighting.
 * Replace the TODOs with the concrete VTK pipeline code used in your app.
 */
export function useVTKRendererHook(params: {
  container: React.RefObject<HTMLDivElement>;
  polyData: { faces: any; edges: any; bodies: any } | null;
  lookupTables: any;
  isReady: boolean;

  selectedFaces: Set<number>;
  selectedEdges: Set<number>;
  selectedBodies: Set<number>;

  hoveredElement: { id: number; type: ElementType } | null;
  displayMode: ElementType;
}) {
  const [isInitialized, setInitialized] = useState(false);

  // init / teardown
  React.useEffect(() => {
    if (!params.isReady || !params.container.current || isInitialized) return;
    // TODO: create renderer & attach to container
    setInitialized(true);
    return () => {
      // TODO: dispose VTK resources
      setInitialized(false);
    };
  }, [params.isReady, params.container, isInitialized]);

  // apply selection highlights
  React.useEffect(() => {
    if (!isInitialized) return;
    // TODO: update VTK pipeline to highlight selected faces/edges/bodies
  }, [isInitialized, params.selectedFaces, params.selectedEdges, params.selectedBodies]);

  // hovered feedback
  React.useEffect(() => { if (!isInitialized) return; /* TODO */ }, [isInitialized, params.hoveredElement]);

  const getElementAt = React.useCallback((x: number, y: number): { id: number; type: ElementType } | null => {
    if (!isInitialized) return null;
    // TODO: pick using lookupTables → map cell → element id/type
    return null;
  }, [isInitialized]);

  const resetCamera = React.useCallback(() => { if (!isInitialized) return; /* TODO */ }, [isInitialized]);

  return { getElementAt, resetCamera, isInitialized } as const;
}

// ────────────────────── useInteractionManagerHook ────────────────────
export function useInteractionManagerHook(args: {
  getElementAt: (x: number, y: number) => { id: number; type: ElementType } | null;
  isVtkReady: boolean;
  onElementClick: (el: { id: number; type: ElementType }) => void;
  onElementHover: (el: { id: number; type: ElementType } | null) => void;
  onModeChange: (m: ElementType) => void;
  onClearAll: () => void;
  currentMode: ElementType;
  appMode: 'fea' | 'handcalc' | 'none';
  isSelectionEnabled: () => boolean;
}) {
  const enabled = args.isVtkReady && args.isSelectionEnabled();

  const handleMouseMove = React.useCallback((ev: MouseEvent) => {
    if (!enabled) return;
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const hit = args.getElementAt(ev.clientX - r.left, ev.clientY - r.top);
    args.onElementHover(hit);
  }, [enabled, args]);

  const handleClick = React.useCallback((ev: MouseEvent) => {
    if (!enabled) return;
    const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const hit = args.getElementAt(ev.clientX - r.left, ev.clientY - r.top);
    if (hit) args.onElementClick(hit);
  }, [enabled, args]);

  const handleKeyPress = React.useCallback((ev: KeyboardEvent) => {
    if (!enabled) return;
    if (ev.key === 'Escape') return args.onClearAll();
    if (ev.key === '1') return args.onModeChange('face');
    if (ev.key === '2') return args.onModeChange('edge');
    if (ev.key === '3') return args.onModeChange('body');
  }, [enabled, args]);

  return { handleMouseMove, handleClick, handleKeyPress } as const;
}

// ───────────────────────── Usage sketch (component) ─────────────────────────
/**
const selection = useSelectionStateHook({ debugMappings });
const vtk = useVTKRendererHook({
  container: vtkContainerRef,
  polyData: polyDataProcessing.polyData,
  lookupTables,
  isReady: polyDataProcessing.isProcessed && lookupTables.isTablesReady,
  selectedFaces: selection.selectedFaces,
  selectedEdges: selection.selectedEdges,
  selectedBodies: selection.selectedBodies,
  hoveredElement: selection.hoveredElement,
  displayMode: selection.mode,
});

const focus = useGeometryFocusManagerHook({
  setSelection: selection.setSelection,
  clearSelection: selection.clearAll,
  strategy: 'replace', // focused object fully determines selection
});

// HandCalc selection drives focus
useEffect(() => {
  if (sidebarMode === 'handcalc' && handCalcInstances.selectedInstance) {
    focus.focusOn(handCalcInstances.selectedInstance); // any GeometrySelectable works
  } else {
    focus.focusOn(null);
  }
}, [sidebarMode, handCalcInstances.selectedInstance]);

const im = useInteractionManagerHook({
  getElementAt: vtk.getElementAt,
  isVtkReady: vtk.isInitialized,
  onElementClick: selection.onElementClick,
  onElementHover: selection.onElementHover,
  onModeChange: selection.onModeChange,
  onClearAll: selection.clearAll,
  currentMode: selection.mode,
  appMode: sidebarMode,
  isSelectionEnabled: () => true,
});
*/

// ───────────────────────────── API Reference ─────────────────────────────
/**
 * Hook return values & key methods
 * -------------------------------------------------------------------------
 * useSelectionStateHook → {
 *   selectedFaces/Edges/Bodies: Set<number>,
 *   hoveredElement: {id,type}|null, mode: ElementType,
 *   setSelection(sel, mode='replace'),  // primary apply
 *   addSelections(partial), removeSelections(partial), clearAll(),
 *   onElementClick(el), onElementHover(el|null), onModeChange(type),
 *   loadSnapshot(snap), getSnapshot(): Snapshot
 * }
 *
 * useGeometryFocusManagerHook → {
 *   focusOn(selectable|null),   // primary focus entry point (alias: onFocus)
 *   onFocus: focusOn,
 *   getFocusedItem(), isFocused(), isLocked()
 * }
 *
 * useVTKRendererHook → {
 *   getElementAt(x,y) → {id,type}|null, resetCamera(), isInitialized: boolean
 * }
 *
 * useInteractionManagerHook → {
 *   handleMouseMove, handleClick, handleKeyPress
 * }
 *
 * GeometrySelectable contract (generic & minimal):
 *   - getSelections(): Selections   // required
 *   - addSelections?(partial): void|Selections  // optional mutator
 *   - removeSelections?(partial): void|Selections // optional mutator
 *   - getId?(), getName?()       // optional identity helpers
 */

// ───────────────────────── Example implementers ─────────────────────────
/** Example: HandCalcInstance implements GeometrySelectable */
export class HandCalcInstanceSelectable implements GeometrySelectable<string> {
  constructor(private inst: { id: string; name: string; selectedFaces?: number[]; selectedEdges?: number[]; selectedBodies?: number[]; }) {}
  getSelections(): Selections {
    return {
      faces: this.inst.selectedFaces ?? [],
      edges: this.inst.selectedEdges ?? [],
      bodies: this.inst.selectedBodies ?? [],
    };
  }
  getId() { return this.inst.id; }
  getName() { return this.inst.name; }
}

/** Example: Message entity implements GeometrySelectable */
export class MessageSelectable implements GeometrySelectable<string> {
  constructor(private msg: { id: string; preview: string; associatedFaces?: number[]; associatedEdges?: number[]; associatedBodies?: number[]; }) {}
  getSelections(): Selections {
    return {
      faces: this.msg.associatedFaces ?? [],
      edges: this.msg.associatedEdges ?? [],
      bodies: this.msg.associatedBodies ?? [],
    };
  }
  getId() { return this.msg.id; }
  getName() { return `Message: ${this.msg.preview}`; }
}
