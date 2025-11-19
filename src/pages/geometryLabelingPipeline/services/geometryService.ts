// services/geometryService.ts
// Geometry classification management (maps to /api/geometry-classifications)

import {
    PendingGeometryClassification,
    ApprovedGeometryClassification,
    GeometryLabels,
    CreateClassificationInput,
    AddGeometryLabelInput,
} from '../types';
import { isFeatureEnabled } from '../config/featureFlags';
import { apiClient } from './apiClient';

// ============================================
// LOCAL DATA STORE (temporary)
// ============================================

let localPendingClassifications: PendingGeometryClassification[] = [];
let localApprovedClassifications: ApprovedGeometryClassification[] = [];
let localGeometryLabels: Map<string, GeometryLabels> = new Map();

// ============================================
// GEOMETRY SERVICE
// ============================================

export const geometryService = {
    // ============================================
    // PENDING CLASSIFICATIONS
    // ============================================

    /**
     * Create new pending classification
     */
    async createClassification(
        input: CreateClassificationInput,
        submittedBy: string
    ): Promise<PendingGeometryClassification> {
        if (isFeatureEnabled('USE_GEOMETRY_API')) {
            try {
                const response = await apiClient.post('/geometry-classifications', {
                    ...input,
                    submittedBy,
                });
                console.log('[GeometryService] Created classification via API:', response.data.id);
                return response.data;
            } catch (error) {
                console.error('[GeometryService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const newClassification: PendingGeometryClassification = {
            id: `class-${Date.now()}`,
            geometryId: input.geometryId,
            geometryType: input.geometryType,
            label: input.label,
            confidence: input.confidence,
            status: 'pending',
            submittedBy,
            submittedAt: new Date(),
        };

        localPendingClassifications = [newClassification, ...localPendingClassifications];
        console.log('[GeometryService] Created local classification:', newClassification.id);
        return newClassification;
    },

    /**
     * Get all pending classifications
     */
    async getPendingClassifications(): Promise<PendingGeometryClassification[]> {
        if (isFeatureEnabled('USE_GEOMETRY_API')) {
            try {
                const response = await apiClient.get('/geometry-classifications/pending');
                console.log('[GeometryService] Fetched pending classifications from API');
                return response.data.classifications;
            } catch (error) {
                console.error('[GeometryService] API failed, using local fallback:', error);
                return [...localPendingClassifications];
            }
        }

        console.log('[GeometryService] Using local pending classifications');
        return [...localPendingClassifications];
    },

    /**
     * Approve classification
     */
    async approveClassification(
        classificationId: string,
        reviewNotes: string,
        approvedBy: string
    ): Promise<ApprovedGeometryClassification> {
        if (isFeatureEnabled('USE_GEOMETRY_API')) {
            try {
                const response = await apiClient.post(
                    `/geometry-classifications/pending/${classificationId}/approve`,
                    { reviewNotes, approvedBy }
                );
                console.log('[GeometryService] Approved classification via API:', classificationId);
                return response.data;
            } catch (error) {
                console.error('[GeometryService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const pending = localPendingClassifications.find(c => c.id === classificationId);
        if (!pending) {
            throw new Error(`Classification ${classificationId} not found`);
        }

        const approved: ApprovedGeometryClassification = {
            id: pending.id,
            geometryId: pending.geometryId,
            classificationType: pending.geometryType,
            label: pending.label,
            confidence: pending.confidence,
            metadata: {},
            submittedBy: pending.submittedBy,
            submittedAt: pending.submittedAt,
            approvedBy,
            approvedAt: new Date(),
            version: 1,
        };

        localPendingClassifications = localPendingClassifications.filter(
            c => c.id !== classificationId
        );
        localApprovedClassifications = [approved, ...localApprovedClassifications];

        console.log('[GeometryService] Approved local classification:', classificationId);
        return approved;
    },

    /**
     * Reject classification
     */
    async rejectClassification(
        classificationId: string,
        reviewNotes: string
    ): Promise<PendingGeometryClassification> {
        if (isFeatureEnabled('USE_GEOMETRY_API')) {
            try {
                const response = await apiClient.post(
                    `/geometry-classifications/pending/${classificationId}/reject`,
                    { reviewNotes }
                );
                console.log('[GeometryService] Rejected classification via API:', classificationId);
                return response.data;
            } catch (error) {
                console.error('[GeometryService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const index = localPendingClassifications.findIndex(c => c.id === classificationId);
        if (index === -1) {
            throw new Error(`Classification ${classificationId} not found`);
        }

        localPendingClassifications[index].status = 'rejected';
        localPendingClassifications[index].reviewNotes = reviewNotes;

        console.log('[GeometryService] Rejected local classification:', classificationId);
        return localPendingClassifications[index];
    },

    // ============================================
    // GEOMETRY LABELS
    // ============================================

    /**
     * Get labels for a geometry element
     */
    async getGeometryLabels(modelId: string, geometryId: string): Promise<GeometryLabels | null> {
        if (isFeatureEnabled('USE_GEOMETRY_API')) {
            try {
                const response = await apiClient.get(
                    `/models/${modelId}/geometries/${geometryId}/labels`
                );
                console.log('[GeometryService] Fetched geometry labels from API');
                return response.data;
            } catch (error) {
                console.error('[GeometryService] API failed, using local fallback:', error);
                const key = `${modelId}-${geometryId}`;
                return localGeometryLabels.get(key) || null;
            }
        }

        // Local mock
        const key = `${modelId}-${geometryId}`;
        console.log('[GeometryService] Using local geometry labels');
        return localGeometryLabels.get(key) || null;
    },

    /**
     * Add label to geometry element
     */
    async addGeometryLabel(
        modelId: string,
        geometryId: string,
        input: AddGeometryLabelInput,
        addedBy: string
    ): Promise<GeometryLabels> {
        if (isFeatureEnabled('USE_GEOMETRY_API')) {
            try {
                const response = await apiClient.post(
                    `/models/${modelId}/geometries/${geometryId}/labels`,
                    { ...input, addedBy }
                );
                console.log('[GeometryService] Added geometry label via API');
                return response.data;
            } catch (error) {
                console.error('[GeometryService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const key = `${modelId}-${geometryId}`;
        let geometryLabels = localGeometryLabels.get(key);

        if (!geometryLabels) {
            geometryLabels = {
                modelId,
                geometryId,
                geometryType: input.geometryType,
                labels: [],
                lastModified: new Date(),
                lastModifiedBy: addedBy,
            };
        }

        geometryLabels.labels.push({
            labelId: input.labelId,
            labelName: input.labelName,
            addedBy,
            addedAt: new Date(),
            confidence: input.confidence,
        });
        geometryLabels.lastModified = new Date();
        geometryLabels.lastModifiedBy = addedBy;

        localGeometryLabels.set(key, geometryLabels);

        console.log('[GeometryService] Added geometry label locally');
        return geometryLabels;
    },
};

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).geometryService = geometryService;
    console.log('[GeometryService] Exposed to window.geometryService');
}