// src/hooks/useCommonLookups.ts
import { useState, useEffect } from 'react';
import { useAuthFetch } from './useAuthFetch';

// Updated DoctorItem interface to include keycloakUserId
export interface DoctorItem {
  id: string;
  keycloakUserId: string;   // <-- newly added
  name: string;
  specialties: string[];
}

export interface PatientItem {
  id: string;
  name: string;
  egn: string;
}

export interface DiagnosisItem {
  id: string;
  name: string;
}

export function useCommonLookups() {
  const authFetch = useAuthFetch();

  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);

  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctors();
    loadPatients();
    loadDiagnoses();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await authFetch('/api/doctors/all');
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      } else {
        const errorTxt = await res.text();
        setError(`Failed to fetch doctors: ${errorTxt}`);
      }
    } catch (err) {
      setError(`Error fetching doctors: ${String(err)}`);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await authFetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      } else {
        const errorTxt = await res.text();
        setError(`Failed to fetch patients: ${errorTxt}`);
      }
    } catch (err) {
      setError(`Error fetching patients: ${String(err)}`);
    }
  };

  const loadDiagnoses = async () => {
    try {
      const res = await authFetch('/api/diagnoses');
      if (res.ok) {
        const data = await res.json();
        setDiagnoses(data);
      } else {
        const errorTxt = await res.text();
        setError(`Failed to fetch diagnoses: ${errorTxt}`);
      }
    } catch (err) {
      setError(`Error fetching diagnoses: ${String(err)}`);
    }
  };

  return { doctors, patients, diagnoses, error };
}