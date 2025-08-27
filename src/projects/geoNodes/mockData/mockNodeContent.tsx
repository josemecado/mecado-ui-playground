// ============= JSX CONTENT GENERATORS =============
export const createStatusContent = (status: 'complete' | 'processing', executionTime?: string, estimatedTime?: string, progress?: number) => (
  <div style={{ fontSize: "12px" }}>
    <div
      style={{
        marginBottom: "12px",
        padding: "8px",
        background: "var(--bg-tertiary)",
        borderRadius: "4px",
      }}
    >
      <div style={{ color: status === 'complete' ? "var(--accent-primary)" : "#2196f3", fontWeight: "600" }}>
        {status === 'complete' ? '✓ Complete' : '⟳ Processing'}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "4px",
        }}
      >
        {status === 'complete' ? `Execution time: ${executionTime}` : `Estimated time: ${estimatedTime}`}
      </div>
      {status === 'processing' && progress && (
        <div
          style={{
            marginTop: "8px",
            background: "var(--bg-secondary)",
            height: "4px",
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              background: "#2196f3",
              height: "100%",
              borderRadius: "2px",
            }}
          />
        </div>
      )}
    </div>
  </div>
);

export const createPreprocessingStatusContent = () => (
  <div style={{ fontSize: "12px" }}>
    {createStatusContent('complete', '3.2s')}
    <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
      <strong>Input:</strong> assembly.step (18.4 MB)
    </div>
    <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
      <strong>Bodies:</strong> 12 solid bodies
    </div>
    <div style={{ color: "var(--text-muted)" }}>
      <strong>Last modified:</strong> 2 min ago
    </div>
  </div>
);

export const createPreprocessingResultsContent = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
        Geometry Cleanup
      </div>
      <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
        <div>• Small features: 234 removed</div>
        <div>• Sliver faces: 89 merged</div>
        <div>• Duplicate vertices: 1,247 merged</div>
      </div>
    </div>
    <div>
      <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
        Simplification
      </div>
      <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
        <div>• Original: 45,892 faces</div>
        <div>• Simplified: 12,341 faces</div>
        <div>• Reduction: 73%</div>
      </div>
    </div>
  </div>
);

export const createMeshingStatusContent = () => (
  <div style={{ fontSize: "12px" }}>
    {createStatusContent('processing', undefined, '15s', 45)}
    <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
      <strong>Method:</strong> Tetrahedral
    </div>
    <div style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
      <strong>Quality:</strong> High (refined)
    </div>
    <div style={{ color: "var(--text-primary)" }}>
      <strong>Target Size:</strong> 2.5mm
    </div>
  </div>
);

export const createMeshingResultsContent = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
        Mesh Statistics
      </div>
      <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
        <div>• Elements: Calculating...</div>
        <div>• Nodes: Calculating...</div>
        <div>• Average size: 2.5mm</div>
      </div>
    </div>
    <div style={{ marginBottom: "12px" }}>
      <div style={{ fontWeight: "600", marginBottom: "4px", color: "var(--text-primary)" }}>
        Quality Metrics
      </div>
      <div style={{ paddingLeft: "8px", color: "var(--text-muted)" }}>
        <div>• Min angle: Pending</div>
        <div>• Max aspect ratio: Pending</div>
        <div>• Skewness: Pending</div>
      </div>
    </div>
    <div
      style={{
        padding: "8px",
        background: "var(--bg-tertiary)",
        borderRadius: "4px",
        color: "var(--text-muted)",
        fontSize: "11px",
      }}
    >
      Results will be available once meshing completes
    </div>
  </div>
);

export const createMaterialsContent = (materials: Array<{name: string, properties: {E: string, v: string, density: string}}>) => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
      Assigned Materials
    </div>
    {materials.map((material, index) => (
      <div
        key={index}
        style={{
          marginBottom: index < materials.length - 1 ? "8px" : 0,
          padding: "8px",
          background: "var(--bg-tertiary)",
          borderRadius: "4px",
        }}
      >
        <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>{material.name}</div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "4px",
          }}
        >
          <div>E: {material.properties.E}</div>
          <div>ν: {material.properties.v}</div>
          <div>ρ: {material.properties.density}</div>
        </div>
      </div>
    ))}
  </div>
);

export const createEmptyMaterialsContent = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
      Not configured
    </div>
    <div style={{ color: "var(--text-muted)" }}>
      Materials will be assigned in the next step
    </div>
  </div>
);

export const createStepGeometry = () => (
  <div style={{ textAlign: "center" }}>
    <svg width="120" height="120" viewBox="0 0 120 120">
      <rect
        x="20"
        y="20"
        width="80"
        height="80"
        fill="var(--bg-tertiary)"
        stroke="var(--accent-primary)"
        strokeWidth="2"
        rx="4"
      />
      <rect
        x="30"
        y="30"
        width="60"
        height="60"
        fill="var(--bg-secondary)"
        stroke="var(--primary-action)"
        strokeWidth="1"
        rx="2"
      />
      <circle cx="60" cy="60" r="15" fill="var(--primary-action)" />
    </svg>
    <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
      Simplified Geometry
    </div>
  </div>
);

export const createMeshGeometry = () => (
  <div style={{ textAlign: "center" }}>
    <svg width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <pattern
          id="mesh-pattern"
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 10 0 L 5 8.66 Z"
            stroke="var(--text-muted)"
            strokeWidth="0.5"
            fill="none"
          />
        </pattern>
      </defs>
      <rect
        x="10"
        y="10"
        width="100"
        height="100"
        fill="url(#mesh-pattern)"
      />
    </svg>
    <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
      Generating Mesh...
    </div>
  </div>
);
