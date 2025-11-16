// admin/utils/mockAdminData.ts
// Mock data for testing admin task management - Updated with realistic task titles

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

// Tasks in different stages
export const mockAdminTasks: UnifiedTask[] = [
    // ========================================
    // ASSIGNED/TO DO - User working on these
    // ========================================

    // 1. Pending Upload
    createMockTask('task-1', 'pending_upload', {
        title: 'Flange Assembly - Bolt Hole Analysis',
        description: 'Analyze and classify bolt hole mating faces and mounting surfaces on the main flange assembly component',
        requirements: 'Upload STEP file of flange assembly. Ensure all mounting surfaces and bolt hole features are visible. File should be clean with no missing geometry.',
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
        description: 'Process mounting plate bracket assemblies including left-hand and right-hand configurations for feature classification',
        requirements: 'Upload 4 STEP files: 2 left-hand variants and 2 right-hand variants. All files must be properly oriented with Z-axis up.',
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

    // 2. Upload Approved - Ready for labeling
    createMockTask('task-3', 'upload_approved', {
        title: 'Motor Housing Assembly - External Features',
        description: 'Classify fillet edges, chamfers, and external mounting surfaces on motor housing assembly',
        requirements: 'Focus on external features only. Internal cooling channels and bolt holes can be ignored for this task.',
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
                notes: 'File looks good. All external surfaces are clean and properly exported.',
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
                notes: 'File looks good. All external surfaces are clean and properly exported.',
            },
        ],
    }),

    // 3. Pending Labeling
    createMockTask('task-4', 'pending_labeling', {
        title: 'Primary Drive Shaft - Complete Feature Set',
        description: 'Full geometric feature classification for primary drive shaft including threads, keyways, shoulders, and bearing surfaces',
        requirements: 'Label all cylindrical features, shoulders, keyways, threads, and any chamfers. Pay special attention to bearing seat tolerances.',
        priority: 'urgent',
        assignedTo: 'maria@mecado.com',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'shaft_primary_drive.step',
                    size: 1536000,
                    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Geometry is clean. Ready for feature labeling.',
            },
        },
        labelingData: {
            labels: [],
            geometryType: 'body',
        },
    }),

    // ========================================
    // AWAITING REVIEW - Admin action required
    // ========================================

    // 4. Upload Review
    createMockTask('task-5', 'upload_review', {
        title: 'Bracket Assembly - Chamfer Features',
        description: 'Identify and classify chamfered edges on mounting bracket assembly components',
        requirements: 'Upload left and right bracket variants. Ensure all edge features are clearly visible in the geometry.',
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
        title: 'Control Valve Assembly - Multi-Part',
        description: 'Complete valve assembly with body, stem, and seat components for geometric feature extraction',
        requirements: 'Upload all 3 components: valve body, stem, and seat. Files should be properly aligned and oriented.',
        priority: 'high',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 3,
            uploadedFiles: [
                {
                    name: 'valve_body_main.step',
                    size: 3072000,
                    uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
                },
                {
                    name: 'valve_stem_actuator.step',
                    size: 512000,
                    uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
                },
                {
                    name: 'valve_seat_assembly.step',
                    size: 768000,
                    uploadedAt: new Date(Date.now() - 30 * 60 * 1000),
                },
            ],
        },
        labelingData: {
            labels: [],
        },
    }),

    // 5. Labeling Review
    createMockTask('task-7', 'labeling_review', {
        title: 'M8 Bolt Standard - Head Geometry',
        description: 'Standard M8 bolt head geometry classification including hex socket, mating surfaces, and thread features',
        requirements: 'Label hex socket geometry, bolt head mating face, and external thread features. Reference ISO 4762 standard.',
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
                notes: 'Geometry file accepted. Proceed with labeling.',
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
                notes: 'Submitted 4 labels for review',
            },
        ],
    }),

    createMockTask('task-8', 'labeling_review', {
        title: 'Housing Cover - Edge Transitions',
        description: 'Edge feature classification for housing cover including fillets, chamfers, and sharp edges',
        requirements: 'Classify all visible edge transitions. Distinguish between functional edges (sealing surfaces) and aesthetic edges (external chamfers).',
        priority: 'low',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'housing_cover_top.step',
                    size: 1536000,
                    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Good geometry. Proceed with edge classification.',
            },
        },
        labelingData: {
            labels: ['fillet_r3', 'chamfer_1x45', 'sharp_edge'],
            geometryType: 'edge',
            confidence: 0.88,
        },
    }),

    // ========================================
    // COMPLETED
    // ========================================

    createMockTask('task-9', 'completed', {
        title: 'Gasket Flange - Seal Surfaces',
        description: 'Gasket mating surface classification for pressure vessel flange assembly',
        requirements: 'Identify all gasket contact surfaces, seal grooves, and critical sealing geometry. Reference ASME B16.5 flange standard.',
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
                notes: 'File geometry validated against ASME standard.',
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
                notes: 'Excellent work. All critical sealing surfaces correctly identified and classified.',
            },
        },
    }),

    createMockTask('task-10', 'labeling_approved', {
        title: 'Gearbox Input Shaft - Bearing Seats',
        description: 'Complete feature analysis of gearbox input shaft including bearing seats, splines, and keyways',
        requirements: 'Label all bearing seat surfaces, spline geometry, keyway features, and thread details. Note any special tolerances.',
        priority: 'medium',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'gearbox_shaft_input.step',
                    size: 2457600,
                    uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Clean geometry file. Ready for detailed feature labeling.',
            },
        },
        labelingData: {
            labels: ['bearing_seat_front', 'bearing_seat_rear', 'spline_involute', 'keyway_dIN6885', 'shoulder', 'thread_m16'],
            geometryType: 'body',
            confidence: 0.92,
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'All critical features properly identified. Good attention to bearing seat tolerances.',
            },
        },
    }),

    // ========================================
    // REJECTED TASKS (back in Assigned/To Do with rejection reason)
    // ========================================

    createMockTask('task-11', 'pending_upload', {
        title: 'Pump Housing - Internal Passages',
        description: 'Centrifugal pump housing with internal flow passages and mounting features',
        requirements: 'Upload complete pump housing geometry. Ensure internal passages are not simplified or suppressed.',
        priority: 'medium',
        assignedTo: 'jose@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'pump_housing_centrifugal.step',
                    size: 1638400,
                    uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'aidan@mecado.com',
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                approved: false,
                notes: 'File contains corrupted surface data. Several faces are missing or degenerate. Please re-export from original CAD file and verify geometry integrity before resubmitting.',
            },
        },
        labelingData: {
            labels: [],
        },
    }),

    createMockTask('task-12', 'pending_labeling', {
        title: 'Pressure Relief Valve Body',
        description: 'Safety relief valve body with inlet/outlet ports and spring housing features',
        requirements: 'Label all port geometry, mounting surfaces, and internal features. Distinguish between inlet and outlet ports.',
        priority: 'low',
        assignedTo: 'maria@mecado.com',
        uploadData: {
            requiredFileCount: 1,
            uploadedFiles: [
                {
                    name: 'valve_relief_body.step',
                    size: 2048000,
                    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                },
            ],
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                approved: true,
                notes: 'Geometry approved for labeling.',
            },
        },
        labelingData: {
            labels: ['inlet_port', 'outlet_port'],
            geometryType: 'body',
            review: {
                reviewedBy: 'elie@mecado.com',
                reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                approved: false,
                notes: 'Labeling needs revision. The spring housing bore was mislabeled as "chamfer" - this is a cylindrical bore feature. Also missing the mounting flange surface labels. Please review and resubmit.',
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