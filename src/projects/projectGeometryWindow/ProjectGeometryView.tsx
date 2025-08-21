// ProjectGeometryViewer.tsx - SIMPLIFIED ARCHITECTURE
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
  //   isLoading: boolean,32
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

  });
  // Returns: {
  //   // Current state
  //   selectedFaces: Set<number>,
  //   selectedEdges: Set<number>,
  //   selectedBodies: Set<number>,
  //   hoveredElement: { id: number, type: 'face'|'edge'|'body' } | null,
  //   mode: 'face' | 'edge' | 'body',
  //   
  //   // Event handlers (these update state and log if mappings available)
  //   onElementClick: (element: { id: number, type: 'face'|'edge'|'body' }) => void,
  //   onElementHover: (element: { id: number, type: 'face'|'edge'|'body' } | null) => void,
  //   onModeChange: (mode: 'face'|'edge'|'body') => void,
  //   onClearAll: () => void,
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
    
    // Selection state to visualize
    selectedFaces: selectionState.selectedFaces,
    selectedEdges: selectionState.selectedEdges,
    selectedBodies: selectionState.selectedBodies,
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
  // - Automatically updates highlights when selection props change
  // - Handles all rendering internally
  // - No external control needed!

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
  // Note: This hook internally:
  // - Converts mouse coordinates to VTK coordinates
  // - Queries VTK for what's under cursor
  // - Calls appropriate selection handlers
  // - Handles keyboard shortcuts

  // ==================== LEVEL 6: Persistence ====================
  const selectionPersistence = useSelectionPersistenceHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version,
    getSnapshot: selectionState.getSnapshot,
    loadSnapshot: selectionState.loadSnapshot,
  });
  // Returns: {
  //   save: () => Promise<void>,
  //   load: () => Promise<void>,
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

  const handCalcSelectionSync = useHandCalcSelectionSyncHook({
    selectedInstance: handCalcInstances.selectedInstance,
    selectedIndex: handCalcInstances.selectedIndex,
    getSnapshot: selectionState.getSnapshot,
    loadSnapshot: selectionState.loadSnapshot,
    save: selectionPersistence.save,
  });
  // Returns: {
  //   syncToInstance: () => void,
  //   loadFromInstance: (instanceId: string) => void,
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

  // ==================== AUTO-SAVE ====================
  useEffect(() => {
    if (projectFiles.folderName) {
      selectionPersistence.save();
    }
  }, [
    selectionState.selectedFaces,
    selectionState.selectedEdges,
    selectionState.selectedBodies,
    handCalcConnections.connections
  ]);

  // ==================== LOAD MAPPINGS ====================
  useEffect(() => {
    if (projectFiles.isReady && !geometryMappings.isMappingsReady) {
      geometryMappings.loadMappings();
    }
  }, [projectFiles.isReady]);

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
        mode={selectionState.mode}
        hoveredId={selectionState.hoveredElement?.id || null}
      />

      <RightSidebarContainer $isCollapsed={rightSidebarController.isCollapsed}>
        <RightSidebar {...rightSidebarController} />
      </RightSidebarContainer>
    </MainContainer>
  );
};