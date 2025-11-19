// services/labelService.ts
// Label vocabulary management (maps to /api/labels)

import {
    PendingLabel,
    ApprovedLabel,
    CreateLabelInput,
    ReviewLabelInput,
    LabelingScheme,
} from '../types';
import { isFeatureEnabled } from '../config/featureFlags';
import { apiClient } from './apiClient';

// ============================================
// LOCAL DATA STORE (temporary)
// ============================================

let localPendingLabels: PendingLabel[] = [];
let localApprovedLabels: ApprovedLabel[] = [];

// ============================================
// LABEL SERVICE
// ============================================

export const labelService = {
    // ============================================
    // PENDING LABELS
    // ============================================

    /**
     * Create new pending label
     */
    async createLabel(input: CreateLabelInput, proposedBy: string): Promise<PendingLabel> {
        if (isFeatureEnabled('USE_LABEL_API')) {
            try {
                const response = await apiClient.post('/labels', { ...input, proposedBy });
                console.log('[LabelService] Created label via API:', response.data.id);
                return response.data;
            } catch (error) {
                console.error('[LabelService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const newLabel: PendingLabel = {
            id: `label-${Date.now()}`,
            labelName: input.labelName,
            labelType: input.labelType,
            description: input.description,
            category: input.category,
            status: 'pending',
            proposedBy,
            proposedAt: new Date(),
        };

        localPendingLabels = [newLabel, ...localPendingLabels];
        console.log('[LabelService] Created local label:', newLabel.id);
        return newLabel;
    },

    /**
     * Get all pending labels
     */
    async getPendingLabels(): Promise<PendingLabel[]> {
        if (isFeatureEnabled('USE_LABEL_API')) {
            try {
                const response = await apiClient.get('/labels/pending');
                console.log('[LabelService] Fetched pending labels from API');
                return response.data.labels;
            } catch (error) {
                console.error('[LabelService] API failed, using local fallback:', error);
                return [...localPendingLabels];
            }
        }

        console.log('[LabelService] Using local pending labels:', localPendingLabels.length);
        return [...localPendingLabels];
    },

    /**
     * Approve pending label
     */
    async approveLabel(
        labelId: string,
        review: ReviewLabelInput,
        approvedBy: string
    ): Promise<ApprovedLabel> {
        if (isFeatureEnabled('USE_LABEL_API')) {
            try {
                const response = await apiClient.post(`/labels/pending/${labelId}/approve`, {
                    ...review,
                    approvedBy,
                });
                console.log('[LabelService] Approved label via API:', labelId);
                return response.data;
            } catch (error) {
                console.error('[LabelService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const pendingLabel = localPendingLabels.find(l => l.id === labelId);
        if (!pendingLabel) {
            throw new Error(`Label ${labelId} not found`);
        }

        const approvedLabel: ApprovedLabel = {
            id: pendingLabel.id,
            labelName: pendingLabel.labelName,
            labelType: pendingLabel.labelType,
            description: pendingLabel.description,
            category: pendingLabel.category,
            proposedBy: pendingLabel.proposedBy,
            proposedAt: pendingLabel.proposedAt,
            approvedBy,
            approvedAt: new Date(),
            usageCount: 0,
            isActive: true,
        };

        localPendingLabels = localPendingLabels.filter(l => l.id !== labelId);
        localApprovedLabels = [approvedLabel, ...localApprovedLabels];

        console.log('[LabelService] Approved local label:', labelId);
        return approvedLabel;
    },

    /**
     * Reject pending label
     */
    async rejectLabel(
        labelId: string,
        review: ReviewLabelInput
    ): Promise<PendingLabel> {
        if (isFeatureEnabled('USE_LABEL_API')) {
            try {
                const response = await apiClient.post(`/labels/pending/${labelId}/reject`, review);
                console.log('[LabelService] Rejected label via API:', labelId);
                return response.data;
            } catch (error) {
                console.error('[LabelService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const labelIndex = localPendingLabels.findIndex(l => l.id === labelId);
        if (labelIndex === -1) {
            throw new Error(`Label ${labelId} not found`);
        }

        localPendingLabels[labelIndex].status = 'rejected';
        localPendingLabels[labelIndex].reviewNotes = review.reviewNotes;

        console.log('[LabelService] Rejected local label:', labelId);
        return localPendingLabels[labelIndex];
    },

    // ============================================
    // APPROVED LABELS
    // ============================================

    /**
     * Get all approved labels
     */
    async getApprovedLabels(): Promise<ApprovedLabel[]> {
        if (isFeatureEnabled('USE_LABEL_API')) {
            try {
                const response = await apiClient.get('/labels/approved');
                console.log('[LabelService] Fetched approved labels from API');
                return response.data.labels;
            } catch (error) {
                console.error('[LabelService] API failed, using local fallback:', error);
                return [...localApprovedLabels];
            }
        }

        console.log('[LabelService] Using local approved labels:', localApprovedLabels.length);
        return [...localApprovedLabels];
    },

    /**
     * Get labeling scheme (organized by category)
     */
    async getLabelingScheme(): Promise<LabelingScheme> {
        const approvedLabels = await this.getApprovedLabels();

        return {
            functional: approvedLabels.filter(l => l.category === 'functional'),
            feature: approvedLabels.filter(l => l.category === 'feature'),
            part: approvedLabels.filter(l => l.category === 'part'),
            manufacturing: approvedLabels.filter(l => l.category === 'manufacturing'),
        };
    },

    /**
     * Deactivate label (soft delete)
     */
    async deactivateLabel(labelId: string): Promise<ApprovedLabel> {
        if (isFeatureEnabled('USE_LABEL_API')) {
            try {
                const response = await apiClient.post(`/labels/approved/${labelId}/deactivate`, {});
                console.log('[LabelService] Deactivated label via API:', labelId);
                return response.data;
            } catch (error) {
                console.error('[LabelService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const labelIndex = localApprovedLabels.findIndex(l => l.id === labelId);
        if (labelIndex === -1) {
            throw new Error(`Label ${labelId} not found`);
        }

        localApprovedLabels[labelIndex].isActive = false;

        console.log('[LabelService] Deactivated local label:', labelId);
        return localApprovedLabels[labelIndex];
    },
};

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).labelService = labelService;
    console.log('[LabelService] Exposed to window.labelService');
}