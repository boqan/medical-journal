import React, { useEffect, useState } from 'react';
import { useAuthFetch } from '../useAuthFetch';
import { useKeycloak } from '@react-keycloak/web';
import { useCommonLookups } from '../useCommonLookups';

interface Visit {
  id?: string;
  doctorId?: string;
  visitDate: string;
  diagnosisIds?: string[];
  medications?: string[];
}

const MyVisitsPage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const authFetch = useAuthFetch();
  const { doctors, diagnoses, error: lookupsError } = useCommonLookups();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyVisits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyVisits = async () => {
    try {
      const keycloakUserId = keycloak.tokenParsed?.sub;
      if (!keycloakUserId) {
        setError('No user ID found in token');
        return;
      }
      // 1) Find patient ID by Keycloak ID
      const findPatientRes = await authFetch(`/api/patients/keycloak/${keycloakUserId}`);
      if (!findPatientRes.ok) {
        const errorText = await findPatientRes.text();
        setError(`Failed to find patient ID: ${errorText}`);
        return;
      }
      const { id: dbPatientId } = await findPatientRes.json();

      // 2) Fetch visits for that patient
      const res = await authFetch(`/api/visits/patient/${dbPatientId}`);
      if (res.ok) {
        const rawData = await res.json();

        // Convert data to local Visit objects
        const mapped: Visit[] = rawData.map((v: any) => ({
          id: v.id,
          visitDate: v.visitDate,
          doctorId: v.doctorId || v.doctor?.id || '',
          diagnosisIds: v.diagnosisIds || (v.diagnoses ? v.diagnoses.map((d: any) => d.id) : []),
          medications: v.prescribedMedications || v.medications || []
        }));
        setVisits(mapped);
      } else {
        const errorText = await res.text();
        setError(`Failed to load my visits: ${errorText}`);
      }
    } catch (err) {
      setError(`Error loading my visits: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Visits</h1>
      {(error || lookupsError) && <p className="text-red-500">{error || lookupsError}</p>}
      <table className="min-w-full bg-white mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Doctor</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Diagnoses</th>
            <th className="px-4 py-2">Medications</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v) => {
            // Find doctor name from lookups
            const docName = doctors.find(d => d.id === v.doctorId)?.name || '';
            // Map each diagnosis ID to a name
            const diagNames = (v.diagnosisIds || [])
              .map(d => diagnoses.find(di => di.id === d)?.name || '')
              .filter(name => name !== '');

            return (
              <tr key={v.id || Math.random()} className="border-b">
                <td className="px-4 py-2">{docName}</td>
                <td className="px-4 py-2">{v.visitDate}</td>
                <td className="px-4 py-2">
                  {diagNames.length > 0 ? diagNames.join(', ') : ''}
                </td>
                <td className="px-4 py-2">
                  {v.medications && v.medications.length > 0
                    ? v.medications.join(', ')
                    : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyVisitsPage;