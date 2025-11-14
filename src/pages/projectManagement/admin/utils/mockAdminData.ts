// admin/utils/mockAdminData.ts
// Mock data for testing admin task management

import { UnifiedTask, User, TaskPriority } from '../types/admin.types';

// Mock users
export const mockUsers: User[] = [
    {
        id: 'user-1',
        username: 'jose',
        email: 'jose@mecado.com',
        role: 'labeler',
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

// Helper to create tasks with different stages
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
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
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

// Tasks in different stages
export const mockAdminTasks: UnifiedTask[] = [
    // ========================================
    // IN PROGRESS - User working on these
    // ========================================

    // 1. Pending Upload
    createMockTask('task-1', 'pending_upload', {
        title: 'Label bolt hole mating faces',
        description: 'Identify and label all bolt hole mating faces on the flange assembly',
        requirements: 'Upload the flange assembly STEP file. Ensure the file includes all mounting surfaces.',
        priority: 'high',
        assignedTo: 'jose@mecado.com',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [],
        },
        labelingData: {
            labels: [],
        },
    }),

    createMockTask('task-2', 'pending_upload', {
        title: 'Upload bracket assembly models',
        description: 'Upload 4 mounting plate bracket models for classification',
        requirements: 'Models should be in STEP format. Include left and right variants.',
        priority: 'medium',
        assignedTo: 'maria@mecado.com',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        uploadData: {
            requiredFileCount: 4,
            uploadedFiles: [],
        },
    }),

    // 2. Upload Approved - Ready for labeling
    createMockTask('task-3', 'upload_approved', {
        title: 'Label fillet edges on housing',
        description: 'Identify all fillet edges on the motor housing assembly',
        requirements: 'Focus on external fillets only. Ignore internal features.',
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
                notes: 'File looks good. All surfaces are clean.',
            },
        },
        labelingData: {
            labels: [],
        },
        history: [
            {
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                action: 'created',
                user: 'aidan@mecado.com',
            },
            {
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                action: 'files_uploaded',
                user: 'jose@mecado.com',
                notes: 'Uploaded 1 file',
            },
            {
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                action: 'upload_approved',
                user: 'aidan@mecado.com',
                notes: 'File looks good. All surfaces are clean.',
            },
        ],
    }),

    // 3. Pending Labeling
    createMockTask('task-4', 'pending_labeling', {
        title: 'Classify shaft geometry',
        description: 'Label the complete shaft assembly with appropriate feature labels',
        priority: 'urgent',
        assignedTo: 'maria@mecado.com',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow!
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'shaft_complete.step',
                    size: 1536000,
                    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Ready for labeling',
            },
        },
        labelingData: {
            labels: [],
            geometryType: 'body',
        },
    }),

    // ========================================
    // NEEDS REVIEW - Admin action required
    // ========================================

    // 4. Upload Review
    createMockTask('task-5', 'upload_review', {
        title: 'Label chamfer features',
        description: 'Identify chamfer edges on the mounting bracket',
        priority: 'medium',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 2,
            uploadedFiles: [
                {
                    name: 'bracket_left.step',
                    size: 1024000,
                    uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                },
                {
                    name: 'bracket_right.step',
                    size: 1056000,
                    uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                },
            ],
        },
        history: [
            {
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                action: 'created',
                user: 'aidan@mecado.com',
            },
            {
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                action: 'files_uploaded',
                user: 'jose@mecado.com',
                notes: 'Uploaded 2 files',
            },
        ],
    }),

    createMockTask('task-6', 'upload_review', {
        title: 'Upload valve assembly parts',
        description: 'Upload complete valve assembly for feature extraction',
        priority: 'high',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 3,
            uploadedFiles: [
                {
                    name: 'valve_body.step',
                    size: 3072000,
                    uploadedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
                },
                {
                    name: 'valve_stem.step',
                    size: 512000,
                    uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
                },
                {
                    name: 'valve_seat.step',
                    size: 768000,
                    uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
                },
            ],
        },
    }),

    // 5. Labeling Review
    createMockTask('task-7', 'labeling_review', {
        title: 'Label bolt head faces',
        description: 'Classify all bolt head mating surfaces',
        priority: 'medium',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'bolt_m8_v1.step',
                    size: 204800,
                    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'File accepted',
            },
        },
        labelingData: {
            labels: ['bolt_head', 'hex_socket', 'mating_face', 'thread_m8'],
            geometryType: 'body',
            confidence: 0.95,
        },
        history: [
            {
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                action: 'created',
                user: 'aidan@mecado.com',
            },
            {
                timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                action: 'files_uploaded',
                user: 'jose@mecado.com',
            },
            {
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                action: 'upload_approved',
                user: 'aidan@mecado.com',
            },
            {
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
                action: 'labels_submitted',
                user: 'jose@mecado.com',
                notes: 'Submitted 4 labels',
            },
        ],
    }),

    createMockTask('task-8', 'labeling_review', {
        title: 'Identify edge transitions',
        description: 'Label all edge transitions on housing cover',
        priority: 'low',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'housing_cover.step',
                    size: 1536000,
                    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Good to proceed',
            },
        },
        labelingData: {
            labels: ['fillet', 'chamfer', 'sharp_edge'],
            geometryType: 'edge',
            confidence: 0.88,
        },
    }),

    // ========================================
    // COMPLETED
    // ========================================

    createMockTask('task-9', 'completed', {
        title: 'Label gasket seal surfaces',
        description: 'Identify all gasket mating surfaces on the flange',
        priority: 'high',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'gasket_seal.step',
                    size: 819200,
                    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'File approved',
            },
        },
        labelingData: {
            labels: ['gasket_surface', 'mating_face', 'seal_groove'],
            geometryType: 'face',
            confidence: 0.98,
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Excellent labeling. All surfaces correctly identified.',
            },
        },
    }),

    createMockTask('task-10', 'labeling_approved', {
        title: 'Upload complete shaft assembly',
        description: 'Label all features on the primary shaft',
        priority: 'medium',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'shaft_primary.step',
                    size: 2457600,
                    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Ready for work',
            },
        },
        labelingData: {
            labels: ['cylinder', 'shoulder', 'keyway', 'thread_m12'],
            geometryType: 'body',
            confidence: 0.92,
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'All features correctly identified',
            },
        },
    }),

    // ========================================
    // FAILED
    // ========================================

    createMockTask('task-11', 'failed', {
        title: 'Label edge transitions',
        description: 'Identify transitions on the housing',
        priority: 'medium',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'housing_cover.step',
                    size: 1638400,
                    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                approved: false,
                notes: 'File is corrupted. Please re-export from CAD software and reupload.',
            },
        },
    }),

    createMockTask('task-12', 'failed', {
        title: 'Upload valve assembly parts',
        description: 'Label valve body features',
        priority: 'low',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'valve_body.step',
                    size: 2048000,
                    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Approved',
            },
        },
        labelingData: {
            labels: ['inlet_port', 'outlet_port'],
            geometryType: 'body',
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                approved: false,
                notes: 'Incorrect labels. This is a fillet, not a chamfer. Please revise.',
            },
        },
    }),
];

// Get user by email
export const getUserByEmail = (email: string): User | undefined => {
    return mockUsers.find((u) => u.email === email);
};

// Get tasks by assignee
export const getTasksByAssignee = (email: string): UnifiedTask[] => {
    return mockAdminTasks.filter((t) => t.assignedTo === email);
};

// Get tasks by stage
export const getTasksByStage = (stage: UnifiedTask['stage']): UnifiedTask[] => {
    return mockAdminTasks.filter((t) => t.stage === stage);
};