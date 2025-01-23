import React, { createContext, useContext, useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8080/',
  realm: 'medical-realm',
  clientId: 'medical-backend'
};

interface KeycloakContextType {
  keycloak: Keycloak | null;
  initialized: boolean;
}

const KeycloakContext = createContext<KeycloakContextType>({
  keycloak: null,
  initialized: false
});

export const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initKeycloak = async () => {
      try {
        console.log('Initializing Keycloak...');
        const keycloakInstance = new Keycloak(keycloakConfig);
        const authenticated = await keycloakInstance.init({
          onLoad: 'login-required', // Change from 'check-sso' to 'login-required'
          redirectUri: window.location.origin,
          pkceMethod: 'S256',
          checkLoginIframe: false
        });
        console.log('Keycloak initialized:', keycloakInstance);
        console.log('Authenticated:', authenticated);
        setKeycloak(keycloakInstance);
        setInitialized(true);

        if (authenticated) {
          console.log('User is authenticated');
        } else {
          console.log('User is not authenticated');
        }

        keycloakInstance.onAuthSuccess = () => {
          console.log('Authentication successful');
        };

        keycloakInstance.onAuthError = (error) => {
          console.error('Authentication error:', error);
        };

        keycloakInstance.onAuthRefreshSuccess = () => {
          console.log('Token refreshed successfully');
        };

        keycloakInstance.onAuthRefreshError = () => {
          console.error('Token refresh error');
        };

        keycloakInstance.onTokenExpired = () => {
          console.log('Token expired');
          keycloakInstance.updateToken(30).catch(() => {
            console.error('Failed to refresh token');
            keycloakInstance.logout();
          });
        };
      } catch (error) {
        console.error('Keycloak initialization error:', error);
        setInitialized(true);
      }
    };

    initKeycloak();
  }, []);

  if (!initialized) {
    console.log('Keycloak not initialized yet...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading authentication...</p>
      </div>
    );
  }

  return (
    <KeycloakContext.Provider value={{ keycloak, initialized }}>
      {children}
    </KeycloakContext.Provider>
  );
};

export const useKeycloakContext = () => useContext(KeycloakContext);