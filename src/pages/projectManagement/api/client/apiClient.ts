// services/apiClient.ts
// HTTP client for API calls (browser-compatible version)

interface ApiResponse<T = any> {
    data: T;
    status: number;
    headers?: Record<string, string>;
}

interface ApiError {
    message: string;
    status: number;
    details?: any;
}

// Configuration - Update these as needed
const API_CONFIG = {
    // Default API base URL (change this when you have a real backend)
    baseURL: '/api/v1',

    // Set to true to enable API calls (when backend is ready)
    enableAPI: false,
};

class ApiClient {
    private baseURL: string;

    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        console.log(`[ApiClient] Initialized with baseURL: ${this.baseURL}`);
    }

    private async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // TODO: Add authentication token when USE_AUTH_API is enabled
        // const token = localStorage.getItem('auth_token');
        // if (token) {
        //   defaultHeaders['Authorization'] = `Bearer ${token}`;
        // }

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        console.log(`[ApiClient] ${config.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    message: errorData.message || `HTTP Error ${response.status}`,
                    status: response.status,
                    details: errorData,
                } as ApiError;
            }

            const data = await response.json();

            return {
                data,
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
            };
        } catch (error: any) {
            if (error.status) {
                throw error; // Already formatted as ApiError
            }

            // Network or parsing error
            throw {
                message: error.message || 'Network error',
                status: 0,
                details: error,
            } as ApiError;
        }
    }

    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file directly to S3 using presigned URL
     */
    async uploadToS3(presignedUrl: string, file: File): Promise<void> {
        console.log(`[ApiClient] Uploading to S3: ${file.name} (${file.size} bytes)`);

        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        if (!response.ok) {
            throw new Error(`S3 upload failed: ${response.status} ${response.statusText}`);
        }

        console.log(`[ApiClient] S3 upload successful: ${file.name}`);
    }

    /**
     * Download file from S3 using presigned URL
     */
    async downloadFromS3(presignedUrl: string): Promise<Blob> {
        console.log(`[ApiClient] Downloading from S3`);

        const response = await fetch(presignedUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`S3 download failed: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log(`[ApiClient] S3 download successful (${blob.size} bytes)`);

        return blob;
    }

    /**
     * Update API configuration
     */
    updateConfig(config: Partial<typeof API_CONFIG>): void {
        if (config.baseURL) {
            this.baseURL = config.baseURL;
            console.log(`[ApiClient] Base URL updated to: ${this.baseURL}`);
        }
        Object.assign(API_CONFIG, config);
    }

    /**
     * Get current configuration
     */
    getConfig(): typeof API_CONFIG {
        return { ...API_CONFIG };
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, ApiError };

// Expose to window for easy configuration
if (typeof window !== 'undefined') {
    (window as any).apiClient = apiClient;
    console.log('[ApiClient] Exposed to window.apiClient for configuration');
    console.log('  - window.apiClient.updateConfig({ baseURL: "http://localhost:3000/api/v1" })');
    console.log('  - window.apiClient.getConfig()');
}