// types/geometry.types.ts
// Geometry-related types for VTK.js visualization and classification

export type GeometryType = 'edge' | 'face' | 'body';

export type ClassificationStatus =
    | 'pending'
    | 'under_review'
    | 'approved'
    | 'rejected';

// For VTK.js visualization
export interface GeometryData {
    bodiesFile?: string;    // Path to bodies VTP
    facesFile?: string;     // Path to faces VTP
    edgesFile?: string;     // Path to edges VTP
    fileName?: string;      // Original filename
}

// Pending classification
export interface PendingGeometryClassification {
    id: string;
    geometryId: string;
    geometryType: GeometryType;
    label: string;
    confidence?: number;
    status: ClassificationStatus;
    submittedBy: string;    // User ID
    submittedAt: Date;
    reviewNotes?: string;
}

// Approved classification
export interface ApprovedGeometryClassification {
    id: string;
    geometryId: string;
    classificationType: GeometryType;
    label: string;
    confidence?: number;
    metadata?: Record<string, any>;
    submittedBy: string;    // User ID
    submittedAt: Date;
    approvedBy: string;     // User ID
    approvedAt: Date;
    version: number;
}

// For assigning labels to geometry elements
export interface GeometryLabel {
    labelId: string;
    labelName: string;
    addedBy: string;        // Username
    addedAt: Date;
    confidence?: number;
}

export interface GeometryLabels {
    modelId: string;
    geometryId: string;
    geometryType: GeometryType;
    labels: GeometryLabel[];
    modelVersion?: string;
    lastModified: Date;
    lastModifiedBy: string;
}

export interface CreateClassificationInput {
    geometryId: string;
    geometryType: GeometryType;
    label: string;
    confidence?: number;
}

export interface AddGeometryLabelInput {
    labelId: string;
    labelName: string;
    geometryType: GeometryType;
    confidence?: number;
}