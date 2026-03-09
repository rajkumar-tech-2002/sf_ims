import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to check user permissions for various modules
 * @returns {Object} Helper functions to check permissions
 */
export const usePermissions = () => {
    const { user } = useAuth();

    // Admin has full access by default
    const isAdmin = (user?.user_role || user?.role || '').toLowerCase() === 'admin';
    const permissions = user?.permissions || {};

    /**
     * Check if user can access a module
     * @param {string} moduleId - The ID of the module (e.g., 'stock-entry')
     * @returns {boolean}
     */
    const canAccess = (moduleId) => {
        if (isAdmin) return true;
        const level = permissions[moduleId];
        return level === 'view' || level === 'edit';
    };

    /**
     * Check if user can perform edit/save operations in a module
     * @param {string} moduleId - The ID of the module
     * @returns {boolean}
     */
    const canEdit = (moduleId) => {
        if (isAdmin) return true;
        return permissions[moduleId] === 'edit';
    };

    /**
     * Check if user is restricted to view-only mode
     * @param {string} moduleId - The ID of the module
     * @returns {boolean}
     */
    const isViewOnly = (moduleId) => {
        if (isAdmin) return false;
        return permissions[moduleId] === 'view';
    };

    return {
        canAccess,
        canEdit,
        isViewOnly,
        isAdmin,
        permissions
    };
};
