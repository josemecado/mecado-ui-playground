// services/mockData.ts
// Consolidated mock data for local development
// This file will be used until API is fully integrated

import { User, UnifiedTask, TaskPriority } from '../types';

// ============================================
// MOCK USERS
// ============================================

export const mockUsers: User[] = [
    {
        id: 'user-1',
        username: 'jose',
        email: 'jose@mecado.com',
        role: 'admin',
    },
    {
        id: 'user-2',
        username: 'aidan',
        email: 'aidan@mecado.com',
        role: 'admin',
    },
    {
        id: 'user-3',
        username: 'elie',
        email: 'elie@mecado.com',
        role: 'admin',
    },
    {
        id: 'user-4',
        username: 'dylan',
        email: 'dylan@mecado.com',
        role: 'admin',
    },
    {
        id: 'user-5',
        username: 'maria',
        email: 'maria@mecado.com',
        role: 'labeler',
    },
    {
        id: 'user-6',
        username: 'alex',
        email: 'alex@mecado.com',
        role: 'reviewer',
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const createMockTask = (
    id: string,
    stage: UnifiedTask['stage'],
    overrides?: Partial<UnifiedTask>
): UnifiedTask => {
    const baseTask: UnifiedTask = {
        id,
        stage,
        priority: 'medium',
        title: 'Task Title',
        description: 'Task description',
        assignedTo: 'jose@mecado.com',
        createdBy: 'aidan@mecado.com',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        history: [
            {
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                action: 'created',
                user: 'aidan@mecado.com',
                notes: 'Task created and assigned',
            },
        ],
        ...overrides,
    };

    return baseTask;
};

// ============================================
// MOCK TASKS
// ============================================

export const mockTasks: UnifiedTask[] = [
    // Pending Upload
    createMockTask('task-1', 'pending_upload', {
        title: 'Flange Assembly - Bolt Hole Analysis',
        description: 'Analyze and classify bolt hole mating faces and mounting surfaces on the main flange assembly component',
        requirements: 'Upload STEP file of flange assembly. Ensure all mounting surfaces and bolt hole features are visible.',
        priority: 'high',
        assignedTo: 'jose@mecado.com',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        referenceLinks: ['https://example.com/flange-specs.pdf'],
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [],
        },
        labelingData: {
            labels: [],
        },
    }),

    createMockTask('task-2', 'pending_upload', {
        title: 'Mounting Bracket Set A - Left & Right Variants',
        description: 'Process mounting plate bracket assemblies including left-hand and right-hand configurations',
        requirements: 'Upload 4 STEP files: 2 left-hand variants and 2 right-hand variants.',
        priority: 'medium',
        assignedTo: 'maria@mecado.com',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        uploadData: {
            requiredFileCount: 4,
            uploadedFiles: [],
        },
        labelingData: {
            labels: [],
        },
    }),

    // Upload Approved
    createMockTask('task-3', 'upload_approved', {
        title: 'Motor Housing Assembly - External Features',
        description: 'Classify fillet edges, chamfers, and external mounting surfaces on motor housing assembly',
        priority: 'high',
        assignedTo: 'jose@mecado.com',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'motor_housing_v3.step',
                    size: 2048000,
                    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'File looks good. All external surfaces are clean.',
            },
        },
        labelingData: {
            labels: [],
        },
    }),

    // Upload Review
    createMockTask('task-4', 'upload_review', {
        title: 'Bracket Assembly - Chamfer Features',
        description: 'Identify and classify chamfered edges on mounting bracket assembly components',
        priority: 'medium',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 2,
            uploadedFiles: [
                {
                    name: 'bracket_left_v2.step',
                    size: 1024000,
                    uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                },
                {
                    name: 'bracket_right_v2.step',
                    size: 1056000,
                    uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                },
            ],
        },
        labelingData: {
            labels: [],
        },
    }),

    // Labeling Review
    createMockTask('task-5', 'labeling_review', {
        title: 'M8 Bolt Standard - Head Geometry',
        description: 'Standard M8 bolt head geometry classification',
        priority: 'medium',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'bolt_m8_iso4762.step',
                    size: 204800,
                    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Geometry file accepted.',
            },
        },
        labelingData: {
            labels: ['bolt_head', 'hex_socket', 'mating_face', 'thread_m8'],
            geometryType: 'body',
            confidence: 0.95,
        },
    }),

    // Completed
    createMockTask('task-6', 'completed', {
        title: 'Gasket Flange - Seal Surfaces',
        description: 'Gasket mating surface classification for pressure vessel flange assembly',
        priority: 'high',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'flange_gasket_150lb.step',
                    size: 819200,
                    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'File geometry validated.',
            },
        },
        labelingData: {
            labels: ['gasket_surface', 'mating_face', 'seal_groove', 'raised_face'],
            geometryType: 'face',
            confidence: 0.98,
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Excellent work. All critical sealing surfaces correctly identified.',
            },
        },
    }),

    // Unassigned Task
    createMockTask('task-7', 'pending_upload', {
        title: 'Pump Housing - Internal Passages',
        description: 'Centrifugal pump housing with internal flow passages',
        priority: 'medium',
        assignedTo: undefined, // Unassigned
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [],
        },
        labelingData: {
            labels: [],
        },
    }),
];

// ============================================
// HELPER FUNCTIONS FOR MOCK DATA
// ============================================

export function getUserByEmail(email: string): User | undefined {
    return mockUsers.find(u => u.email === email);
}

export function getTasksByAssignee(email: string): UnifiedTask[] {
    return mockTasks.filter(t => t.assignedTo === email);
}

export function getTasksByStage(stage: UnifiedTask['stage']): UnifiedTask[] {
    return mockTasks.filter(t => t.stage === stage);
}