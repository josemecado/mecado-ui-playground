import styled from "styled-components";
import { VersionNodeBridge } from "../projects/versionNodes/VersionNodeBridge";
import { GeometryLinkingWireframe } from "../projects/analysisTransfer/components/AnalysisTransferWizard";
import SideMenu from "../projects/projectChatWindow/SideMenu/SidePanelMenu";

export default function ProjectChatWindow() {
  return (
    <Container>
      {/* <SideMenu /> */}
      {/* <SideMenu
        projectId={""}
        projectVersions={[]}
        projectVersion={0}
        uploadedFilesRefreshKey={0}
        generatedDocsRefreshKey={0}
        pinnedHandCalcs={[]}
        isCollapsed={false}
        onToggleCollapse={() => {}}
        currentView={"chat"}
        onViewChange={() => {}}
      /> */}

      {/* <VersionNodeBridge
        mode="flow"
        projectId="ui-dev"
        projectVersions={null} // This triggers mock data mode
        projectVersion={3}
        onVersionChange={console.log}
        onNewProjectVersion={async () => {}}
        pinnedEquations={[]}
      /> */}
      {/* <VersionNodeBridge
        mode="analysis" // New mode!
        projectId={""}
        projectVersions={[]}
        projectVersion={1}
        onVersionChange={console.log}
      /> */}

      <GeometryLinkingWireframe />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh; // full height
  width: 100%;
  background-color: var(--bg-primary);
`;
