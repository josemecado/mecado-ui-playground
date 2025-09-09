import styled from "styled-components";
import SideMenu from "../projects/projectChatWindow/SideMenuBar/SideMenuBar";
import ChatForm from "../projects/projectChatWindow/ChatView/MecadoChatForm";
import DetailBar from "../projects/projectChatWindow/DetailBar/DetailBar";
import StreamingTextBubblePlayground from "../reusable-components/StreamingBubbleTest.tsx/StreamingBubblePlayground";
import HookArchitectureVisualizer from "../projects/projectGeometryWindow/visualizer/ProjectGeometryVisualizer";
import LevelArchitectureVisualizer from "../projects/projectGeometryWindow/visualizer/LevelArchitectureVisualizer";
import SidePanelMenu from "../projects/projectChatWindow/SideMenu/SidePanelMenu";

export default function ProjectChatWindow() {
  return (
    <Container>
      {/* <SideMenu /> */}
      <SidePanelMenu
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
      {/* <ChatForm /> */}
      {/* <StreamingTextBubblePlayground /> */}
      {/* <HookArchitectureVisualizer /> */}
      {/* <LevelArchitectureVisualizer /> */}
      {/* <DetailBar /> */}
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
