// src/views/GeoLabelManager/components/LabelSidebar.tsx
import React, { useState, KeyboardEvent, useMemo } from "react";
import styled from "styled-components";
import {
  Tag,
  Plus,
  Trash2,
  X,
  Square,
  Minus,
  Box,
  Info,
  ChevronDown,
  ChevronUp,
  Bot,
} from "lucide-react";

/*
Additions
*/
// Helper to count entities by type
type EntityTypeCounts = {
  face: number;
  edge: number;
  body: number;
};

const countEntitiesByType = (entities: Set<EntityID>): EntityTypeCounts => {
  const counts: EntityTypeCounts = { face: 0, edge: 0, body: 0 };

  entities.forEach((entityId) => {
    const { kind } = parseEntityID(entityId);
    counts[kind]++;
  });

  return counts;
};

type Label = {
  id: string;
  name: string;
  color: [number, number, number];
  entities: Set<EntityID>;
};

type EntityKind = "face" | "edge" | "body";

type EntityID<K extends EntityKind = EntityKind> = `${K}_${number}`;

const makeEntityID = <K extends EntityKind>(kind: K, id: number) =>
  `${kind}_${id}` as EntityID<K>;

const parseEntityID = (eid: EntityID) => {
  const [kind, n] = eid.split("_");
  return { kind: kind as EntityKind, id: Number(n) };
};
// End of additions

interface LabelSidebarProps {
  labels: Map<string, Label>;
  activeLabel: string | null;
  pendingSelection: Set<EntityID>;
  hoveredEntity: EntityID | null;
  currentMode: EntityKind;
  filteredLabels: Label[];
  onCreateLabel: (name: string) => void;
  onDeleteLabel: (labelId: string) => void;
  onSelectLabel: (labelId: string | null) => void;
  onClearPendingSelection: () => void;
  onClearHoverFilter: () => void;
  onLoadFile: () => void;
}

