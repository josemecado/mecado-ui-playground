// types/label.types.ts
// Label management types (maps to backend /api/labels)

export type LabelStatus = 'pending' | 'approved' | 'rejected';

export type LabelCategory =
    | 'functional'       // Functional labels (e.g., mating face)
    | 'feature'         // Feature labels (e.g., bolt hole, fillet)
    | 'part'            // Part labels (e.g., bolt, nut, flange)
    | 'manufacturing';  // Manufacturing/fabrication methods

export interface PendingLabel {
    id: string;
    labelName: string;
    labelType: string;
    description: string;
    category: LabelCategory;
    status: LabelStatus;
    proposedBy: string;      // User ID
    proposedAt: Date;
    reviewNotes?: string;
}

export interface ApprovedLabel {
    id: string;
    labelName: string;
    labelType: string;
    description: string;
    category: LabelCategory;
    proposedBy: string;      // User ID
    proposedAt: Date;
    approvedBy: string;      // User ID
    approvedAt: Date;
    usageCount: number;
    isActive: boolean;
}

export interface CreateLabelInput {
    labelName: string;
    labelType: string;
    description: string;
    category: LabelCategory;
}

export interface ReviewLabelInput {
    reviewNotes: string;
}

// Label vocabulary (master labeling scheme)
export interface LabelingScheme {
    functional: ApprovedLabel[];
    feature: ApprovedLabel[];
    part: ApprovedLabel[];
    manufacturing: ApprovedLabel[];
}