import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldX } from 'lucide-react';

/**
 * RoleRoute — wraps individual route elements with role enforcement.
 *
 * Props:
 *   element      — ReactNode to render when allowed
 *   allowedRoles — string[] of roles allowed (e.g. ['owner', 'manager'])
 *   redirectTo   — where to send unauthorized users (default: '/')
 */
const RoleRoute = ({ element, children, allowedRoles = [], redirectTo = '/' }) => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center p-8">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground max-w-sm">
          Your role (<strong className="text-foreground capitalize">{userRole}</strong>) doesn't have
          permission to access this section.
        </p>
        <div className="flex flex-col gap-2 mt-2">
          <a
            href={redirectTo}
            className="text-sm text-primary underline underline-offset-4 hover:opacity-80 transition"
          >
            Go back to Dashboard
          </a>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="text-sm text-muted-foreground hover:underline"
          >
            Logout and Re-login
          </button>
        </div>
      </div>
    );
  }

  return element || children;
};

export default RoleRoute;
