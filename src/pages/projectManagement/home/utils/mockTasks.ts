import { Task, GeometryLabelingTask, GeometryUploadTask } from "../types/types";

// ============================================================================
// MOCK GEOMETRY LABELING TASKS
// ============================================================================

const labelingTasks: GeometryLabelingTask[] = [
    // TO DO - High Priority
    {
        id: "label-1",
        type: "geometry_labeling",
        status: "todo",
        priority: "high",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-10T09:00:00"),
        updatedAt: new Date("2025-01-10T09:00:00"),
        dueDate: new Date("2025-01-13T17:00:00"),

        modelId: "model_abc123",
        geometryId: "face_456",
        geometryType: "face",
        geometryName: "flange_assembly_v2.step",
        description: "Label bolt hole mating faces",
    },

    // TO DO - Medium Priority
    {
        id: "label-2",
        type: "geometry_labeling",
        status: "todo",
        priority: "medium",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-09T14:00:00"),
        updatedAt: new Date("2025-01-09T14:00:00"),
        dueDate: new Date("2025-01-15T17:00:00"),

        modelId: "model_def456",
        geometryId: "edge_789",
        geometryType: "edge",
        geometryName: "bracket_left.step",
        description: "Identify and label edge features",
    },

    // PENDING APPROVAL
    {
        id: "label-3",
        type: "geometry_labeling",
        status: "pending",
        priority: "high",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-08T10:00:00"),
        updatedAt: new Date("2025-01-09T16:30:00"),
        submittedAt: new Date("2025-01-09T16:30:00"),
        dueDate: new Date("2025-01-12T17:00:00"),

        modelId: "model_ghi789",
        geometryId: "face_234",
        geometryType: "face",
        geometryName: "bolt_m8_v1.step",
        description: "Label bolt head faces",
        labelName: "mating_face",
        confidence: 0.95,
    },

    // APPROVED
    {
        id: "label-4",
        type: "geometry_labeling",
        status: "approved",
        priority: "medium",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-07T09:00:00"),
        updatedAt: new Date("2025-01-08T11:00:00"),
        submittedAt: new Date("2025-01-07T15:00:00"),
        reviewedAt: new Date("2025-01-08T11:00:00"),
        reviewedBy: "reviewer@mecado.com",
        reviewNotes: "Excellent labeling, approved!",
        dueDate: new Date("2025-01-10T17:00:00"),

        modelId: "model_jkl012",
        geometryId: "edge_567",
        geometryType: "edge",
        geometryName: "gasket_seal.step",
        description: "Label fillet edges",
        labelName: "fillet",
        confidence: 0.92,
    },

    // FAILED
    {
        id: "label-5",
        type: "geometry_labeling",
        status: "failed",
        priority: "medium",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-08T14:00:00"),
        updatedAt: new Date("2025-01-09T10:00:00"),
        submittedAt: new Date("2025-01-08T16:30:00"),
        reviewedAt: new Date("2025-01-09T10:00:00"),
        reviewedBy: "reviewer@mecado.com",
        reviewNotes: "Incorrect label - this is a fillet, not a chamfer. Please revise.",
        dueDate: new Date("2025-01-11T17:00:00"),

        modelId: "model_mno345",
        geometryId: "edge_890",
        geometryType: "edge",
        geometryName: "housing_cover.step",
        description: "Label edge transitions",
        labelName: "chamfer",
        confidence: 0.78,
    },
];

// ============================================================================
// MOCK GEOMETRY UPLOAD TASKS
// ============================================================================

