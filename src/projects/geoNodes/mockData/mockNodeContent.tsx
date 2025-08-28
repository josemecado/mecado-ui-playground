import React from "react";

// ============= EMPTY GEOMETRY UI =============
export const createEmptyGeometryUI = () => (
  <div style={{ 
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px"
  }}>
    <svg width="80" height="80" viewBox="0 0 80 80" style={{ opacity: 0.3 }}>
      <rect
        x="10"
        y="10"
        width="60"
        height="60"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="2"
        strokeDasharray="5,5"
        rx="8"
      />
      <path
        d="M 25 40 L 35 50 L 55 30"
        stroke="var(--text-muted)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div style={{ 
      fontSize: "13px", 
      color: "var(--text-muted)",
      fontWeight: "500"
    }}>
      No Geometry Loaded
    </div>
  </div>
);

// ============= STATUS PANEL CONTENTS =============
export const createPreprocessingStatusPanel = () => (
  <div style={{ fontSize: "12px" }}>
    <div
      style={{
        marginBottom: "12px",
        padding: "8px",
        background: "var(--bg-tertiary)",
        borderRadius: "4px",
      }}
    >
      <div style={{ 
        color: "var(--accent-primary)", 
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        <span>✓</span>
        <span>Complete</span>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "4px",
        }}
      >
        Execution time: 3.2s
      </div>
    </div>
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

export const createMeshingStatusPanel = () => (
  <div style={{ fontSize: "12px" }}>
    <div
      style={{
        marginBottom: "12px",
        padding: "8px",
        background: "var(--bg-tertiary)",
        borderRadius: "4px",
      }}
    >
      <div style={{ 
        color: "#2196f3", 
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}>
        <span>⟳</span>
        <span>Processing</span>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "4px",
        }}
      >
        Estimated time: 15s remaining
      </div>
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
            width: "45%",
            background: "#2196f3",
            height: "100%",
            borderRadius: "2px",
            transition: "width 0.3s ease"
          }}
        />
      </div>
    </div>
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

// ============= RESULTS PANEL CONTENTS =============
export const createPreprocessingResultsPanel = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
        Performance Metrics
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px"
      }}>
        <div style={{
          padding: "8px",
          background: "var(--bg-tertiary)",
          borderRadius: "4px",
        }}>
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-muted)",
            marginBottom: "4px"
          }}>
            Margin of Safety
          </div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "600",
            color: "#4CAF50"
          }}>
            +12.3%
          </div>
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-muted)"
          }}>
            vs. baseline
          </div>
        </div>
        <div style={{
          padding: "8px",
          background: "var(--bg-tertiary)",
          borderRadius: "4px",
        }}>
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-muted)",
            marginBottom: "4px"
          }}>
            Total Mass
          </div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "600",
            color: "var(--text-primary)"
          }}>
            45.2 kg
          </div>
          <div style={{ 
            fontSize: "10px", 
            color: "#FF9800"
          }}>
            -8.1% reduction
          </div>
        </div>
      </div>
    </div>
    
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

export const createMeshingResultsPanel = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontWeight: "600", marginBottom: "8px", color: "var(--text-primary)" }}>
        Performance Metrics
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px"
      }}>
        <div style={{
          padding: "8px",
          background: "var(--bg-tertiary)",
          borderRadius: "4px",
        }}>
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-muted)",
            marginBottom: "4px"
          }}>
            Margin of Safety
          </div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "600",
            color: "#f44336"
          }}>
            -3.7%
          </div>
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-muted)"
          }}>
            vs. baseline
          </div>
        </div>
        <div style={{
          padding: "8px",
          background: "var(--bg-tertiary)",
          borderRadius: "4px",
        }}>
          <div style={{ 
            fontSize: "10px", 
            color: "var(--text-muted)",
            marginBottom: "4px"
          }}>
            Total Mass
          </div>
          <div style={{ 
            fontSize: "16px", 
            fontWeight: "600",
            color: "var(--text-primary)"
          }}>
            42.8 kg
          </div>
          <div style={{ 
            fontSize: "10px", 
            color: "#4CAF50"
          }}>
            -12.4% reduction
          </div>
        </div>
      </div>
    </div>
    
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
    
    <div>
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
        marginTop: "12px",
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

// ============= MATERIALS PANEL CONTENTS =============
export const createPreprocessingMaterialsPanel = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ 
      padding: "12px",
      background: "var(--bg-tertiary)",
      borderRadius: "4px",
      textAlign: "center"
    }}>
      <div style={{ 
        fontSize: "11px", 
        color: "var(--text-muted)",
        marginBottom: "8px"
      }}>
        No materials assigned
      </div>
      <div style={{ 
        color: "var(--text-primary)",
        fontWeight: "500"
      }}>
        Materials will be configured in the next step
      </div>
    </div>
    <div style={{
      marginTop: "12px",
      padding: "8px",
      border: "1px dashed var(--border-bg)",
      borderRadius: "4px",
      fontSize: "11px",
      color: "var(--text-muted)"
    }}>
      Tip: Assign materials after mesh generation for optimal results
    </div>
  </div>
);

export const createMeshingMaterialsPanel = () => (
  <div style={{ fontSize: "12px" }}>
    <div style={{ fontWeight: "600", marginBottom: "12px", color: "var(--text-primary)" }}>
      Assigned Materials
    </div>
    
    <div style={{
      marginBottom: "8px",
      padding: "10px",
      background: "var(--bg-tertiary)",
      borderRadius: "4px",
      border: "1px solid var(--border-bg)"
    }}>
      <div style={{ 
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}>
        <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>
          Aluminum 6061-T6
        </div>
        <span style={{
          fontSize: "10px",
          padding: "2px 6px",
          background: "var(--primary-action)",
          color: "white",
          borderRadius: "3px"
        }}>
          Primary
        </span>
      </div>
      <div style={{
        fontSize: "11px",
        color: "var(--text-muted)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px"
      }}>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Young's</div>
          <div>68.9 GPa</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Poisson's</div>
          <div>0.33</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Density</div>
          <div>2700 kg/m³</div>
        </div>
      </div>
    </div>
    
    <div style={{
      marginBottom: "8px",
      padding: "10px",
      background: "var(--bg-tertiary)",
      borderRadius: "4px",
      border: "1px solid var(--border-bg)"
    }}>
      <div style={{ 
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px"
      }}>
        <div style={{ fontWeight: "500", color: "var(--text-primary)" }}>
          Steel AISI 304
        </div>
        <span style={{
          fontSize: "10px",
          padding: "2px 6px",
          background: "var(--bg-secondary)",
          color: "var(--text-muted)",
          borderRadius: "3px",
          border: "1px solid var(--border-bg)"
        }}>
          Secondary
        </span>
      </div>
      <div style={{
        fontSize: "11px",
        color: "var(--text-muted)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px"
      }}>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Young's</div>
          <div>193 GPa</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Poisson's</div>
          <div>0.29</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", opacity: 0.7 }}>Density</div>
          <div>8000 kg/m³</div>
        </div>
      </div>
    </div>
    
    <div style={{
      marginTop: "12px",
      padding: "8px",
      background: "var(--bg-primary)",
      borderRadius: "4px",
      fontSize: "11px",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      gap: "6px"
    }}>
      <span>ℹ️</span>
      <span>Material assignment: 65% Al, 35% Steel</span>
    </div>
  </div>
);