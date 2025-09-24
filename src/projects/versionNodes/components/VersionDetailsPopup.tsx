// VersionDetailsPopup.tsx
import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import {
  X,
  FileText,
  Calculator,
  Upload,
  FileCode,
  GitBranch,
  Calendar,
} from "lucide-react";
import { ProjectVersion } from "../utils/VersionInterfaces";
import { Equation } from "../../../../utils/handCalcs";
import { FileItem } from "../../../../../sideMenu/SideMenu";

interface VersionDetailsPopupProps {
  version: ProjectVersion;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const VersionDetailsPopup: React.FC<VersionDetailsPopupProps> = ({
  version,
  onClose,
  position = { x: 0, y: 0 },
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Calculate counts
  const equationCount = version.pinnedEquations?.length || 0;
  const uploadedCount = version.uploadedFiles?.length || 0;
  const generatedCount = version.generatedFiles?.length || 0;
  const totalFiles = uploadedCount + generatedCount;

  return (
    <PopupOverlay>
      <PopupContainer ref={popupRef} $x={position.x} $y={position.y}>
        <Header>
          <TitleSection>
            <VersionBadge>{version.id.toUpperCase()}</VersionBadge>
            <Title>{version.title}</Title>
          </TitleSection>
          <CloseButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </CloseButton>
        </Header>

        <MetaInfo>
          <MetaItem>
            <Calendar size={14} />
            <span>{new Date(version.createdAt).toLocaleDateString()}</span>
          </MetaItem>
          {version.parentVersion && (
            <MetaItem>
              <GitBranch size={14} />
              <span>From {version.parentVersion.toUpperCase()}</span>
            </MetaItem>
          )}
        </MetaInfo>

        <StatsGrid>
          <StatCard>
            <StatIcon>
              <Calculator size={16} />
            </StatIcon>
            <StatContent>
              <StatValue>{equationCount}</StatValue>
              <StatLabel>Equations</StatLabel>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FileText size={16} />
            </StatIcon>
            <StatContent>
              <StatValue>{totalFiles}</StatValue>
              <StatLabel>Files</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <ContentSection>
          {/* Pinned Equations */}
          {equationCount > 0 && (
            <ContentBlock>
              <SectionHeader>
                <Calculator size={14} />
                Pinned Equations
                <Count>{equationCount}</Count>
              </SectionHeader>
              <ScrollableList>
                {version.pinnedEquations.map((eq: Equation) => (
                  <EquationItem key={eq.id}>
                    <EquationLatex>{eq.latex}</EquationLatex>
                    <EquationDesc>{eq.description}</EquationDesc>
                  </EquationItem>
                ))}
              </ScrollableList>
            </ContentBlock>
          )}

          {/* Uploaded Files */}
          {uploadedCount > 0 && (
            <ContentBlock>
              <SectionHeader>
                <Upload size={14} />
                Uploaded Files
                <Count>{uploadedCount}</Count>
              </SectionHeader>
              <FileList>
                {version.uploadedFiles.map((file: FileItem) => (
                  <FileItemRow key={file.path}>
                    <FileIcon>
                      <FileText size={12} />
                    </FileIcon>
                    <FileName title={file.path}>{file.name}</FileName>
                  </FileItemRow>
                ))}
              </FileList>
            </ContentBlock>
          )}

          {/* Generated Files */}
          {generatedCount > 0 && (
            <ContentBlock>
              <SectionHeader>
                <FileCode size={14} />
                Generated Docs
                <Count>{generatedCount}</Count>
              </SectionHeader>
              <FileList>
                {version.generatedFiles.map((file: FileItem) => (
                  <FileItemRow key={file.path}>
                    <FileIcon>
                      <FileCode size={12} />
                    </FileIcon>
                    <FileName title={file.path}>{file.name}</FileName>
                  </FileItemRow>
                ))}
              </FileList>
            </ContentBlock>
          )}
        </ContentSection>
      </PopupContainer>
    </PopupOverlay>
  );
};

/* ================== Styled Components ================== */

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const PopupContainer = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  max-width: 90vw;
  max-height: 80vh;
  background: var(--bg-primary);
  border: 1px solid var(--border-bg);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translate(-50%, -45%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-bg);
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const VersionBadge = styled.div`
  background: var(--primary-action);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-bg);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 12px;

  svg {
    color: var(--accent-neutral);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-bg);
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 6px;
  color: var(--primary-action);
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  max-height: 400px;
`;

const ContentBlock = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;

  svg {
    color: var(--accent-neutral);
  }
`;

const Count = styled.span`
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-muted);
  margin-left: auto;
`;

const ScrollableList = styled.div`
  max-height: 150px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-bg);
    border-radius: 2px;
  }
`;

const EquationItem = styled.div`
  padding: 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid var(--border-bg);

  &:last-child {
    margin-bottom: 0;
  }
`;

const EquationLatex = styled.div`
  font-family: "Courier New", monospace;
  font-size: 12px;
  color: var(--primary-action);
  margin-bottom: 4px;
  word-break: break-all;
`;

const EquationDesc = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FileItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid var(--border-bg);
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-neutral);
  }
`;

const FileIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 4px;
  color: var(--accent-neutral);
`;

const FileName = styled.span`
  font-size: 12px;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
