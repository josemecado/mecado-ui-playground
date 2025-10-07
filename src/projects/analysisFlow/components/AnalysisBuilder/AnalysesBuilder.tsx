// analysisFlow/components/AnalysisBuilder/AnalysesBuilder.tsx
import React, { useState } from "react";
import styled from "styled-components";
import {
  Analysis,
  Requirement,
} from "../../../nodeVisuals/versionNodes/utils/VersionInterfaces";
import {
  ANALYSIS_TEMPLATES,
  AnalysisTemplate,
  createAnalysisFromTemplate,
} from "../../utils/analysisTemplates";
import { Plus, Trash2, Settings, Flame, AudioLines, AlertCircle } from "lucide-react";

interface AnalysesBuilderProps {
  analyses: Analysis[];
  requirements: Requirement[];
  onChange: (analyses: Analysis[]) => void;
}

export const AnalysesBuilder: React.FC<AnalysesBuilderProps> = ({
  analyses,
  requirements,
  onChange,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<AnalysisTemplate | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);

  const handleAddAnalysis = () => {
    if (!selectedTemplate) return;

    const baseAnalysis = createAnalysisFromTemplate(selectedTemplate);
    const mappedRequirements = requirements.filter((r) =>
      selectedRequirements.includes(r.id)
    );

    const newAnalysis: Analysis = {
      ...baseAnalysis,
      metrics: [],
      requirements: mappedRequirements,
      status: "pending",
    };

    onChange([...analyses, newAnalysis]);
    setSelectedTemplate(null);
    setSelectedRequirements([]);
  };

  const handleDeleteAnalysis = (id: string) => {
    onChange(analyses.filter((a) => a.id !== id));
  };

  const handleToggleRequirement = (reqId: string) => {
    setSelectedRequirements((prev) =>
      prev.includes(reqId)
        ? prev.filter((id) => id !== reqId)
        : [...prev, reqId]
    );
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case "thermal":
        return <Flame size={14} />;
      case "modal":
        return <AudioLines size={14} />;
      default:
        return <Settings size={14} />;
    }
  };

  const groupedTemplates = ANALYSIS_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, AnalysisTemplate[]>);

  return (
    <Container>
      <Header>
        <HeaderTitle>Analyses ({analyses.length})</HeaderTitle>
        <HeaderSubtitle>
          Select analysis types and map requirements to them
        </HeaderSubtitle>
      </Header>

      <FormSection>
        <FormTitle>Add New Analysis</FormTitle>

        <SectionLabel>1. Select Analysis Type</SectionLabel>
        <TemplateGrid>
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <CategorySection key={category}>
              <CategoryHeader>
                {getTemplateIcon(category)}
                <span>{category}</span>
              </CategoryHeader>
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  $selected={selectedTemplate?.id === template.id}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateDescription>{template.description}</TemplateDescription>
                </TemplateCard>
              ))}
            </CategorySection>
          ))}
        </TemplateGrid>

        {selectedTemplate && (
          <>
            <SectionLabel>2. Map Requirements (Optional)</SectionLabel>
            {requirements.length > 0 ? (
              <RequirementsList>
                {requirements.map((req) => (
                  <RequirementCheckbox key={req.id}>
                    <input
                      type="checkbox"
                      checked={selectedRequirements.includes(req.id)}
                      onChange={() => handleToggleRequirement(req.id)}
                    />
                    <CheckboxLabel>
                      <RequirementName>{req.name}</RequirementName>
                      <RequirementExpression>
                        {req.expression} {req.comparator} {req.targetValue} {req.unit}
                      </RequirementExpression>
                    </CheckboxLabel>
                  </RequirementCheckbox>
                ))}
              </RequirementsList>
            ) : (
              <EmptyRequirements>
                No requirements defined. Go back to step 1 to create some.
              </EmptyRequirements>
            )}

            <AddButton onClick={handleAddAnalysis}>
              <Plus size={16} />
              Add Analysis
            </AddButton>
          </>
        )}
      </FormSection>

      {analyses.length > 0 ? (
        <ListSection>
          <ListTitle>Configured Analyses</ListTitle>
          <AnalysesList>
            {analyses.map((analysis) => (
              <AnalysisCard key={analysis.id}>
                <CardHeader>
                  <AnalysisInfo>
                    <AnalysisName>{analysis.name}</AnalysisName>
                    <AnalysisType>{analysis.type}</AnalysisType>
                  </AnalysisInfo>
                  <IconButton onClick={() => handleDeleteAnalysis(analysis.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </CardHeader>
                <CardBody>
                  <RequirementsCount>
                    {analysis.requirements?.length || 0} requirement(s) mapped
                  </RequirementsCount>
                  {analysis.requirements && analysis.requirements.length > 0 && (
                    <MappedRequirements>
                      {analysis.requirements.map((req) => (
                        <MappedReq key={req.id}>{req.name}</MappedReq>
                      ))}
                    </MappedRequirements>
                  )}
                </CardBody>
              </AnalysisCard>
            ))}
          </AnalysesList>
        </ListSection>
      ) : (
        <EmptyState>
          <AlertCircle size={32} />
          <EmptyTitle>No Analyses Configured</EmptyTitle>
          <EmptyText>Select a template above to add your first analysis</EmptyText>
        </EmptyState>
      )}
    </Container>
  );
};

// Styled Components (reusing many from RequirementsBuilder)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div``;

const HeaderTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
`;

const FormSection = styled.div`
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 8px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 0;
`;

const TemplateCard = styled.div<{ $selected: boolean }>`
  padding: 12px;
  background: ${(props) =>
    props.$selected
      ? "rgba(var(--accent-primary-rgb), 0.1)"
      : "var(--bg-primary)"};
  border: 1px solid
    ${(props) => (props.$selected ? "var(--accent-primary)" : "var(--border-outline)")};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const TemplateDescription = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.4;
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
`;

const RequirementCheckbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }

  input[type="checkbox"] {
    margin-top: 2px;
    cursor: pointer;
  }
`;

const CheckboxLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const RequirementName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
`;

const RequirementExpression = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  font-family: "Monaco", "Courier New", monospace;
`;

const EmptyRequirements = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-primary);
  border: 1px solid var(--border-outline);
  border-radius: 6px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--accent-primary);
  color: var(--text-inverted);
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-end;

  &:hover {
    opacity: 0.9;
  }
`;

const ListSection = styled.div``;

const ListTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
`;

const AnalysesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const AnalysisCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-outline);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-outline);
`;

const AnalysisInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AnalysisName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
`;

const AnalysisType = styled.div`
  font-size: 10px;
  color: var(--text-muted);
  font-family: "Monaco", "Courier New", monospace;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-outline);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-primary);
    color: var(--error);
    border-color: var(--error);
  }
`;

const CardBody = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RequirementsCount = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
`;

const MappedRequirements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MappedReq = styled.div`
  font-size: 10px;
  color: var(--accent-primary);
  padding: 4px 8px;
  background: rgba(var(--accent-primary-rgb), 0.1);
  border-radius: 4px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
`;

const EmptyTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 12px 0 4px 0;
`;

const EmptyText = styled.p`
  font-size: 12px;
  margin: 0;
`;