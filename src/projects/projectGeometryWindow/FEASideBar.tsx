import React, { useState } from "react";
import styled from "styled-components";
import { ChevronDown, Box, Weight, Target, Scan } from "lucide-react";

const FEAConfigSidebar: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState("Aluminum 7075");
  const [selectedBoundary, setSelectedBoundary] = useState("");
  const [selectedLoad, setSelectedLoad] = useState("");
  const [selectedResult, setSelectedResult] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Materials: true,
    Boundary: true,
    Loads: true,
    Results: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <Sidebar>
      <Title>FEA Config.</Title>

      <Section>
        <SectionHeader onClick={() => toggleSection("Materials")}>
          <SectionTitleWrapper>
            <Box size={16} style={{ marginRight: "8px" }} />
            <SectionTitle>Materials</SectionTitle>
          </SectionTitleWrapper>
          <Chevron $open={openSections.Materials} size={16} />
        </SectionHeader>

        {openSections.Materials && (
          <OptionContainer>
            <Option
              active={selectedMaterial === "Aluminum 7075"}
              onClick={() => setSelectedMaterial("Aluminum 7075")}
            >
              Aluminum 7075
            </Option>
            <Option
              active={selectedMaterial === "Stainless Steel"}
              onClick={() => setSelectedMaterial("Stainless Steel")}
            >
              Stainless Steel
            </Option>
          </OptionContainer>
        )}
      </Section>

      <Section>
        <SectionHeader onClick={() => toggleSection("Boundary")}>
          <SectionTitleWrapper>
            <Scan size={16} style={{ marginRight: "8px" }} />
            <SectionTitle>Boundary Conditions</SectionTitle>
          </SectionTitleWrapper>
          <Chevron $open={openSections.Boundary} size={16} />
        </SectionHeader>

        {openSections.Boundary && (
          <OptionContainer>
            <Option
              active={selectedBoundary === "Bolt Pretension"}
              onClick={() => setSelectedBoundary("Bolt Pretension")}
            >
              Bolt Pretension
            </Option>
          </OptionContainer>
        )}
      </Section>

      <Section>
        <SectionHeader onClick={() => toggleSection("Loads")}>
          <SectionTitleWrapper>
            <Weight size={16} style={{ marginRight: "8px" }} />
            <SectionTitle>Loads</SectionTitle>
          </SectionTitleWrapper>
          <Chevron $open={openSections.Loads} size={16} />
        </SectionHeader>

        {openSections.Loads && (
          <OptionContainer>
            <Option
              active={selectedLoad === "Load Brief"}
              onClick={() => setSelectedLoad("Load Brief")}
            >
              Load brief description
            </Option>
          </OptionContainer>
        )}
      </Section>

      <Section>
        <SectionHeader onClick={() => toggleSection("Results")}>
          <SectionTitleWrapper>
            <Target size={16} style={{ marginRight: "8px" }} />
            <SectionTitle>Results</SectionTitle>
          </SectionTitleWrapper>
          <Chevron $open={openSections.Results} size={16} />
        </SectionHeader>

        {openSections.Results && (
          <OptionContainer>
            <Option
              active={selectedResult === "Von Mises Stress"}
              onClick={() => setSelectedResult("Von Mises Stress")}
            >
              Von Mises Stress
            </Option>
            <Option
              active={selectedResult === "Displacement"}
              onClick={() => setSelectedResult("Displacement")}
            >
              Displacement
            </Option>
          </OptionContainer>
        )}
      </Section>

      <DarkModeToggle onClick={toggleDarkMode}>
        <ToggleLabel>Hand Calc Mode</ToggleLabel>

        <ToggleSwitch $active={darkMode} />
      </DarkModeToggle>
    </Sidebar>
  );
};

export default FEAConfigSidebar;

// Styled-components BELOW for clarity

const Sidebar = styled.aside`
  width: 280px;
  height: 100vh;
  background: #111114;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 8px;
  padding: 2px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
`;

interface ChevronProps {
  $open: boolean;
}

const Chevron = styled(ChevronDown)<ChevronProps>`
  transition: 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);

  transform: rotate(${(props) => (props.$open ? "0deg" : "-90deg")});
`;

interface OptionProps {
  active?: boolean;
}

const Option = styled.button<OptionProps>`
  display: flex;
  align-items: center;
  justify-content: space-between; /* Add this to space label and circle */
  width: 100%;
  background: ${(props) =>
    props.active ? "#1c1b20" : "rgba(28, 27, 32, 0.5)"};
  border: none;
  color: #e4e4e7;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #2b2b30;
  }

  &::after {
    content: "";
    display: ${(props) => (props.active ? "block" : "none")};
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80; /* green circle for active */
    margin-left: 12px;
  }
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

// Dark Mode Toggle
const DarkModeToggle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  gap: 8px;
  margin-top: auto; /* stick to bottom */
  cursor: pointer;
`;

const ToggleSwitch = styled.div<{ $active: boolean }>`
  width: 32px;
  height: 18px;
  background: ${(props) => (props.$active ? "#4ade80" : "#555")};
  border-radius: 999px;
  position: relative;
  transition: background 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${(props) => (props.$active ? "16px" : "2px")};
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s ease;
  }
`;

const ToggleLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #ccc;
`;

// Fonts/Headings
export const TitleStyle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.5;

  /* @media (max-width: 960px) {
    font-size: 28px;
  } */
`;

const Title = styled(TitleStyle).attrs({
  className: "Side Menu Title",
})`
  margin: 8px 0px;
`;
