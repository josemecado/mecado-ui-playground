import React from "react";
import styled from "styled-components";
import { MathJaxContext } from "better-react-mathjax";
import ToolCallBubble from "./ToolBubble";
import { FileText, Database, Calculator, Globe, Code, Settings } from "lucide-react";

// Mock Data Sets
const mockApiResponse = {
  status: "success",
  timestamp: "2024-01-15T10:30:00Z",
  endpoint: "/api/v2/analysis/structural",
  method: "POST",
  response_time: "245ms",
  data: {
    analysis_id: "ana_2024_15_xyz",
    results: {
      max_stress: 150.5,
      max_displacement: 2.34,
      safety_factor: 2.8,
      convergence: true,
      iterations: 12
    },
    mesh_quality: {
      elements: 45672,
      nodes: 89234,
      quality_score: 0.92
    }
  }
};

const mockCalculationData = {
  operation: "stress_analysis",
  inputs: {
    force: { value: 5000, unit: "N" },
    area: { value: 25, unit: "mm²" },
    material: "Steel AISI 304",
    temperature: { value: 20, unit: "°C" }
  },
  calculations: [
    {
      step: 1,
      description: "Calculate normal stress",
      formula: "σ = F/A",
      result: "200 MPa"
    },
    {
      step: 2,
      description: "Apply temperature correction",
      formula: "σ_corrected = σ × (1 + α × ΔT)",
      result: "198.5 MPa"
    }
  ],
  conclusion: "The calculated stress (198.5 MPa) is within acceptable limits for Steel AISI 304 (yield strength: 215 MPa)"
};

const mockDatabaseQuery = {
  query: "SELECT * FROM simulations WHERE project_id = 'PRJ-2024-001' AND status = 'completed'",
  execution_time: "0.023s",
  rows_returned: 15,
  sample_data: [
    {
      id: "sim_001",
      name: "Beam Deflection Analysis",
      created_at: "2024-01-10",
      runtime: "2h 15m",
      convergence: true
    },
    {
      id: "sim_002",
      name: "Thermal Stress Analysis",
      created_at: "2024-01-12",
      runtime: "3h 45m",
      convergence: true
    }
  ]
};

const mockGeometryProcessing = {
  file: "assembly_v3.step",
  operation: "mesh_generation",
  parameters: {
    element_size: 5.0,
    mesh_type: "tetrahedral",
    refinement_zones: ["bearing_surfaces", "contact_regions"],
    quality_threshold: 0.85
  },
  progress: {
    status: "completed",
    stages: {
      import: "✓ Complete (2.3s)",
      cleanup: "✓ Complete (1.1s)",
      meshing: "✓ Complete (45.2s)",
      quality_check: "✓ Complete (3.4s)"
    }
  },
  output: {
    total_elements: 128456,
    total_nodes: 245789,
    quality_metrics: {
      aspect_ratio: 1.23,
      skewness: 0.15,
      orthogonality: 0.92
    }
  }
};

const mockErrorResponse = {
  error: true,
  error_code: "CONVERGENCE_FAILED",
  message: "Simulation failed to converge after 500 iterations",
  details: {
    last_residual: 0.0045,
    target_residual: 0.0001,
    problematic_regions: ["contact_zone_3", "boundary_edge_12"],
    suggested_actions: [
      "Refine mesh in problematic regions",
      "Reduce time step size",
      "Check boundary conditions",
      "Review material properties"
    ]
  },
  timestamp: "2024-01-15T14:22:33Z",
  job_id: "job_789_failed"
};

// MathJax configuration
const mathJaxConfig = {
  tex: {
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
  },
};