export const LabelSidebar: React.FC<LabelSidebarProps> = ({
  labels,
  activeLabel,
  pendingSelection,
  hoveredEntity,
  currentMode,
  filteredLabels,
  onCreateLabel,
  onDeleteLabel,
  onSelectLabel,
  onClearPendingSelection,
  onClearHoverFilter,
  onLoadFile,
}) => {
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [expandedActiveLabel, setExpandedActiveLabel] = useState(true);
  const [expandedHoveredEntity, setExpandedHoveredEntity] = useState(true);

  const handleCreateSubmit = () => {
    if (newLabelName.trim()) {
      onCreateLabel(newLabelName);
      setNewLabelName("");
      setIsCreatingLabel(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newLabelName.trim()) {
      handleCreateSubmit();
    }
    if (e.key === "Escape") {
      setIsCreatingLabel(false);
      setNewLabelName("");
    }
  };

  const hasSelection = pendingSelection.size > 0;

  // Get active label details
  const activeLabelData = activeLabel ? labels.get(activeLabel) : null;

  // Group entities by type for active label
  const activeLabelEntitiesByType = useMemo(() => {
    if (!activeLabelData) return { face: [], edge: [], body: [] };

    const grouped: { face: EntityID[]; edge: EntityID[]; body: EntityID[] } = {
      face: [],
      edge: [],
      body: [],
    };

    activeLabelData.entities.forEach((entityId) => {
      const { kind } = parseEntityID(entityId);
      grouped[kind].push(entityId);
    });

    // Sort each group by ID
    Object.keys(grouped).forEach((kind) => {
      grouped[kind as EntityKind].sort((a, b) => {
        const aId = parseEntityID(a).id;
        const bId = parseEntityID(b).id;
        return aId - bId;
      });
    });

    return grouped;
  }, [activeLabelData]);

  // Get hovered entity labels
  const hoveredEntityLabels = useMemo(() => {
    if (!hoveredEntity) return [];
    return Array.from(labels.values()).filter((label) =>
      label.entities.has(hoveredEntity)
    );
  }, [hoveredEntity, labels]);

  const hoveredEntityInfo = useMemo(() => {
    if (!hoveredEntity) return null;
    const { kind, id } = parseEntityID(hoveredEntity);
    return { kind, id };
  }, [hoveredEntity]);

  return (
    <Sidebar>
      <TopSection>
        <HeaderSection>
          <PanelTitle $variant="large">
            {" "}
            <Tag size={18} />
            Labels
          </PanelTitle>

          <ModeIndicator>
            Mode: <strong>{currentMode.toUpperCase()}</strong>
          </ModeIndicator>
        </HeaderSection>

        {/* Instructions Panel */}
        {showInstructions && (
          <InstructionsPanel>
            <InstructionsHeader>
              <Info size={16} />
              <span>How to Use</span>
              <CloseButton onClick={() => setShowInstructions(false)}>
                <X size={14} />
              </CloseButton>
            </InstructionsHeader>
            <InstructionsList>
              <li>
                <strong>Create Label:</strong> Click elements to select, then
                click "Create Label"
              </li>
              <li>
                <strong>Edit Label:</strong> Click a label to activate it, then
                click elements to add/remove
              </li>
              <li>
                <strong>Switch Modes:</strong> Press <kbd>M</kbd> to toggle
                Face/Edge/Body modes
              </li>
              <li>
                <strong>Reset View:</strong> Press <kbd>R</kbd> to reset camera
              </li>
            </InstructionsList>
          </InstructionsPanel>
        )}
      </TopSection>
      <BottomSection>
        {/* Active Label Detail Panel */}
        {activeLabelData && (
          <ActiveLabelDetailPanel>
            <PanelHeader
              onClick={() => setExpandedActiveLabel(!expandedActiveLabel)}
            >
              Selected Label:
              <HeaderLabelSection>
                <LabelColor $color={activeLabelData.color} $small />
                {activeLabelData.name}
                {/* </PanelTitle> */}
                {expandedActiveLabel ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </HeaderLabelSection>
            </PanelHeader>

            <HorizontalDivider />

            {expandedActiveLabel && (
              <PanelContent>
                <EntityTypeSection>
                  <EntityTypeHeader>
                    <Square size={14} />
                    Faces ({activeLabelEntitiesByType.face.length})
                  </EntityTypeHeader>
                  {activeLabelEntitiesByType.face.length > 0 ? (
                    <EntityChipGrid>
                      {activeLabelEntitiesByType.face.map((entityId) => (
                        <EntityChip key={entityId}>
                          face_
                          {parseEntityID(entityId).id}
                        </EntityChip>
                      ))}
                    </EntityChipGrid>
                  ) : (
                    <EmptyEntityType>None</EmptyEntityType>
                  )}
                </EntityTypeSection>

                <EntityTypeSection>
                  <EntityTypeHeader>
                    <Minus size={14} />
                    Edges ({activeLabelEntitiesByType.edge.length})
                  </EntityTypeHeader>
                  {activeLabelEntitiesByType.edge.length > 0 ? (
                    <EntityChipGrid>
                      {activeLabelEntitiesByType.edge.map((entityId) => (
                        <EntityChip key={entityId}>
                          edge_
                          {parseEntityID(entityId).id}
                        </EntityChip>
                      ))}
                    </EntityChipGrid>
                  ) : (
                    <EmptyEntityType>None</EmptyEntityType>
                  )}
                </EntityTypeSection>

                <EntityTypeSection>
                  <EntityTypeHeader>
                    <Box size={14} />
                    Bodies ({activeLabelEntitiesByType.body.length})
                  </EntityTypeHeader>
                  {activeLabelEntitiesByType.body.length > 0 ? (
                    <EntityChipGrid>
                      {activeLabelEntitiesByType.body.map((entityId) => (
                        <EntityChip key={entityId}>
                          body_
                          {parseEntityID(entityId).id}
                        </EntityChip>
                      ))}
                    </EntityChipGrid>
                  ) : (
                    <EmptyEntityType>None</EmptyEntityType>
                  )}
                </EntityTypeSection>

                <PanelHint>Click elements to add/remove</PanelHint>
              </PanelContent>
            )}
          </ActiveLabelDetailPanel>
        )}

        {/* Hovered Entity Detail Panel */}
        {/* {hoveredEntity && hoveredEntityInfo && (
        <HoveredEntityPanel>
          <PanelHeader
            onClick={() => setExpandedHoveredEntity(!expandedHoveredEntity)}
          >
            <PanelTitle>
              {hoveredEntityInfo.kind === "face" && <Square size={14} />}
              {hoveredEntityInfo.kind === "edge" && <Minus size={14} />}
              {hoveredEntityInfo.kind === "body" && <Box size={14} />}
              <span>
                {hoveredEntityInfo.kind.toUpperCase()} {hoveredEntityInfo.id}
              </span>
            </PanelTitle>
            {expandedHoveredEntity ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </PanelHeader>

          {expandedHoveredEntity && (
            <PanelContent>
              <InfoRow>
                <InfoLabel>Type:</InfoLabel>
                <InfoValue>{hoveredEntityInfo.kind}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>ID:</InfoLabel>
                <InfoValue>{hoveredEntityInfo.id}</InfoValue>
              </InfoRow>

              <Divider />

              <InfoRow>
                <InfoLabel>Labels:</InfoLabel>
                <InfoValue>{hoveredEntityLabels.length || "None"}</InfoValue>
              </InfoRow>

              {hoveredEntityLabels.length > 0 && (
                <EntityLabelsSection>
                  {hoveredEntityLabels.map((label) => (
                    <EntityLabelChip key={label.id} $color={label.color}>
                      <LabelColor $color={label.color} $small />
                      {label.name}
                    </EntityLabelChip>
                  ))}
                </EntityLabelsSection>
              )}

              {activeLabel && (
                <PanelHint>
                  {labels.get(activeLabel)?.entities.has(hoveredEntity)
                    ? "Click to remove from active label"
                    : "Click to add to active label"}
                </PanelHint>
              )}
            </PanelContent>
          )}
        </HoveredEntityPanel>
      )} */}

        {/* Hover Filter Info */}
        {/* {hoveredEntity && (
        <HoverFilterInfo>
          Filtering labels by hovered entity
          <IconButton onClick={onClearHoverFilter}>
            <X size={14} />
          </IconButton>
        </HoverFilterInfo>
      )} */}
        <LabelsSection>
          <PanelTitle>Labels</PanelTitle>

          {/* Labels List */}
          <LabelsList>
            {filteredLabels.length === 0 ? (
              <EmptyState>
                {hoveredEntity
                  ? "No labels for this entity"
                  : "No labels created yet"}
              </EmptyState>
            ) : (
              filteredLabels.map((label) => {
                const counts = countEntitiesByType(label.entities);
                return (
                  <LabelItem
                    key={label.id}
                    $isActive={activeLabel === label.id}
                    $isHighlighted={
                      hoveredEntity && label.entities.has(hoveredEntity)
                    }
                    onClick={() =>
                      onSelectLabel(activeLabel === label.id ? null : label.id)
                    }
                  >
                    <LabelColor $color={label.color} />
                    <LabelInfo>
                      <LabelName
                        $isActive={activeLabel === label.id}
                        $isHighlighted={
                          hoveredEntity && label.entities.has(hoveredEntity)
                        }
                      >
                        {label.name}
                      </LabelName>
                      <EntityCounts>
                        {counts.face > 0 && (
                          <EntityCount
                            $isActive={activeLabel === label.id}
                            $isHighlighted={
                              hoveredEntity && label.entities.has(hoveredEntity)
                            }
                            title={`${counts.face} face${
                              counts.face !== 1 ? "s" : ""
                            }`}
                          >
                            <Square size={12} />
                            {counts.face}
                          </EntityCount>
                        )}
                        {counts.edge > 0 && (
                          <EntityCount
                            $isActive={activeLabel === label.id}
                            $isHighlighted={
                              hoveredEntity && label.entities.has(hoveredEntity)
                            }
                            title={`${counts.edge} edge${
                              counts.edge !== 1 ? "s" : ""
                            }`}
                          >
                            <Minus size={12} />
                            {counts.edge}
                          </EntityCount>
                        )}
                        {counts.body > 0 && (
                          <EntityCount
                            $isActive={activeLabel === label.id}
                            $isHighlighted={
                              hoveredEntity && label.entities.has(hoveredEntity)
                            }
                            title={`${counts.body} ${
                              counts.body !== 1 ? "bodies" : "body"
                            }`}
                          >
                            <Box size={12} />
                            {counts.body}
                          </EntityCount>
                        )}
                      </EntityCounts>
                    </LabelInfo>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLabel(label.id);
                      }}
                      title="Delete label"
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </LabelItem>
                );
              })
            )}
          </LabelsList>

          {/* Create Label Section */}
          {isCreatingLabel ? (
            <CreateLabelForm>
              <Input
                type="text"
                placeholder="Label name..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <ButtonGroup>
                <PrimaryButton
                  onClick={handleCreateSubmit}
                  disabled={!newLabelName.trim()}
                >
                  Create
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => {
                    setIsCreatingLabel(false);
                    setNewLabelName("");
                  }}
                >
                  Cancel
                </SecondaryButton>
              </ButtonGroup>
            </CreateLabelForm>
          ) : (
            <NewLabelButton
              onClick={() => setIsCreatingLabel(true)}
              disabled={!hasSelection}
              title={
                !hasSelection
                  ? "Select elements first"
                  : "Create label from selection"
              }
            >
              <Plus size={16} />
              Create Label
            </NewLabelButton>
          )}
        </LabelsSection>
      </BottomSection>
      {/* Pending Selection Banner */}
      {hasSelection && !activeLabel && (
        <PendingSelectionBanner>
          <div>
            <strong>{pendingSelection.size}</strong> element
            {pendingSelection.size !== 1 ? "s" : ""} selected
          </div>
          <ClearButton onClick={onClearPendingSelection}>Clear</ClearButton>
        </PendingSelectionBanner>
      )}
    </Sidebar>
  );
};

