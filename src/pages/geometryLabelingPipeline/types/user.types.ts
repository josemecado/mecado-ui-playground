// types/user.types.ts
// User-related types

export type UserRole =
    | 'admin'      // Full access - Elie, Dylan, Jose, Aidan
    | 'manager'    // L2 - AMC Bridge managers (read-only on managed users, approve labels)
    | 'labeler'    // L1 - CAD designers (upload, label, request new labels)
    | 'uploader'   // L1 - Specialized for uploads only
    | 'reviewer';  // Can review submissions

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatar?: string;
    managedBy?: string;  // For L1 users - email of L2 manager
}

export interface UserContext {
    currentUser: User | null;
    isAdmin: boolean;
    isManager: boolean;
    isL1User: boolean;
}