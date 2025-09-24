import styled from "styled-components";
import SideMenu from "../projects/projectChatWindow/SideMenuBar/SideMenuBar";
// import SidePanelMenu from "../projects/projectChatWindow/SideMenu/SidePanelMenu";
import { VersionNodeBridge } from "../projects/versionNodes/VersionNodeBridge";

export default function ProjectChatWindow() {
  return (
    <Container>
      {/* <SideMenu /> */}
      <SideMenu
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
      />

  <VersionNodeBridge
    mode="flow"
    projectId="ui-dev"
    projectVersions={null} // This triggers mock data mode
    projectVersion={3}
    onVersionChange={console.log}
    onNewProjectVersion={async () => {}}
    pinnedEquations={[]}
  />

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