// Main Showcase Component
export default function ToolCallBubbleShowcase() {
  return (
    <MathJaxContext config={mathJaxConfig}>
      <ShowcaseContainer>
        <Header>
          <h1>ToolCallBubble Component Showcase</h1>
          <p>Dual modal system: Tool content (click body) and Debug data (click debug button)</p>
        </Header>

        <Section>
          <SectionTitle>1. API Response with Status</SectionTitle>
          <Description>
            Shows API status in body, full response details in tool modal, raw JSON in debug modal
          </Description>
          <ToolCallBubble
            title="Structural Analysis API"
            toolContent={
              <div>
                <h3>API Response Details</h3>
                <p>The structural analysis completed successfully with the following results:</p>
                <ul>
                  <li>Maximum Stress: <strong>150.5 MPa</strong></li>
                  <li>Maximum Displacement: <strong>2.34 mm</strong></li>
                  <li>Safety Factor: <strong>2.8</strong></li>
                  <li>Convergence achieved in <strong>12 iterations</strong></li>
                </ul>
                <h4>Mesh Quality Metrics:</h4>
                <p>Total Elements: 45,672 | Total Nodes: 89,234</p>
                <p>Quality Score: <strong>0.92</strong> (Excellent)</p>
              </div>
            }
            debugContent={mockApiResponse}
            links={[
              { url: "https://api.example.com/docs", label: "API Documentation" },
              { url: "https://status.example.com", label: "API Status" }
            ]}
            onCopy={() => console.log("API response copied")}
          />
        </Section>

        <Section>
          {/* <SectionTitle>2. Engineering Calculations with LaTeX</SectionTitle>
          <Description>
            Mathematical formulas in tool modal, calculation data in debug modal
          </Description> */}
          <ToolCallBubble
            title="Stress Analysis Calculation"
            toolContent={
              <div>
                <h3>Stress Analysis Results</h3>
                <p><strong>Step 1: Normal Stress Calculation</strong></p>
                {/* <p>Using the formula $\sigma = \frac{F}{A}$, where:</p> */}
                <ul>
                  <li>Force $F = 5000$ N</li>
                  <li>Area $A = 25$ mm²</li>
                </ul>
                <p>We get: $\sigma = \frac{5000}{25} = 200$ MPa</p>
                
                <p><strong>Step 2: Temperature Correction</strong></p>
                <p>Applying temperature correction factor:</p>
                {/* <p>$\sigma_{corrected} = \sigma \times (1 + \alpha \times \Delta T) = 198.5$ MPa</p> */}
                
                <StatusMessage $status="success">
                  ✓ The calculated stress (198.5 MPa) is within acceptable limits for Steel AISI 304 (yield strength: 215 MPa)
                </StatusMessage>
              </div>
            }
            debugContent={mockCalculationData}
            enableLatex={true}
            links={[
              { url: "https://example.com/materials/AISI304", label: "Material Properties", icon: <Database size={14} /> },
              { url: "https://example.com/calc/stress", label: "Calculation Details", icon: <Calculator size={14} /> }
            ]}
            onCopy={() => console.log("Calculation data copied")}
          />
        </Section>

        <Section>
          <SectionTitle>3. Database Query Results</SectionTitle>
          <Description>
            Query summary in body, detailed results in tool modal, raw query data in debug
          </Description>
          <ToolCallBubble
            title="Database Query"
            toolContent={
              <div>
                <h3>Query Results</h3>
                <CodeSnippet>
                  SELECT * FROM simulations WHERE project_id = 'PRJ-2024-001' AND status = 'completed'
                </CodeSnippet>
                <p>Query executed successfully in <strong>0.023 seconds</strong>, returning <strong>15 rows</strong>.</p>
                
                <h4>Sample Results:</h4>
                <table style={{ width: '100%', marginTop: '12px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Created</th>
                      <th>Runtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>sim_001</td>
                      <td>Beam Deflection Analysis</td>
                      <td>2024-01-10</td>
                      <td>2h 15m</td>
                    </tr>
                    <tr>
                      <td>sim_002</td>
                      <td>Thermal Stress Analysis</td>
                      <td>2024-01-12</td>
                      <td>3h 45m</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            }
            debugContent={mockDatabaseQuery}
            links={[
              { url: "https://db.example.com/query", label: "Query Builder", icon: <Database size={14} /> }
            ]}
            onCopy={() => console.log("Query data copied")}
          />
        </Section>
      </ShowcaseContainer>
    </MathJaxContext>
  );
}

// Styled Components for Showcase
const ShowcaseContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  background: var(--bg-primary, #f9fafb);
  min-height: 100vh;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 48px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary, #111827);
    margin-bottom: 8px;
  }
  
  p {
    font-size: 16px;
    color: var(--text-muted, #6b7280);
  }
`;

const Section = styled.section`
  margin-bottom: 40px;
  padding: 24px;
  background: var(--bg-secondary, #ffffff);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 14px;
  color: var(--text-muted, #6b7280);
  margin-bottom: 20px;
`;

// Custom Preview Components
const StatusMessage = styled.div<{ $status: 'success' | 'error' | 'warning' }>`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 16px;
  background: ${props => 
    props.$status === 'success' ? 'rgba(34, 197, 94, 0.1)' :
    props.$status === 'error' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(251, 191, 36, 0.1)'};
  color: ${props =>
    props.$status === 'success' ? '#16a34a' :
    props.$status === 'error' ? '#dc2626' :
    '#d97706'};
`;

const CodeSnippet = styled.code`
  display: block;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-primary, #111827);
  margin: 12px 0;
`;

const FileInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin: 12px 0;
`;

const StatusBadge = styled.span<{ $status: 'completed' | 'success' | 'error' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => 
    props.$status === 'completed' || props.$status === 'success' 
      ? 'rgba(34, 197, 94, 0.1)' 
      : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => 
    props.$status === 'completed' || props.$status === 'success'
      ? '#16a34a'
      : '#dc2626'};
`;

const ProgressSteps = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin: 12px 0;
`;

const Step = styled.span`
  font-size: 13px;
  color: #16a34a;
  padding: 4px 8px;
  background: rgba(34, 197, 94, 0.05);
  border-radius: 4px;
`;

const ErrorHeader = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 12px;
`;