// Styled Components
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  width: 350px;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-left: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 8px;
`;

const InstructionsPanel = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
`;

const InstructionsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  font-size: ${({ theme }) => theme.typography.size.sm};

  span {
    flex: 1;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: ${({ theme }) => theme.spacing[1]};
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const InstructionsList = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.6;

  li {
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  kbd {
    padding: 2px 6px;
    background: ${({ theme }) => theme.colors.backgroundPrimary};
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: ${({ theme }) => theme.radius.sm};
    font-family: ${({ theme }) => theme.typography.family.mono};
    font-size: 0.85em;
  }
`;

const ModeIndicator = styled.div`
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  padding: ${({ theme }) =>
    `${theme.components.button.paddingY} ${theme.components.button.paddingX}`};
  border: 1px solid ${({ theme }) => theme.colors.borderSoft};
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: ${({ theme }) => theme.radius.md};
  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.semiBold};
  }
`;

const PendingSelectionBanner = styled.div`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[6]}`};
  background: ${({ theme }) => theme.colors.accentSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSoft};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const ClearButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[2]}`};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const CreateLabelForm = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  /* background: ${({ theme }) => theme.colors.backgroundTertiary}; */
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Input = styled.input`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  background: ${({ theme }) => theme.colors.backgroundTertiary};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.family.base};
  transition: border-color ${({ theme }) => theme.animation.duration.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  background: ${({ theme }) => theme.colors.brandPrimary};
  color: ${({ theme }) => theme.colors.textInverted};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.components.button.fontSize};
  font-weight: ${({ theme }) => theme.components.button.fontWeight};
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.hoverPrimary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.textMuted};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const NewLabelButton = styled.button<{ disabled?: boolean }>`
  margin: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.backgroundTertiary : theme.colors.brandPrimary};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textMuted : theme.colors.textInverted};
  border: ${({ theme, disabled }) =>
    disabled ? `1px solid ${theme.colors.borderDefault}` : "none"};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-size: ${({ theme }) => theme.components.button.fontSize};
  font-weight: ${({ theme }) => theme.components.button.fontWeight};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  transition: all ${({ theme }) => theme.animation.duration.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.hoverPrimary};
  }
