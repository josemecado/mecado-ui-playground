import styled from "styled-components";
import SideMenu from "../projects/projectChatWindow/SideMenuBar/SideMenuBar";
import ChatForm from "../projects/projectChatWindow/ChatView/MecadoChatForm";
import DetailBar from "../projects/projectChatWindow/DetailBar/DetailBar";

export default function ProjectChatWindow() {
  return (
    <Container>
      <SideMenu />
      <ChatForm />
      <DetailBar />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh; // full height
  width: 100%;
  background: red;
`;
