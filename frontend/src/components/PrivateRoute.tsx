import React from 'react';
import { Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    // Not done loading Keycloak
    return <div>Loading Keycloak...</div>;
  }

  if (!keycloak?.authenticated) {
    // We do this if onLoad: 'login-required' didn't handle it for some reason
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check roles
  if (
    requiredRoles.length > 0 &&
    !requiredRoles.some((role) => keycloak.hasResourceRole(role, 'medical-backend'))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};