const uploadTasks: GeometryUploadTask[] = [
    // TO DO
    {
        id: "upload-1",
        type: "geometry_upload",
        status: "todo",
        priority: "medium",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-09T08:00:00"),
        updatedAt: new Date("2025-01-09T08:00:00"),
        dueDate: new Date("2025-01-14T17:00:00"),

        requiredFileCount: 5,
        uploadedFileCount: 0,
        fileNames: [],
        batchName: "Bracket Assembly Set A",
        description: "Upload 5 bracket STEP models",
    },

    // TO DO - Low Priority
    {
        id: "upload-2",
        type: "geometry_upload",
        status: "todo",
        priority: "low",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-10T11:00:00"),
        updatedAt: new Date("2025-01-10T11:00:00"),
        dueDate: new Date("2025-01-17T17:00:00"),

        requiredFileCount: 3,
        uploadedFileCount: 0,
        fileNames: [],
        batchName: "Fastener Collection",
        description: "Upload bolt, nut, and washer models",
    },

    // PENDING APPROVAL
    {
        id: "upload-3",
        type: "geometry_upload",
        status: "pending",
        priority: "high",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-07T09:00:00"),
        updatedAt: new Date("2025-01-08T14:00:00"),
        submittedAt: new Date("2025-01-08T14:00:00"),
        dueDate: new Date("2025-01-10T17:00:00"),

        requiredFileCount: 4,
        uploadedFileCount: 4,
        fileNames: ["plate_top.step", "plate_bottom.step", "plate_left.step", "plate_right.step"],
        batchName: "Mounting Plates",
        description: "Upload 4 mounting plate models",
    },

    // APPROVED
    {
        id: "upload-4",
        type: "geometry_upload",
        status: "approved",
        priority: "medium",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-05T10:00:00"),
        updatedAt: new Date("2025-01-06T09:00:00"),
        submittedAt: new Date("2025-01-05T16:00:00"),
        reviewedAt: new Date("2025-01-06T09:00:00"),
        reviewedBy: "reviewer@mecado.com",
        reviewNotes: "All files processed successfully",
        dueDate: new Date("2025-01-08T17:00:00"),

        requiredFileCount: 7,
        uploadedFileCount: 7,
        fileNames: [
            "shaft_primary.step",
            "shaft_secondary.step",
            "bearing_housing.step",
            "collar_1.step",
            "collar_2.step",
            "spacer_1.step",
            "spacer_2.step",
        ],
        batchName: "Shaft Assembly Components",
        description: "Upload complete shaft assembly",
    },

    // FAILED
    {
        id: "upload-5",
        type: "geometry_upload",
        status: "failed",
        priority: "high",
        assignedTo: "jose@mecado.com",
        assignedBy: "manager@mecado.com",
        createdAt: new Date("2025-01-08T13:00:00"),
        updatedAt: new Date("2025-01-09T09:00:00"),
        submittedAt: new Date("2025-01-08T15:30:00"),
        reviewedAt: new Date("2025-01-09T09:00:00"),
        reviewedBy: "reviewer@mecado.com",
        reviewNotes: "File 'valve_body.step' is corrupted. Please re-upload with valid STEP file.",
        dueDate: new Date("2025-01-11T17:00:00"),

        requiredFileCount: 2,
        uploadedFileCount: 2,
        fileNames: ["valve_body.step", "valve_stem.step"],
        batchName: "Valve Components",
        description: "Upload valve assembly parts",
    },
];

// ============================================================================
// COMBINED MOCK TASKS
// ============================================================================

export const mockTasks: Task[] = [...labelingTasks, ...uploadTasks];

// ============================================================================
// HELPER: Get tasks by status
// ============================================================================

export const getTasksByStatus = (status: Task["status"]): Task[] => {
    return mockTasks.filter((task) => task.status === status);
};

// ============================================================================
// HELPER: Update task status (for demo)
// ============================================================================

export const updateTaskStatus = (
    taskId: string,
    newStatus: Task["status"],
    reviewNotes?: string,
    labels?: string[],        // For labeling tasks
    fileNames?: string[]      // ADD THIS: For upload tasks
): Task | undefined => {
    const task = mockTasks.find((t) => t.id === taskId);
    if (task) {
        task.status = newStatus;
        task.updatedAt = new Date();

        if (newStatus === "pending") {
            task.submittedAt = new Date();
            
            // Store labels if provided (labeling tasks)
            if (labels && task.type === "geometry_labeling") {
                task.labels = labels;
                task.labelName = labels.join(", ");
            }

            // ADD THIS: Store file info if provided (upload tasks)
            if (fileNames && task.type === "geometry_upload") {
                task.fileNames = fileNames;
                task.uploadedFileCount = fileNames.length;
            }
        }

        if (newStatus === "approved" || newStatus === "failed") {
            task.reviewedAt = new Date();
            task.reviewedBy = "reviewer@mecado.com";
            task.reviewNotes = reviewNotes;
        }
    }
    return task;
};