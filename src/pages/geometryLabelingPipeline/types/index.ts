// types/index.ts
// Barrel export for all types

// Task types
export type {
    TaskStage,
    TaskPriority,
    AdminColumnStatus,
    HistoryEntry,
    ReviewData,
    UploadedFile,
    UploadData,
    LabelingData,
    UnifiedTask,
    AdminBoardColumn,
    CreateTaskInput,
    UpdateTaskInput,
    ReviewAction,
    TaskContext,
} from './task.types';

// User types
export type {
    UserRole,
    User,
    UserContext,
} from './user.types';

// Project types
export type {
    FileStatus,
    VtpFile,
    Project,
    FileProject,
    CreateProjectInput,
    CreateFileProjectInput,
    PresignedUrlResponse,
} from './projects.types';

// Label types
export type {
    LabelStatus,
    LabelCategory,
    PendingLabel,
    ApprovedLabel,
    CreateLabelInput,
    ReviewLabelInput,
    LabelingScheme,
} from './label.types';

// Geometry types
export type {
    GeometryType,
    ClassificationStatus,
    GeometryData,
    PendingGeometryClassification,
    ApprovedGeometryClassification,
    GeometryLabel,
    GeometryLabels,
    CreateClassificationInput,
    AddGeometryLabelInput,
} from './geometry.types';