`;

// Active Label Detail Panel
const ActiveLabelDetailPanel = styled.div`
  margin: ${({ theme }) => `${theme.padding.sm} ${theme.padding.sm}`};
  /* background: ${({ theme }) => theme.colors.backgroundTertiary}; */
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const PanelHeader = styled.div`
  padding: ${({ theme }) => `${theme.padding.sm} ${theme.padding.sm}`};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  transition: background ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBackground}40;
  }

  font-weight: ${({ theme }) => theme.typography.weight.medium};
  font-size: ${({ theme }) => theme.typography.size.md};

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: ${({ theme }) => theme.typography.weight.semiBold};

    font-size: ${({ theme }) => theme.typography.size.md};
  }
`;

const HeaderLabelSection = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
`;

const PanelTitle = styled.div<{ $variant?: "standard" | "large" }>`
  display: flex;
  align-items: center;
  font-size: ${({ theme, $variant }) =>
    $variant === "large" ? theme.typography.size.xl : theme.typography.size.lg};
  font-weight: ${({ theme, $variant }) =>
    $variant === "large"
      ? theme.typography.weight.semiBold
      : theme.typography.weight.semiBold};
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: ${({ theme }) =>
    `0px ${theme.components.sidebar.collapsedPaddingY} `};
  gap: ${({ theme }) => theme.spacing[2]};
  transition: all 0.2s ease;
  margin-bottom: ${({ theme, $variant }) =>
    $variant === "large" ? 0 : theme.padding.sm};
