// ProjectGeometryViewer.tsx - REFACTORED ARCHITECTURE
const ProjectGeometryViewer: React.FC = () => {
 // Core refs that don't trigger re-renders
 const vtkContainerRef = useRef<HTMLDivElement>(null);
 
 // ==================== LEVEL 1: Core Context ====================
 // Manages project files, loading, and metadata
 const projectContext = useProjectContextViewModel();
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
 // Processes geometry files into VTK-ready data
 const geometryData = useGeometryDataViewModel({
   files: projectContext.files,
   isReady: projectContext.isReady
 });
 // Returns: {
 //   polyData: { faces, edges, bodies },
 //   lookupTables: {
 //     faceIdToCells, edgeIdToCells, bodyIdToCells,
 //     cellToFaceId, cellToEdgeId, cellToBodyId
 //   },
 //   mappings: { stepToMechanical, stepToDiscovery },
 //   isProcessed: boolean
 // }

 // Inference system (parallel to geometry data)
 const inference = useInferenceViewModel({
   projectId: projectContext.projectID,
   version: projectContext.version
 });
 // Returns: {
 //   inferenceMapping: InferenceMapping | null,
 //   isInferenceReady: boolean,
 //   isRunning: boolean,
 //   runInference: () => Promise<void>,
 //   checkStatus: () => Promise<void>
 // }

 // ==================== LEVEL 3: VTK Rendering ====================
 // Manages VTK scene and actors (no React state for VTK objects!)
 const vtkRenderer = useVTKRendererViewModel({
   container: vtkContainerRef,
   polyData: geometryData.polyData,
   isReady: geometryData.isProcessed
 });
 // Returns: {
 //   getRenderer: () => vtkRenderer,
 //   getRenderWindow: () => vtkRenderWindow,
 //   getActors: () => { face, edge, body },
 //   getPicker: () => vtkCellPicker,
 //   triggerRender: () => void,
   //   resetCamera: () => void,
 //   isInitialized: boolean
 // }

 // ==================== LEVEL 4: Selection Management ====================
 // Pure state management for selections (decoupled from visualization)
 const selectionState = useSelectionStateViewModel();
 // Returns: {
 //   getSelections: () => { faces: Set, edges: Set, bodies: Set },
 //   hoveredId: number | null,
 //   mode: 'face' | 'edge' | 'body',
 //   toggleSelection: (type, id) => void,
 //   clearAll: () => void,
 //   setMode: (mode) => void,
 //   setHovered: (id) => void,
 //   selectionCount: number, // For UI display only
 //   loadSelections: (selections) => void
 // }

 // ==================== LEVEL 5: Visualization Layer ====================
 // Bridges selection state with VTK rendering
 const selectionViz = useSelectionVisualizationViewModel({
   getRenderer: vtkRenderer.getRenderer,
   getRenderWindow: vtkRenderer.getRenderWindow,
   getActors: vtkRenderer.getActors,
   getPicker: vtkRenderer.getPicker,
   lookupTables: geometryData.lookupTables,
   selections: selectionState.getSelections,
   hoveredId: selectionState.hoveredId,
   mode: selectionState.mode,
   onHover: selectionState.setHovered,
   onSelect: selectionState.toggleSelection,
   triggerRender: vtkRenderer.triggerRender
 });
 // Returns: {
 //   handleMouseMove: (event) => void,
 //   handleClick: (event) => void,
 //   updateDisplay: () => void
 // }

 // ==================== HAND CALC MODE ====================
 const handCalcInstances = useHandCalcInstancesViewModel({
   projectId: projectContext.projectID,
   version: projectContext.version,
   enabled: sidebarMode === 'handcalc',
   selections: selectionState.getSelections(),
   onSelectionLoad: selectionState.loadSelections
 });
 // Returns: {
 //   instances: HandCalcInstance[],
 //   selectedIndex: number,
 //   isCreating: boolean,
 //   pendingInstanceData: {...} | null,
 //   createInstance: (data) => void,
 //   deleteInstance: (id) => void,
 //   navigate: (direction: 'next' | 'prev') => void,
 //   selectInstance: (index) => void,
 //   confirmName: () => void,
 //   cancelCreation: () => void,
 //   markForDeletion: () => void,
 //   clearDeletionMark: () => void,
 //   saveSelection: () => void,
 //   newInstanceName: string,
 //   setNewInstanceName: (name) => void,
 //   shouldFocusInput: boolean
 // }

 const connectionGraph = useConnectionGraphViewModel({
   instances: handCalcInstances.instances,
   enabled: sidebarMode === 'handcalc'
 });
 // Returns: {
 //   connections: HandCalcInstanceVariableConnection[],
 //   selectedVariable: { instanceId, variableSymbol } | null,
 //   selectionMode: boolean,
 //   handleVariableClick: (instanceId, variableSymbol) => void,
 //   deleteConnection: (connectionId) => void,
 //   deleteVariable: (connectionId, instanceId, variableSymbol) => void,
 //   clearSelection: () => void
 // }

 // Create instance from pinned equations
 const pinnedHandCalcs = usePinnedHandCalcsViewModel({
   projectId: projectContext.projectID,
   version: projectContext.version,
   selectedInstanceParentId: handCalcInstances.instances[handCalcInstances.selectedIndex]?.parentHandCalcId
 });
 // Returns: {
 //   pinnedEquations: HandCalc[],
 //   createInstanceFromPinned: (pinnedId) => void,
 //   isLoading: boolean
 // }


 // ==================== UI STATE ====================
 const rightSidebar = useRightSidebarViewModel();
 // Returns: {
 //   isCollapsed: boolean,
 //   toggle: () => void,
 //   collapse: () => void,
 //   expand: () => void
 // }

 // ==================== MEMOIZED COMPONENTS ====================
 // Left sidebar - only re-renders when its specific data changes
 const leftSidebar = useMemo(() => (
   <MathJaxContext config={jaxConfig}>
     {sidebarMode === 'handcalc' ? (
       <HandCalcLeftSidebar
         handCalcs={handCalcInstances.instances}
         selectedHandCalcIndex={handCalcInstances.selectedIndex}
         newHandCalcName={handCalcInstances.newInstanceName}
         setNewHandCalcName={handCalcInstances.setNewInstanceName}
         confirmHandCalcName={handCalcInstances.confirmName}
         onHandCalcClick={handCalcInstances.selectInstance}
         shouldFocusInput={handCalcInstances.shouldFocusInput}
         connectionState={{
           connections: connectionGraph.connections,
           selectedVariable: connectionGraph.selectedVariable,
           selectionMode: connectionGraph.selectionMode
         }}
         onVariableClick={connectionGraph.handleVariableClick}
         onConnectionDelete={connectionGraph.deleteConnection}
         onVariableDelete={connectionGraph.deleteVariable}
         isCreatingInstance={handCalcInstances.isCreating}
         pendingInstanceData={handCalcInstances.pendingInstanceData}
       />
     ) : (
       <FEALeftSidebar
         headings={feaNavigation.headings}
         navState={feaNavigation.navState}
         newSubheadingName={feaNavigation.newSubheadingName}
         setNewSubheadingName={feaNavigation.setNewSubheadingName}
         confirmSubheadingName={feaNavigation.confirmSubheadingName}
         folderName={projectContext.folderName}
         facesFileName={projectContext.files.facesFile?.name}
         edgesFileName={projectContext.files.edgesFile?.name}
         onHeadingClick={feaNavigation.navigateToHeading}
         onSubheadingClick={feaNavigation.navigateToSubheading}
       />
     )}
   </MathJaxContext>
 ), [
   sidebarMode,
   handCalcInstances.instances,
   handCalcInstances.selectedIndex,
   handCalcInstances.newInstanceName,
   handCalcInstances.isCreating,
   handCalcInstances.pendingInstanceData,
   connectionGraph.connections,
   connectionGraph.selectedVariable,
   connectionGraph.selectionMode,
   feaNavigation.headings,
   feaNavigation.navState,
   feaNavigation.newSubheadingName
 ]);

 // VTK Viewer - only re-renders when display-relevant props change
 const vtkViewer = useMemo(() => (
   <VTKViewer
     vtkContainerRef={vtkContainerRef}
     isLoading={projectContext.isLoading}
     error={projectContext.error}
     viewerState={{
       mode: selectionState.mode,
       hoveredId: selectionState.hoveredId,
       selectedFaces: selectionState.getSelections().faces,
       selectedEdges: selectionState.getSelections().edges,
       selectedBodies: selectionState.getSelections().bodies
     }}
     navState={feaNavigation.navState}
     onModeToggle={() => selectionState.setMode(
       selectionState.mode === 'face' ? 'edge' : 
       selectionState.mode === 'edge' ? 'body' : 'face'
     )}
     handCalcsCount={handCalcInstances.instances.length}
     sidebarMode={sidebarMode}
     inferenceMapping={inference.inferenceMapping}
     getElementLabels={getElementLabels}
     getBestLabel={getBestLabel}
     getConfidenceColor={getConfidenceColor}
     geometryData={projectContext.geometryInfo}
   />
 ), [
   projectContext.isLoading,
   projectContext.error,
   projectContext.geometryInfo,
   selectionState.mode,
   selectionState.hoveredId,
   selectionState.selectionCount, // This triggers re-render on selection change
   feaNavigation.navState,
   handCalcInstances.instances.length,
   sidebarMode,
   inference.inferenceMapping
 ]);

 // Right sidebar - memoized separately
 const rightSidebarContent = useMemo(() => (
   !rightSidebar.isCollapsed && (
     <MathJaxContext config={jaxConfig}>
       <RightSidebarContainer>
         <HandCalcRightSidebar
           projectId={projectContext.projectID}
           projectVersion={projectContext.version}
           selectedInstanceParentId={
             handCalcInstances.instances[handCalcInstances.selectedIndex]?.parentHandCalcId
           }
           handCalcs={handCalcInstances.instances}
           onCreateInstance={async (pinnedId) => {
             await pinnedHandCalcs.createInstanceFromPinned(pinnedId);
             handCalcInstances.createInstance(pinnedHandCalcs.pendingInstanceData);
           }}
           onCollapse={rightSidebar.collapse}
         />
       </RightSidebarContainer>
     </MathJaxContext>
   )
 ), [
   rightSidebar.isCollapsed,
   projectContext.projectID,
   projectContext.version,
   handCalcInstances.instances,
   handCalcInstances.selectedIndex,
   pinnedHandCalcs.pendingInstanceData
 ]);

 // Bottom buttons - rarely change
 const bottomButtons = useMemo(() => (
   <ButtonsContainer>
     <StyledButton
       onClick={inference.runInference}
       disabled={inference.isRunning}
       $backgroundColor="var(--primary-action)"
       $theme={theme}
     >
       {inference.isRunning
         ? "Running Inference..."
         : inference.isInferenceReady
         ? "Re-run Inference"
         : "Run Inference"}
     </StyledButton>

     <StyledButton
       onClick={() => {
         // Save current state before navigating
         if (sidebarMode === 'handcalc') {
           handCalcInstances.saveSelection();
         } else {
           feaNavigation.saveSelection();
         }
         navigation.navigateToChat();
       }}
       $theme={theme}
     >
       Chat viewer :)
     </StyledButton>

     <ThemeToggleButton />
   </ButtonsContainer>
 ), [
   inference.isRunning,
   inference.isInferenceReady,
   theme,
   sidebarMode
 ]);

 // ==================== EFFECTS ====================
 // VTK event handlers setup
 useEffect(() => {
   if (!vtkRenderer.isInitialized) return;

   const renderer = vtkRenderer.getRenderer();
   if (!renderer) return;

   // Set up mouse handlers
   const interactor = renderer.getInteractor();
   if (interactor) {
     interactor.onMouseMove(selectionViz.handleMouseMove);
     interactor.onLeftButtonPress(selectionViz.handleClick);
   }

   return () => {
     // Cleanup if needed
   };
 }, [vtkRenderer.isInitialized, selectionViz.handleMouseMove, selectionViz.handleClick]);

 // Auto-save connections when they change
 useEffect(() => {
   if (projectContext.folderName && sidebarMode === 'handcalc') {
     handCalcInstances.saveSelection();
   }
 }, [connectionGraph.connections]);

 // ==================== LOADING STATE ====================
 if (projectContext.isLoading || !projectContext.isReady) {
   return <div>Loading...</div>;
 }

 // ==================== MAIN RENDER ====================
 return (
   <MainContainer>
     <LeftSidebarContainer>
       {leftSidebar}
       {bottomButtons}
     </LeftSidebarContainer>

     {vtkViewer}

     <CollapsedSidebarButton
       $isCollapsed={rightSidebar.isCollapsed}
       onClick={rightSidebar.toggle}
     >
       <Pin size={16} />
     </CollapsedSidebarButton>

     {rightSidebarContent}
   </MainContainer>
 );
};

export default ProjectGeometryViewer;