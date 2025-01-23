import React, { useEffect, useState } from 'react';
import { useAuthFetch } from '../useAuthFetch';
import { useKeycloak } from '@react-keycloak/web';

const MyInsurancePage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const authFetch = useAuthFetch();
  const [insured, setInsured] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkInsurance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkInsurance = async () => {
    try {
      const userId = keycloak.tokenParsed?.sub;
      if (!userId) {
        setError('No user ID found in token');
        return;
      }

      // 1) Get the dbPatientId via keycloakUserId
      const findPatientRes = await authFetch(`/api/patients/keycloak/${userId}`);
      if (!findPatientRes.ok) {
        const errorText = await findPatientRes.text();
        setError(`Failed to find patient ID: ${errorText}`);
        return;
      }
      const { id: dbPatientId } = await findPatientRes.json();

      // 2) Check insurance status with the DB ID
      const res = await authFetch(`/api/patients/${dbPatientId}/isInsured`);
      if (res.ok) {
        const data: boolean = await res.json();
        setInsured(data);
      } else {
        const errorText = await res.text();
        setError(`Failed to check insurance: ${errorText}`);
      }
    } catch (err) {
      setError(`Error checking insurance: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Insurance</h1>
      {error && <p className="text-red-500">{error}</p>}
      {insured !== null && (
        <div className="p-4 bg-white rounded shadow-md space-y-2">
          {insured ? (
            <p>You are insured in the last 6 months.</p>
          ) : (
            <p>You do not have valid insurance in the last 6 months.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MyInsurancePage;