import styled from "styled-components";
import { GeometryFlow } from "../projects/geoNodes/GeoFlow";
import SideMenu from "../projects/projectChatWindow/SideMenuBar/SideMenuBar";

export default function MecadoTests() {
  return (
    <Container>
        <SideMenu />
      <GeometryFlow />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh; // full height
  width: 100%;
`;
