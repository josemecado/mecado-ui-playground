// config/featureFlags.ts
// Feature flag system for gradual API integration (browser-compatible)

export interface ApiFeatureFlags {
    USE_TASK_API: boolean;
    USE_FILE_API: boolean;
    USE_LABEL_API: boolean;
    USE_CLASSIFICATION_API: boolean;
    USE_AUTH_API: boolean;
}

export const API_FEATURES: ApiFeatureFlags = {
    USE_TASK_API: false,           // Task CRUD operations
    USE_FILE_API: false,           // File upload/download to S3
    USE_LABEL_API: false,          // Label management (approved_labels)
    USE_CLASSIFICATION_API: false, // Geometry labeling (geometry_classifications)
    USE_AUTH_API: false,           // User authentication
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof ApiFeatureFlags): boolean => {
    return API_FEATURES[feature];
};

/**
 * Toggle a feature flag (for development/testing)
 */
export const toggleFeature = (feature: keyof ApiFeatureFlags): void => {
    API_FEATURES[feature] = !API_FEATURES[feature];
    console.log(`[FeatureFlags] ${feature} is now ${API_FEATURES[feature] ? 'ENABLED ✅' : 'DISABLED ❌'}`);
};

/**
 * Enable all features at once
 */
export const enableAllFeatures = (): void => {
    Object.keys(API_FEATURES).forEach(key => {
        API_FEATURES[key as keyof ApiFeatureFlags] = true;
    });
    console.log('[FeatureFlags] All features ENABLED ✅');
};

/**
 * Disable all features at once
 */
export const disableAllFeatures = (): void => {
    Object.keys(API_FEATURES).forEach(key => {
        API_FEATURES[key as keyof ApiFeatureFlags] = false;
    });
    console.log('[FeatureFlags] All features DISABLED ❌');
};

/**
 * Get current feature flag state
 */
export const getCurrentFlags = (): ApiFeatureFlags => {
    return { ...API_FEATURES };
};

if (typeof window !== 'undefined') {
    (window as any).featureFlags = {
        current: API_FEATURES,
        toggle: toggleFeature,
        enableAll: enableAllFeatures,
        disableAll: disableAllFeatures,
        getCurrent: getCurrentFlags,
    };

    console.log('[FeatureFlags] Initialized. Access via window.featureFlags');
    console.log('  - window.featureFlags.current    // View current flags');
    console.log('  - window.featureFlags.toggle(\'USE_TASK_API\')  // Toggle a flag');
    console.log('  - window.featureFlags.enableAll()  // Enable all flags');
    console.log('  - window.featureFlags.disableAll() // Disable all flags');
}