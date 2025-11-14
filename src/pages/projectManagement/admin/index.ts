// admin/index.ts
// Barrel exports for admin module

// Types
export * from './types/admin.types';

// Components
export { AdminTaskCard } from './components/AdminTaskCard';
export { AdminTaskColumn } from './components/AdminTaskColumn';
export { AdminTaskBoard } from './components/AdminTaskBoard';

// Views
export { AdminDashboardView } from './views/AdminDashboardView';

// Utils
export * from './utils/adminHelpers';
export * from './utils/mockAdminData';