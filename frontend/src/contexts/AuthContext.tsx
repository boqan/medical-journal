import React, { createContext, useContext, useEffect, useState } from 'react';
import { useKeycloakContext } from './KeycloakContext';
import type { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { keycloak, initialized } = useKeycloakContext();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && keycloak?.authenticated) {
      const roles = keycloak.realmAccess?.roles || [];
      setUser({
        id: keycloak.subject || '',
        username: keycloak.tokenParsed?.preferred_username || '',
        roles,
      });
      setToken(keycloak.token || null);
    } else {
      setUser(null);
      setToken(null);
    }
  }, [initialized, keycloak?.authenticated]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!keycloak?.authenticated,
        isLoading: !initialized,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);