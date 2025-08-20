// ProjectGeometryViewer.tsx - REFACTORED WITH BETTER SEPARATION OF CONCERNS
const ProjectGeometryViewer: React.FC = () => {
  // Core refs that don't trigger re-renders
  const vtkContainerRef = useRef<HTMLDivElement>(null);
  
  // ==================== LEVEL 1: Core Context ====================
  // Pure project metadata and file management
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

  // ==================== LEVEL 2A: Raw Data Processing ====================
  // Processes raw geometry files into VTK polyData (no lookup logic)
  const polyDataProcessing = usePolyDataProcessingHook({
    files: projectFiles.files,
    isReady: projectFiles.isReady
  });
  // Returns: {
  //   polyData: { faces, edges, bodies },
  //   isProcessed: boolean,
  //   processingError: string | null
  // }

  // Handles ID-to-cell lookup tables (separate concern)
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

  // Handles STEP to mechanical/discovery mappings (separate concern)
  const geometryMappings = useGeometryMappingsHook({
    geometryInfo: projectFiles.geometryInfo,
    isReady: projectFiles.isReady
  });
  // Returns: {
  //   getStepToMechanical: (stepId: string) => string | null,
  //   getStepToDiscovery: (stepId: string) => string | null,
  //   getMechanicalToStep: (mechId: string) => string | null,
  //   getDiscoveryToStep: (discId: string) => string | null,
  //   isMappingsReady: boolean
  // }

  // ==================== LEVEL 2B: ML Inference ====================
  // Pure ML inference management
  const inferenceEngine = useInferenceEngineHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version
  });
  // Returns: {
  //   runInference: () => Promise<void>,
  //   checkStatus: () => Promise<void>,
  //   isRunning: boolean,
  //   isComplete: boolean,
  //   error: string | null
  // }

  // Handles inference results and labeling
  const inferenceResults = useInferenceResultsHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version,
    isInferenceComplete: inferenceEngine.isComplete
  });
  // Returns: {
  //   getElementLabels: (elementId: number) => string[],
  //   getBestLabel: (elementId: number) => string | null,
  //   getConfidenceScore: (elementId: number, label: string) => number,
  //   isResultsReady: boolean
  // }

  // ==================== LEVEL 3: VTK Rendering ====================
  // Complete VTK management (scene, actors, rendering)
  const vtkRenderer = useVTKRendererHook({
    container: vtkContainerRef,
    polyData: polyDataProcessing.polyData,
    isReady: polyDataProcessing.isProcessed
  });
  // Returns: {
  //   // VTK Objects (lazy evaluation)
  //   getRenderer: () => vtkRenderer,
  //   getRenderWindow: () => vtkRenderWindow,
  //   getPicker: () => vtkCellPicker,
  //   getFaceActor: () => vtkActor,
  //   getEdgeActor: () => vtkActor,
  //   getBodyActor: () => vtkActor,
  //   
  //   // VTK Operations
  //   triggerRender: () => void,
  //   resetCamera: () => void,
  //   updateActorVisibility: (type: 'face'|'edge'|'body', visible: boolean) => void,
  //   updateActorColor: (type: 'face'|'edge'|'body', color: [number,number,number]) => void,
  //   
  //   // State
  //   isInitialized: boolean,
  //   areActorsReady: boolean
  // }

  // ==================== LEVEL 4: Selection State Management ====================
  // Pure selection state (no visualization logic)
  const selectionState = useSelectionStateHook();
  // Returns: {
  //   getSelectedFaces: () => Set<number>,
  //   getSelectedEdges: () => Set<number>,
  //   getSelectedBodies: () => Set<number>,
  //   getHoveredId: () => number | null,
  //   getSelectionMode: () => 'face' | 'edge' | 'body',
  //   toggleFaceSelection: (faceId: number) => void,
  //   toggleEdgeSelection: (edgeId: number) => void,
  //   toggleBodySelection: (bodyId: number) => void,
  //   setHovered: (id: number | null) => void,
  //   setSelectionMode: (mode: 'face' | 'edge' | 'body') => void,
  //   clearAllSelections: () => void,
  //   loadSelections: (selections: SelectionData) => void,
  //   getSelectionCount: () => number
  // }

  // Manages selection persistence
  const selectionPersistence = useSelectionPersistenceHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version,
    getSelections: () => ({
      faces: selectionState.getSelectedFaces(),
      edges: selectionState.getSelectedEdges(),
      bodies: selectionState.getSelectedBodies()
    }),
    onSelectionsLoaded: selectionState.loadSelections
  });
  // Returns: {
  //   saveSelections: () => Promise<void>,
  //   loadSelections: () => Promise<void>,
  //   autoSave: boolean,
  //   setAutoSave: (enabled: boolean) => void
  // }

  // ==================== LEVEL 5: Selection Visualization ====================
  // Handles visual feedback for selections (uses methods, not raw data)
  const selectionVisualization = useSelectionVisualizationHook({
    // VTK methods
    getRenderer: vtkRenderer.getRenderer,
    getRenderWindow: vtkRenderer.getRenderWindow,
    getFaceActor: vtkRenderer.getFaceActor,
    getEdgeActor: vtkRenderer.getEdgeActor,
    getBodyActor: vtkRenderer.getBodyActor,
    updateActorColor: vtkRenderer.updateActorColor,
    triggerRender: vtkRenderer.triggerRender,
    
    // Lookup methods (not raw tables!)
    getCellsForFace: lookupTables.getCellsForFace,
    getCellsForEdge: lookupTables.getCellsForEdge,
    getCellsForBody: lookupTables.getCellsForBody,
    
    // Selection methods
    getSelectedFaces: selectionState.getSelectedFaces,
    getSelectedEdges: selectionState.getSelectedEdges,
    getSelectedBodies: selectionState.getSelectedBodies,
    getHoveredId: selectionState.getHoveredId,
    getSelectionMode: selectionState.getSelectionMode
  });
  // Returns: {
  //   updateSelectionDisplay: () => void,
  //   updateHoverDisplay: () => void
  // }

  // ==================== LEVEL 6: Interaction Handling ====================
  // Handles mouse/keyboard input (calls methods from other hooks)
  const interactionHandlers = useInteractionHandlersHook({
    // VTK methods
    getPicker: vtkRenderer.getPicker,
    getRenderer: vtkRenderer.getRenderer,
    
    // Lookup methods
    getFaceIdForCell: lookupTables.getFaceIdForCell,
    getEdgeIdForCell: lookupTables.getEdgeIdForCell,  
    getBodyIdForCell: lookupTables.getBodyIdForCell,
    
    // Selection methods
    toggleFaceSelection: selectionState.toggleFaceSelection,
    toggleEdgeSelection: selectionState.toggleEdgeSelection,
    toggleBodySelection: selectionState.toggleBodySelection,
    setHovered: selectionState.setHovered,
    getSelectionMode: selectionState.getSelectionMode,
    
    // Visualization methods
    updateSelectionDisplay: selectionVisualization.updateSelectionDisplay,
    updateHoverDisplay: selectionVisualization.updateHoverDisplay
  });
  // Returns: {
  //   handleMouseMove: (event: MouseEvent) => void,
  //   handleClick: (event: MouseEvent) => void,
  //   handleKeyPress: (event: KeyboardEvent) => void
  // }

  // ==================== LEVEL 7A: HandCalc Mode ====================
  // Pure HandCalc instance management
  const handCalcInstances = useHandCalcInstancesHook({
    projectId: projectFiles.projectID,
    version: projectFiles.version,
    enabled: sidebarMode === 'handcalc'
  });
  // Returns: {
  //   getInstances: () => HandCalcInstance[],
  //   getSelectedIndex: () => number,
  //   getSelectedInstance: () => HandCalcInstance | null,
  //   createInstance: (data: HandCalcData) => void,
  //   deleteInstance: (id: string) => void,
  //   selectInstance: (index: number) => void,
  //   navigateNext: () => void,
  //   navigatePrev: () => void,
  //   isCreating: boolean,
  //   pendingData: HandCalcData | null
  // }

  // Manages connections between HandCalc variables
  const handCalcConnections = useHandCalcConnectionsHook({
    getInstances: handCalcInstances.getInstances,
    enabled: sidebarMode === 'handcalc'
  });
  // Returns: {
  //   getConnections: () => VariableConnection[],
  //   createConnection: (from: VariableRef, to: VariableRef) => void,
  //   deleteConnection: (connectionId: string) => void,
  //   getConnectionsForVariable: (instanceId: string, variable: string) => VariableConnection[],
  //   isInSelectionMode: boolean,
  //   setSelectionMode: (enabled: boolean) => void
  // }

  // Links HandCalc instances with geometry selections
  const handCalcGeometryLink = useHandCalcGeometryLinkHook({
    getSelectedInstance: handCalcInstances.getSelectedInstance,
    
    // Selection methods (not raw data)
    getSelectedFaces: selectionState.getSelectedFaces,
    getSelectedEdges: selectionState.getSelectedEdges,
    getSelectedBodies: selectionState.getSelectedBodies,
    loadSelections: selectionState.loadSelections,
    
    // Persistence methods
    saveSelections: selectionPersistence.saveSelections,
    loadSelections: selectionPersistence.loadSelections
  });
  // Returns: {
  //   linkCurrentSelection: () => void,
  //   loadInstanceSelection: (instanceId: string) => void,
  //   hasLinkedSelection: (instanceId: string) => boolean
  // }

  // ==================== LEVEL 7B: UI State Management ====================
  // Pure UI state hooks
  const leftSidebarState = useLeftSidebarStateHook({
    mode: sidebarMode,
    // HandCalc methods
    getInstances: handCalcInstances.getInstances,
    getSelectedIndex: handCalcInstances.getSelectedIndex,
    selectInstance: handCalcInstances.selectInstance,
    // Connection methods
    getConnections: handCalcConnections.getConnections,
    isInSelectionMode: handCalcConnections.isInSelectionMode
  });
  // Returns: {
  //   getSidebarData: () => SidebarData,
  //   handleInstanceClick: (index: number) => void,
  //   handleVariableClick: (instanceId: string, variable: string) => void,
  //   isInputFocused: boolean
  // }

  const rightSidebarState = useRightSidebarStateHook();
  // Returns: {
  //   isCollapsed: boolean,
  //   toggle: () => void,
  //   collapse: () => void,
  //   expand: () => void
  // }

  // ==================== EFFECTS SETUP ====================
  // Wire up interaction handlers to VTK
  useEffect(() => {
    if (!vtkRenderer.isInitialized) return;

    const renderer = vtkRenderer.getRenderer();
    if (!renderer) return;

    const interactor = renderer.getInteractor();
    if (interactor) {
      // Note: We're calling methods, not passing raw data
      interactor.onMouseMove(interactionHandlers.handleMouseMove);
      interactor.onLeftButtonPress(interactionHandlers.handleClick);
    }

    return () => {
      // Cleanup
    };
  }, [vtkRenderer.isInitialized, interactionHandlers.handleMouseMove, interactionHandlers.handleClick]);

  // Auto-save when connections change
  useEffect(() => {
    if (projectFiles.folderName && sidebarMode === 'handcalc') {
      selectionPersistence.saveSelections();
    }
  }, [handCalcConnections.getConnections()]);

  // ==================== MEMOIZED COMPONENTS ====================
  const leftSidebar = useMemo(() => (
    <LeftSidebar
      sidebarData={leftSidebarState.getSidebarData()}
      onInstanceClick={leftSidebarState.handleInstanceClick}
      onVariableClick={leftSidebarState.handleVariableClick}
      isInputFocused={leftSidebarState.isInputFocused}
    />
  ), [
    leftSidebarState.getSidebarData(), // This handles all internal dependencies
    leftSidebarState.isInputFocused
  ]);

  const vtkViewer = useMemo(() => (
    <VTKViewer
      vtkContainerRef={vtkContainerRef}
      isLoading={projectFiles.isLoading}
      error={projectFiles.error}
      selectionCount={selectionState.getSelectionCount()}
      selectionMode={selectionState.getSelectionMode()}
      hoveredId={selectionState.getHoveredId()}
    />
  ), [
    projectFiles.isLoading,
    projectFiles.error,
    selectionState.getSelectionCount(),
    selectionState.getSelectionMode(),
    selectionState.getHoveredId()
  ]);

  // ==================== LOADING STATE ====================
  if (projectFiles.isLoading || !projectFiles.isReady) {
    return <div>Loading...</div>;
  }

  // ==================== MAIN RENDER ====================
  return (
    <MainContainer>
      <LeftSidebarContainer>
        {leftSidebar}
      </LeftSidebarContainer>

      {vtkViewer}

      <RightSidebarContainer 
        $isCollapsed={rightSidebarState.isCollapsed}
      >
        {/* Right sidebar content */}
      </RightSidebarContainer>
    </MainContainer>
  );
};

export default ProjectGeometryViewer;