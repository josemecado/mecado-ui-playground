// services/projectService.ts
// Project CRUD operations (maps to /api/projects)

import { Project, CreateProjectInput } from '../types';
import { isFeatureEnabled } from '../config/featureFlags';
import { apiClient } from './apiClient';

// ============================================
// LOCAL DATA STORE (temporary)
// ============================================

let localProjects: Project[] = [];

// ============================================
// PROJECT SERVICE
// ============================================

export const projectService = {
    /**
     * Get all projects
     */
    async getAllProjects(): Promise<Project[]> {
        if (isFeatureEnabled('USE_PROJECT_API')) {
            try {
                const response = await apiClient.get('/projects');
                console.log('[ProjectService] Fetched projects from API');
                return response.data.projects;
            } catch (error) {
                console.error('[ProjectService] API failed, using local fallback:', error);
                return [...localProjects];
            }
        }

        console.log('[ProjectService] Using local projects:', localProjects.length);
        return [...localProjects];
    },

    /**
     * Get project by UUID
     */
    async getProjectById(projectId: string): Promise<Project | null> {
        if (isFeatureEnabled('USE_PROJECT_API')) {
            try {
                const response = await apiClient.get(`/projects/${projectId}`);
                console.log('[ProjectService] Fetched project from API:', projectId);
                return response.data;
            } catch (error) {
                console.error('[ProjectService] API failed, using local fallback:', error);
                const project = localProjects.find(p => p.projectId === projectId);
                return project || null;
            }
        }

        const project = localProjects.find(p => p.projectId === projectId);
        console.log('[ProjectService] Using local project:', projectId, project ? 'found' : 'not found');
        return project || null;
    },

    /**
     * Create new project
     */
    async createProject(input: CreateProjectInput, createdBy: string): Promise<Project> {
        if (isFeatureEnabled('USE_PROJECT_API')) {
            try {
                const response = await apiClient.post('/projects', { ...input, createdBy });
                console.log('[ProjectService] Created project via API:', response.data.projectId);
                return response.data;
            } catch (error) {
                console.error('[ProjectService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            projectId: crypto.randomUUID(),
            projectName: input.projectName,
            description: input.description,
            createdBy,
            createdAt: new Date(),
            lastModified: new Date(),
        };

        localProjects = [newProject, ...localProjects];
        console.log('[ProjectService] Created local project:', newProject.projectId);
        return newProject;
    },

    /**
     * Update project
     */
    async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
        if (isFeatureEnabled('USE_PROJECT_API')) {
            try {
                const response = await apiClient.patch(`/projects/${projectId}`, updates);
                console.log('[ProjectService] Updated project via API:', projectId);
                return response.data;
            } catch (error) {
                console.error('[ProjectService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        const index = localProjects.findIndex(p => p.projectId === projectId);
        if (index === -1) {
            throw new Error(`Project ${projectId} not found`);
        }

        localProjects[index] = {
            ...localProjects[index],
            ...updates,
            lastModified: new Date(),
        };

        console.log('[ProjectService] Updated local project:', projectId);
        return localProjects[index];
    },

    /**
     * Delete project
     */
    async deleteProject(projectId: string): Promise<void> {
        if (isFeatureEnabled('USE_PROJECT_API')) {
            try {
                await apiClient.delete(`/projects/${projectId}`);
                console.log('[ProjectService] Deleted project via API:', projectId);
                return;
            } catch (error) {
                console.error('[ProjectService] API failed, using local fallback:', error);
            }
        }

        // Local mock
        localProjects = localProjects.filter(p => p.projectId !== projectId);
        console.log('[ProjectService] Deleted local project:', projectId);
    },
};

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).projectService = projectService;
    console.log('[ProjectService] Exposed to window.projectService');
}