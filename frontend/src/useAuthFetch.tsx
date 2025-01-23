import { useKeycloak } from '@react-keycloak/web';

export function useAuthFetch() {
  const { keycloak } = useKeycloak();

  const authFetch = async (url: string, options?: RequestInit) => {
    const token = keycloak?.token ?? '';
    const headers = {
      ...(options?.headers || {}),
      'Authorization': `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  return authFetch;
}