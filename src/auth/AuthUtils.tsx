import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface WithAuthorizationProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

/**
 * A component that only renders its children if the user has the required roles or permissions
 */
export const WithAuthorization: React.FC<WithAuthorizationProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show nothing while loading
  if (isLoading) {
    return null;
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(role => user.roles.includes(role));
  
  // Check if user has any of the required permissions
  const hasRequiredPermission = requiredPermissions.length === 0 || 
    requiredPermissions.some(permission => user.permissions.includes(permission));
  
  // Render children if user has required role and permission
  if (hasRequiredRole && hasRequiredPermission) {
    return <>{children}</>;
  }
  
  // Redirect if not authorized
  return <Navigate to="/unauthorized" replace />;
};

/**
 * A HOC that wraps a component with role and permission-based authorization
 */
export const withAuthorization = (
  Component: React.ComponentType<any>,
  requiredRoles: string[] = [],
  requiredPermissions: string[] = [],
  redirectTo: string = '/login'
) => {
  return (props: any) => (
    <WithAuthorization
      requiredRoles={requiredRoles}
      requiredPermissions={requiredPermissions}
      redirectTo={redirectTo}
    >
      <Component {...props} />
    </WithAuthorization>
  );
};

/**
 * A protected route component that only renders a route if the user is authenticated
 */
export const ProtectedRoute: React.FC<{
  element: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}> = ({ element, requiredRoles = [], requiredPermissions = [] }) => {
  return (
    <WithAuthorization
      requiredRoles={requiredRoles}
      requiredPermissions={requiredPermissions}
    >
      {element}
    </WithAuthorization>
  );
};

/**
 * Hook to check if the user has specific roles
 */
export const useHasRoles = (roles: string[]): boolean => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  return roles.some(role => user.roles.includes(role));
};

/**
 * Hook to check if the user has specific permissions
 */
export const useHasPermissions = (permissions: string[]): boolean => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * Component that conditionally renders based on user roles
 */
export const RoleBasedRenderer: React.FC<{
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles, children, fallback = null }) => {
  const hasRoles = useHasRoles(roles);
  
  return hasRoles ? <>{children}</> : <>{fallback}</>;
};

/**
 * Component that conditionally renders based on user permissions
 */
export const PermissionBasedRenderer: React.FC<{
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permissions, children, fallback = null }) => {
  const hasPermissions = useHasPermissions(permissions);
  
  return hasPermissions ? <>{children}</> : <>{fallback}</>;
};