// config/featureFlags.ts
// Feature flags for gradual API integration

export interface FeatureFlags {
    // Task API
    USE_TASK_API: boolean;

    // Project & File API
    USE_PROJECT_API: boolean;
    USE_FILE_API: boolean;

    // Label API
    USE_LABEL_API: boolean;

    // Geometry API
    USE_GEOMETRY_API: boolean;

    // Authentication API
    USE_AUTH_API: boolean;

    // S3 Direct Upload/Download
    USE_S3_DIRECT: boolean;
}

// Current feature flags (all false for local development)
export const API_FEATURES: FeatureFlags = {
    USE_TASK_API: false,
    USE_PROJECT_API: false,
    USE_FILE_API: false,
    USE_LABEL_API: false,
    USE_GEOMETRY_API: false,
    USE_AUTH_API: false,
    USE_S3_DIRECT: false,
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return API_FEATURES[feature] ?? false;
}

/**
 * Enable a feature flag
 */
export function enableFeature(feature: keyof FeatureFlags): void {
    API_FEATURES[feature] = true;
    console.log(`[FeatureFlags] Enabled: ${feature}`);
}

/**
 * Disable a feature flag
 */
export function disableFeature(feature: keyof FeatureFlags): void {
    API_FEATURES[feature] = false;
    console.log(`[FeatureFlags] Disabled: ${feature}`);
}

/**
 * Toggle a feature flag
 */
export function toggleFeature(feature: keyof FeatureFlags): void {
    API_FEATURES[feature] = !API_FEATURES[feature];
    console.log(`[FeatureFlags] Toggled ${feature}: ${API_FEATURES[feature]}`);
}

/**
 * Enable all features (for production)
 */
export function enableAllFeatures(): void {
    Object.keys(API_FEATURES).forEach(key => {
        API_FEATURES[key as keyof FeatureFlags] = true;
    });
    console.log('[FeatureFlags] All features enabled');
}

/**
 * Disable all features (for local development)
 */
export function disableAllFeatures(): void {
    Object.keys(API_FEATURES).forEach(key => {
        API_FEATURES[key as keyof FeatureFlags] = false;
    });
    console.log('[FeatureFlags] All features disabled');
}

/**
 * Get current feature flags state
 */
export function getFeatureFlags(): FeatureFlags {
    return { ...API_FEATURES };
}

// Expose to window for easy debugging
if (typeof window !== 'undefined') {
    (window as any).featureFlags = {
        current: API_FEATURES,
        enable: enableFeature,
        disable: disableFeature,
        toggle: toggleFeature,
        enableAll: enableAllFeatures,
        disableAll: disableAllFeatures,
        getAll: getFeatureFlags,
    };
    console.log('[FeatureFlags] Exposed to window.featureFlags for debugging');
    console.log('  - window.featureFlags.current       // View all flags');
    console.log('  - window.featureFlags.enable("USE_TASK_API")');
    console.log('  - window.featureFlags.enableAll()   // Enable all');
}