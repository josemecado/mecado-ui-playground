// ProjectGeometryViewer.tsx - UPDATED ARCHITECTURE WITH FOCUS MANAGEMENT
const ProjectGeometryViewer: React.FC = () => {
  // Core refs that don't trigger re-renders
  const vtkContainerRef = useRef<HTMLDivElement>(null);
  
  // ==================== LEVEL 1: Core Context ====================
  const projectFiles = useProjectFilesHook();
  // Returns: {
  //   projectID: string,
  //   version: number,
  //   files: { facesFile, edgesFile, bodiesFile },
  //   geometryInfo: GeometryJson,
  //   folderName: string,
  //   isLoading: boolean,
  //   error: string | null,
  //   isReady: boolean,
  //   reload: () => void
  // }

  // ==================== LEVEL 2: Data Processing ====================
  const polyDataProcessing = usePolyDataProcessingHook({
    files: projectFiles.files,
    isReady: projectFiles.isReady
  });
  // Returns: {
  //   polyData: { faces, edges, bodies },
  //   isProcessed: boolean,
  //   processingError: string | null
  // }

  const lookupTables = useLookupTablesHook({
    polyData: polyDataProcessing.polyData,
    isReady: polyDataProcessing.isProcessed
  });
  // Returns: {
  //   getCellsForFace: (faceId: number) => number[],
  //   getCellsForEdge: (edgeId: number) => number[],
  //   getCellsForBody: (bodyId: number) => number[],
  //   getFaceIdForCell: (cellId: number) => number | null,
  //   getEdgeIdForCell: (cellId: number) => number | null,
  //   getBodyIdForCell: (cellId: number) => number | null,
  //   isTablesReady: boolean
  // }

  const geometryMappings = useGeometryMappingsHook({
    geometryInfo: projectFiles.geometryInfo,
  });
  // Returns: {
  //   isMappingsReady: boolean,
  //   loadMappings: () => Promise<void>,
  //   toMechanicalId: (stepType: 'face'|'edge'|'body', stepId: number) => string | null,
  //   toDiscoveryId: (stepType: 'face'|'edge'|'body', stepId: number) => string | null,
  // }

  const mlInference = useMLInferenceHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version
  });
  // Returns: {
  //   runInference: () => Promise<void>,
  //   isRunning: boolean,
  //   isReady: boolean,
  //   getElementLabels: (elementId: number) => string[],
  //   getBestLabel: (elementId: number) => string | null,
  //   getConfidenceScore: (elementId: number, label: string) => number,
  // }

  // ==================== LEVEL 3: Selection State (Single Source of Truth) ====================
  const selectionState = useSelectionStateHook({
    // Optional: provide mapping functions for debug logging
    debugMappings: geometryMappings.isMappingsReady ? {
      toMechanicalId: geometryMappings.toMechanicalId,
      toDiscoveryId: geometryMappings.toDiscoveryId,
    } : undefined
  });
  // Returns: {
  //   // Active selections (user clicking)
  //   selectedFaces: Set<number>,
  //   selectedEdges: Set<number>,
  //   selectedBodies: Set<number>,
  //   
  //   // Focused geometry (from external source like HandCalc)
  //   focusedFaces: Set<number>,
  //   focusedEdges: Set<number>,
  //   focusedBodies: Set<number>,
  //   
  //   // Hover state
  //   hoveredElement: { id: number, type: 'face'|'edge'|'body' } | null,
  //   mode: 'face' | 'edge' | 'body',
  //   
  //   // Event handlers (these update state and log if mappings available)
  //   onElementClick: (element: { id: number, type: 'face'|'edge'|'body' }) => void,
  //   onElementHover: (element: { id: number, type: 'face'|'edge'|'body' } | null) => void,
  //   onModeChange: (mode: 'face'|'edge'|'body') => void,
  //   onClearAll: () => void,
  //   
  //   // Focus management (NEW)
  //   setFocusedGeometry: (selections: { faces: number[], edges: number[], bodies: number[] }) => void,
  //   clearFocusedGeometry: () => void,
  //   
  //   // Bulk operations
  //   loadSnapshot: (snapshot: SelectionSnapshot) => void,
  //   getSnapshot: () => SelectionSnapshot,
  // }

  // ==================== LEVEL 4: VTK Renderer (Fully Autonomous) ====================
  const vtkRenderer = useVTKRendererHook({
    container: vtkContainerRef,
    polyData: polyDataProcessing.polyData,
    lookupTables: lookupTables, // Needs these for picking
    isReady: polyDataProcessing.isProcessed && lookupTables.isTablesReady,
    
    // Active selections (user clicking) - rendered in SELECTION_COLOR
    selectedFaces: selectionState.selectedFaces,
    selectedEdges: selectionState.selectedEdges,
    selectedBodies: selectionState.selectedBodies,
    
    // Focused geometry (from external source) - rendered in FOCUS_COLOR
    focusedFaces: selectionState.focusedFaces,
    focusedEdges: selectionState.focusedEdges,
    focusedBodies: selectionState.focusedBodies,
    
    hoveredElement: selectionState.hoveredElement,
    displayMode: selectionState.mode,
  });
  // Returns: {
  //   // Query what's at a position
  //   getElementAt: (x: number, y: number) => { id: number, type: 'face'|'edge'|'body' } | null,
  //   
  //   // Camera
  //   resetCamera: () => void,
  //   
  //   // State
  //   isInitialized: boolean,
  // }
  // Note: This hook internally:
  // - Creates and manages all VTK objects
  // - Automatically updates highlights when selection OR focus props change
  // - Renders selected geometry in SELECTION_COLOR (e.g., blue)
  // - Renders focused geometry in FOCUS_COLOR (e.g., yellow/gold)
  // - Handles all rendering internally

  // ==================== LEVEL 5: Interaction Manager ====================
  const interactionManager = useInteractionManagerHook({
    // Query function from VTK
    getElementAt: vtkRenderer.getElementAt,
    isVtkReady: vtkRenderer.isInitialized,
    
    // Selection handlers
    onElementClick: selectionState.onElementClick,
    onElementHover: selectionState.onElementHover,
    onModeChange: selectionState.onModeChange,
    onClearAll: selectionState.onClearAll,
    
    // App state for determining if interactions are enabled
    currentMode: selectionState.mode,
    appMode: sidebarMode,
    isSelectionEnabled: () => {
      if (sidebarMode === 'fea') return navState?.isInSubheading || false;
      if (sidebarMode === 'handcalc') return handCalcInstances.instances.length > 0;
      return false;
    }
  });
  // Returns: {
  //   // Simple event handlers to wire up
  //   handleMouseMove: (event: MouseEvent) => void,
  //   handleClick: (event: MouseEvent) => void,
  //   handleKeyPress: (event: KeyboardEvent) => void,
  // }

  // ==================== LEVEL 6: Generic Geometry Focus Manager ====================
  // This hook manages focusing on any object that implements GeometrySelectable interface
  const geometryFocusManager = useGeometryFocusManagerHook({
    setFocusedGeometry: selectionState.setFocusedGeometry,
    clearFocusedGeometry: selectionState.clearFocusedGeometry,
  });
  // Returns: {
  //   // Focus on any GeometrySelectable object
  //   focusOn: (selectable: GeometrySelectable | null) => void,
  //   
  //   // Get currently focused item
  //   getFocusedItem: () => GeometrySelectable | null,
  // }
  // 
  // GeometrySelectable interface:
  // interface GeometrySelectable {
  //   getSelections(): { faces: number[], edges: number[], bodies: number[] }
  //   getId?(): string
  //   getName?(): string
  // }

  // ==================== LEVEL 7: HandCalc Mode ====================
  const handCalcInstances = useHandCalcInstancesHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version,
    enabled: sidebarMode === 'handcalc'
  });
  // Returns: {
  //   instances: HandCalcInstance[],
  //   selectedIndex: number,
  //   selectedInstance: HandCalcInstance | null,
  //   create: (data: HandCalcData) => void,
  //   delete: (id: string) => void,
  //   select: (index: number) => void,
  //   navigateNext: () => void,
  //   navigatePrev: () => void,
  // }

  const handCalcConnections = useHandCalcConnectionsHook({
    instances: handCalcInstances.instances,
    enabled: sidebarMode === 'handcalc'
  });
  // Returns: {
  //   connections: VariableConnection[],
  //   connectionState: 'idle' | 'selecting_first' | 'selecting_second',
  //   startConnection: (variable: VariableRef) => void,
  //   completeConnection: (variable: VariableRef) => void,
  //   cancelConnection: () => void,
  //   deleteConnection: (connectionId: string) => void,
  // }

  // ==================== LEVEL 8: UI Controllers ====================
  const leftSidebarController = useLeftSidebarControllerHook({
    mode: sidebarMode,
    instances: handCalcInstances.instances,
    selectedIndex: handCalcInstances.selectedIndex,
    connections: handCalcConnections.connections,
    selectInstance: handCalcInstances.select,
    startConnection: handCalcConnections.startConnection,
    completeConnection: handCalcConnections.completeConnection,
  });

  const rightSidebarController = useRightSidebarControllerHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version,
  });

  // ==================== FOCUS MANAGEMENT - HandCalc Instance Selection ====================
  // When the selected HandCalc instance changes, update the focused geometry
  // This creates an adapter that implements GeometrySelectable and passes it to the focus manager
  useEffect(() => {
    if (sidebarMode === 'handcalc' && handCalcInstances.selectedInstance) {
      // Create adapter that wraps HandCalcInstance to implement GeometrySelectable interface
      const adapter = new HandCalcInstanceAdapter(handCalcInstances.selectedInstance);
      // Focus manager will call adapter.getSelections() and update focused geometry
      geometryFocusManager.focusOn(adapter);
    } else if (sidebarMode === 'handcalc' && !handCalcInstances.selectedInstance) {
      // No instance selected, clear focus
      geometryFocusManager.focusOn(null);
    }
  }, [
    handCalcInstances.selectedInstance,
    sidebarMode,
    geometryFocusManager.focusOn
  ]);

  // Clear focus when switching away from handcalc mode
  useEffect(() => {
    if (sidebarMode !== 'handcalc') {
      geometryFocusManager.focusOn(null);
    }
  }, [sidebarMode, geometryFocusManager.focusOn]);

  // ==================== FUTURE: Message Selection Example ====================
  // When implementing message selection, you would add:
  // useEffect(() => {
  //   if (selectedMessage && selectedMessage.hasGeometry) {
  //     const adapter = new MessageAdapter(selectedMessage);
  //     geometryFocusManager.focusOn(adapter);
  //   }
  // }, [selectedMessage]);

  // ==================== WIRE UP INTERACTIONS ====================
  useEffect(() => {
    if (!vtkRenderer.isInitialized) return;

    const container = vtkContainerRef.current;
    if (!container) return;

    // Add event listeners
    container.addEventListener('mousemove', interactionManager.handleMouseMove);
    container.addEventListener('click', interactionManager.handleClick);
    document.addEventListener('keydown', interactionManager.handleKeyPress);

    return () => {
      container.removeEventListener('mousemove', interactionManager.handleMouseMove);
      container.removeEventListener('click', interactionManager.handleClick);
      document.removeEventListener('keydown', interactionManager.handleKeyPress);
    };
  }, [vtkRenderer.isInitialized, interactionManager]);

  // ==================== AUTO-SAVE (if needed elsewhere) ====================
  useEffect(() => {
    if (projectFiles.folderName && handCalcConnections.connections) {
      // Save connections or other data as needed
      // This could call a persistence hook if needed for other purposes
    }
  }, [handCalcConnections.connections]);

  // ==================== LOAD MAPPINGS ====================
  useEffect(() => {
    if (projectFiles.isReady && !geometryMappings.isMappingsReady) {
      geometryMappings.loadMappings();
    }
  }, [projectFiles.isReady, geometryMappings.isMappingsReady]);

  // ==================== LOADING STATE ====================
  if (projectFiles.isLoading || !projectFiles.isReady) {
    return <div>Loading...</div>;
  }

  // ==================== MAIN RENDER ====================
  return (
    <MainContainer>
      <LeftSidebarContainer>
        <LeftSidebar {...leftSidebarController} />
      </LeftSidebarContainer>

      <VTKViewer
        ref={vtkContainerRef}
        isLoading={projectFiles.isLoading}
        error={projectFiles.error}
        selectionCount={
          selectionState.selectedFaces.size +
          selectionState.selectedEdges.size +
          selectionState.selectedBodies.size
        }
        focusCount={
          selectionState.focusedFaces.size +
          selectionState.focusedEdges.size +
          selectionState.focusedBodies.size
        }
        mode={selectionState.mode}
        hoveredId={selectionState.hoveredElement?.id || null}
      />

      <RightSidebarContainer $isCollapsed={rightSidebarController.isCollapsed}>
        <RightSidebar {...rightSidebarController} />
      </RightSidebarContainer>
    </MainContainer>
  );
};

// ==================== ADAPTER CLASSES ====================
// These implement the GeometrySelectable interface for different domain objects

class HandCalcInstanceAdapter implements GeometrySelectable {
  constructor(private instance: HandCalcInstance) {}
  
  getSelections() {
    return {
      faces: this.instance.selectedFaces || [],
      edges: this.instance.selectedEdges || [],
      bodies: this.instance.selectedBodies || []
    };
  }
  
  getId() { return this.instance.id; }
  getName() { return this.instance.name; }
}

// Future: Adapter for messages
class MessageAdapter implements GeometrySelectable {
  constructor(private message: ChatMessage) {}
  
  getSelections() {
    return {
      faces: this.message.associatedFaces || [],
      edges: this.message.associatedEdges || [],
      bodies: this.message.associatedBodies || []
    };
  }
  
  getId() { return this.message.id; }
  getName() { return `Message: ${this.message.preview}` }
}