`;

// const SectionHeader = styled.h1<{ $variant?: "standard" | "large"}>`
//   font-size: ${({ theme, $variant }) => $variant === 'large' ? theme.typography.size.xl : theme.typography.size.md};
//   font-weight: ${({ theme }) => theme.typography.weight.medium};
//   color: ${({ theme }) => theme.colors.textPrimary};
//   margin: ${({ theme }) => `0px
//    ${theme.components.sidebar.collapsedPaddingY} ${theme.components.sidebar.collapsedPaddingY} `};

//   transition: all 0.2s ease;
// `;

const PanelContent = styled.div`
display: flex;
flex-direction: column;
gap: 4px;
  padding: ${({ theme }) => `0 ${theme.padding.sm}`};
  padding-bottom: ${({ theme }) => theme.padding.sm};
`;

const HorizontalDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSoft};

  /* Layout and Spacing */
  width: 100%;
  margin: 0 0 8px 0;
`;

const EntityTypeSection = styled.div`
display: flex;
flex-direction: column;
gap: 2px;
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  &:last-of-type {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const EntityTypeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const EntityChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const EntityChip = styled.div`
  padding: ${({ theme }) => `2px ${theme.spacing[2]}`};
  background: ${({ theme }) => theme.colors.backgroundQuaternary};
  /* border: 1px solid ${({ theme }) => theme.colors.borderSubtle}; */
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.family.mono};
`;

const EmptyEntityType = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

const PanelHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: ${({ theme }) => theme.spacing[1]};
  display: flex;
  align-items: center;
  transition: color ${({ theme }) => theme.animation.duration.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.statusError};
  }
`;

const LabelsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => `0px ${theme.spacing[3]}`};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => `${theme.spacing[10]} ${theme.spacing[6]}`};
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const LabelItem = styled.div<{ $isActive: boolean; $isHighlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  background: ${({ theme, $isActive, $isHighlighted }) =>
    $isActive
      ? theme.colors.backgroundQuaternary
      : $isHighlighted
      ? theme.colors.backgroundTertiary
      : theme.colors.backgroundTertiary};
  opacity: 0.9;
  border: 1px solid
    ${({ theme, $isActive, $isHighlighted }) =>
      $isActive
        ? theme.colors.brandPrimary
        : $isHighlighted
        ? theme.colors.brandPrimary + "80"
        : theme.colors.borderDefault};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.fast};
  box-shadow: ${({ $isHighlighted }) =>
    $isHighlighted ? "0 0 0 2px rgba(64, 112, 255, 0.2)" : "none"};

  &:hover {
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.accentSecondary : theme.colors.hoverBackground};
    border-color: ${({ theme }) => theme.colors.brandPrimary};
  }
`;

const LabelColor = styled.div<{
  $color: [number, number, number];
  $small?: boolean;
}>`
  width: ${({ $small }) => ($small ? "16px" : "24px")};
  height: ${({ $small }) => ($small ? "16px" : "24px")};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $color }) =>
    `rgb(${$color[0] * 255}, ${$color[1] * 255}, ${$color[2] * 255})`};
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

const LabelInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LabelName = styled.div<{ $isActive: boolean; $isHighlighted?: boolean }>`
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  font-size: ${({ theme }) => theme.typography.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: ${({ theme }) => theme.spacing[1]};

  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ theme, $isActive, $isHighlighted }) =>
    $isActive
      ? theme.typography.weight.semiBold
      : $isHighlighted
      ? theme.typography.weight.regular
      : theme.typography.weight.regular};
`;

const EntityCounts = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const EntityCount = styled.div<{
  $isActive: boolean;
  $isHighlighted?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.size.sm};

  color: ${({ theme }) => theme.colors.textPrimary};

  svg {
    opacity: 0.7;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.padding.sm} ${theme.padding.sm}`};
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
`;

const LabelsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;