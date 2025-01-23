import React, { useState, useEffect } from 'react';
import { useAuthFetch } from '../useAuthFetch';
import { useKeycloak } from '@react-keycloak/web';

interface DoctorDTO {
    keycloakUserId: string;
  name: string;
  specialties: string[];
}

interface PatientDTO {
  id: string;
  keycloakUserId: string;
  personalDoctorId?: string;
}

const MyDoctorPage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const authFetch = useAuthFetch();

  const [doctor, setDoctor] = useState<DoctorDTO | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyDoctor = async () => {
    try {
      const keycloakUserId = keycloak.tokenParsed?.sub;
      if (!keycloakUserId) {
        setError('No user ID found in token');
        return;
      }
      // 1) Find patient by keycloak ID
      const findPatientRes = await authFetch(`/api/patients/keycloak/${keycloakUserId}`);
      if (!findPatientRes.ok) {
        const errorText = await findPatientRes.text();
        setError(`Failed to find patient ID: ${errorText}`);
        return;
      }
      const patientData: PatientDTO = await findPatientRes.json();

      // 2) Fetch full patient data by DB ID
      const patientRes = await authFetch(`/api/patients/${patientData.id}`);
      if (!patientRes.ok) {
        const errorText = await patientRes.text();
        setError(`Failed to load patient data: ${errorText}`);
        return;
      }
      const fullPatientData: PatientDTO = await patientRes.json();

      if (!fullPatientData.personalDoctorId) {
        setError('No doctor assigned to you');
        return;
      }

      // 3) Fetch the actual doctor
      const docRes = await authFetch(`/api/doctors/${fullPatientData.personalDoctorId}`);
      if (!docRes.ok) {
        const errorText = await docRes.text();
        setError(`Failed to load doctor: ${errorText}`);
        return;
      }
      const doctorData: DoctorDTO = await docRes.json();
      setDoctor(doctorData);
    } catch (err) {
      setError(`Error loading doctor: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Doctor</h1>
      {error && <p className="text-red-500">{error}</p>}
      {doctor && (
        <div className="bg-white shadow p-4">
          <p><strong>Doctor ID:</strong> {doctor.keycloakUserId}</p>
          <p><strong>Name:</strong> {doctor.name}</p>
          <p><strong>Specialties:</strong> {doctor.specialties.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default MyDoctorPage;