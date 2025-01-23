// src/pages/ReportsPage.tsx

import React, { useState, FormEvent, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useAuthFetch } from '../useAuthFetch';
import { useCommonLookups } from '../useCommonLookups';

/** Minimal interfaces matching your backend's JSON. */
interface PatientDTO {
  id: string;
  name: string;
  egn: string;
  personalDoctorId: string;
}

interface DiagnosisFrequencyResult {
  diagnosisId: string;
  count: number;
}

interface DoctorPatientCount {
  doctorId: string;
  count: number; // Make sure this matches what your backend returns
}

interface DoctorVisitCount {
  doctorId: string;
  visitCount: number;
}

interface VisitsByPatientResult {
  patientId: string;
  visitIds: string[];
}

interface VisitDTO {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  diagnosisIds: string[];
  prescribedMedications: string[];
}

interface DoctorSickLeaveCount {
  doctorId: string;
  sickLeaveCount: number; // Must match your backend JSON
}

const ReportsPage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const authFetch = useAuthFetch();
  const { doctors, diagnoses, error: lookupError } = useCommonLookups();

  const [error, setError] = useState('');

  // ------------------------------------------------------------
  // Optionally find the "current doctor" from keycloakUserId -> doc
  // to show in headings if you want to say "Currently Dr. Jane"
  // ------------------------------------------------------------
  const [myDoctorName, setMyDoctorName] = useState<string | null>(null);

  useEffect(() => {
    if (keycloak?.tokenParsed && doctors.length > 0) {
      const userSub = keycloak.tokenParsed.sub as string; 
      const foundDoc = doctors.find((d) => d.keycloakUserId === userSub);
      if (foundDoc) {
        setMyDoctorName(foundDoc.name); // e.g. "Dr. Jane"
      }
    }
  }, [keycloak, doctors]);

  // Helper to show doctor name from an ID
  function doctorNameFromId(docId: string) {
    const doc = doctors.find(d => d.id === docId);
    return doc ? doc.name : docId;
  }

  // ------------------------------------------------------------
  // (A) Patients by Diagnosis
  // ------------------------------------------------------------
  const [selectedDiagnosisForPatients, setSelectedDiagnosisForPatients] = useState('');
  const [patientsByDiagnosis, setPatientsByDiagnosis] = useState<PatientDTO[]>([]);

  const handleGetPatientsByDiagnosis = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDiagnosisForPatients) {
      setError('Please select a diagnosis first.');
      return;
    }
    setError('');
    setPatientsByDiagnosis([]);

    try {
      const res = await authFetch(
        `/api/reports/patients-by-diagnosis/${selectedDiagnosisForPatients}`
      );
      if (res.ok) {
        const data: PatientDTO[] = await res.json();
        setPatientsByDiagnosis(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (B) Top Diagnoses
  // ------------------------------------------------------------
  const [topDiagnoses, setTopDiagnoses] = useState<DiagnosisFrequencyResult[]>([]);

  const handleTopDiagnoses = async () => {
    setError('');
    setTopDiagnoses([]);
    try {
      const res = await authFetch('/api/reports/top-diagnoses?top=3');
      if (res.ok) {
        const data: DiagnosisFrequencyResult[] = await res.json();
        setTopDiagnoses(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (C) Patients by Doctor
  // ------------------------------------------------------------
  const [selectedDoctorForPatients, setSelectedDoctorForPatients] = useState('');
  const [patientsByDoctor, setPatientsByDoctor] = useState<PatientDTO[]>([]);

  const handleGetPatientsByDoctor = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForPatients) {
      setError('Please select a doctor first.');
      return;
    }
    setError('');
    setPatientsByDoctor([]);

    try {
      const res = await authFetch(`/api/reports/patients-by-doctor/${selectedDoctorForPatients}`);
      if (res.ok) {
        const data: PatientDTO[] = await res.json();
        setPatientsByDoctor(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (D) Patient Count by Doctor
  // ------------------------------------------------------------
  const [patientCountByDoctor, setPatientCountByDoctor] = useState<DoctorPatientCount[]>([]);

  const handleGetPatientCountByDoctor = async () => {
    setError('');
    setPatientCountByDoctor([]);

    try {
      const res = await authFetch('/api/reports/patient-count-by-doctor');
      if (res.ok) {
        const data: DoctorPatientCount[] = await res.json();
        setPatientCountByDoctor(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (E) Visit Count by Doctor
  // ------------------------------------------------------------
  const [visitCountByDoctor, setVisitCountByDoctor] = useState<DoctorVisitCount[]>([]);

  const handleGetVisitCountByDoctor = async () => {
    setError('');
    setVisitCountByDoctor([]);

    try {
      const res = await authFetch('/api/reports/visit-count-by-doctor');
      if (res.ok) {
        const data: DoctorVisitCount[] = await res.json();
        setVisitCountByDoctor(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (F) Visits Grouped by Patient
  // ------------------------------------------------------------
  const [visitsGroupedByPatient, setVisitsGroupedByPatient] = useState<VisitsByPatientResult[]>([]);

  const handleGetVisitsGroupedByPatient = async () => {
    setError('');
    setVisitsGroupedByPatient([]);

    try {
      const res = await authFetch('/api/reports/visits-by-patient/all');
      if (res.ok) {
        const data: VisitsByPatientResult[] = await res.json();
        setVisitsGroupedByPatient(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (G) Visits in Date Range
  // ------------------------------------------------------------
  const [startDateInput, setStartDateInput] = useState('');
  const [endDateInput, setEndDateInput] = useState('');
  const [visitsDateRange, setVisitsDateRange] = useState<VisitDTO[]>([]);

  const handleGetVisitsDateRange = async (e: FormEvent) => {
    e.preventDefault();
    if (!startDateInput || !endDateInput) {
      setError('Please provide both start and end date.');
      return;
    }
    setError('');
    setVisitsDateRange([]);

    try {
      const res = await authFetch(
        `/api/reports/visits-date-range?start=${startDateInput}&end=${endDateInput}`
      );
      if (res.ok) {
        const data: VisitDTO[] = await res.json();
        setVisitsDateRange(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (H) Visits by Doctor in Date Range
  // ------------------------------------------------------------
  const [selectedDoctorForVisitDateRange, setSelectedDoctorForVisitDateRange] = useState('');
  const [docDateRangeVisits, setDocDateRangeVisits] = useState<VisitDTO[]>([]);

  const handleGetVisitsByDoctorDateRange = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForVisitDateRange || !startDateInput || !endDateInput) {
      setError('Please select a doctor and start/end dates first.');
      return;
    }
    setError('');
    setDocDateRangeVisits([]);

    try {
      const res = await authFetch(
        `/api/reports/visits-by-doctor-date-range?doctorId=${selectedDoctorForVisitDateRange}`
        + `&start=${startDateInput}&end=${endDateInput}`
      );
      if (res.ok) {
        const data: VisitDTO[] = await res.json();
        setDocDateRangeVisits(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (I) Month with Most Sick Leaves
  // ------------------------------------------------------------
  const [monthMostLeaves, setMonthMostLeaves] = useState<number | null>(null);
  const handleMonthWithMostSickLeaves = async () => {
    setError('');
    setMonthMostLeaves(null);

    try {
      const res = await authFetch('/api/reports/month-with-most-sick-leaves');
      if (res.ok) {
        const data = await res.json(); // integer
        setMonthMostLeaves(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // ------------------------------------------------------------
  // (J) Top Doctors by Sick Leaves
  // ------------------------------------------------------------
  const [topDoctorsSickLeave, setTopDoctorsSickLeave] = useState<DoctorSickLeaveCount[]>([]);
  const [topNInput, setTopNInput] = useState('3');

  const handleTopDoctorsSickLeaves = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setTopDoctorsSickLeave([]);

    try {
      const topN = parseInt(topNInput, 10);
      const res = await authFetch(`/api/reports/top-doctors-sick-leaves?top=${topN}`);
      if (res.ok) {
        const data: DoctorSickLeaveCount[] = await res.json();
        setTopDoctorsSickLeave(data);
      } else {
        const errTxt = await res.text();
        setError(`Failed: ${errTxt}`);
      }
    } catch (err) {
      setError(`Error: ${String(err)}`);
    }
  };

  // Another helper to show doc name
  function doctorNameFromIdInReports(docId: string): string {
    const found = doctors.find(d => d.id === docId);
    return found ? found.name : docId;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Reports
        {myDoctorName && (
          <span className="text-sm ml-2 font-normal text-gray-600">
            (You are <strong>{myDoctorName}</strong>)
          </span>
        )}
      </h1>

      {(error || lookupError) && (
        <p className="text-red-500">{error || lookupError}</p>
      )}

      {/* (A) Patients by Diagnosis */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Patients by Diagnosis</h2>
        <form onSubmit={handleGetPatientsByDiagnosis} className="flex items-center space-x-2">
          <select
            className="border rounded px-2 py-1"
            value={selectedDiagnosisForPatients}
            onChange={(e) => setSelectedDiagnosisForPatients(e.target.value)}
          >
            <option value="">-- Select Diagnosis --</option>
            {diagnoses.map((diag) => (
              <option key={diag.id} value={diag.id}>
                {diag.name} (ID: {diag.id})
              </option>
            ))}
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">
            Fetch
          </button>
        </form>
        {patientsByDiagnosis.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Patient ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">EGN</th>
                <th className="px-4 py-2">Personal Doctor</th>
              </tr>
            </thead>
            <tbody>
              {patientsByDiagnosis.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.egn}</td>
                  <td className="px-4 py-2">{p.personalDoctorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* (B) Top Diagnoses */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Top Diagnoses</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={handleTopDiagnoses}
        >
          Fetch Top Diagnoses
        </button>
        {topDiagnoses.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Diagnosis ID</th>
                <th className="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {topDiagnoses.map((item) => (
                <tr key={item.diagnosisId} className="border-b">
                  <td className="px-4 py-2">{item.diagnosisId}</td>
                  <td className="px-4 py-2">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* (C) Patients by Doctor */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Patients by Doctor</h2>
        <form onSubmit={handleGetPatientsByDoctor} className="flex items-center space-x-2">
          <select
            className="border rounded px-2 py-1"
            value={selectedDoctorForPatients}
            onChange={(e) => setSelectedDoctorForPatients(e.target.value)}
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} (ID: {doc.id})
              </option>
            ))}
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">
            Fetch
          </button>
        </form>
        {patientsByDoctor.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Patient ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">EGN</th>
              </tr>
            </thead>
            <tbody>
              {patientsByDoctor.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.egn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* (D) Patient Count by Doctor 
          - If you only want the current doc, you can filter or adjust 
          - We’ve also changed the column heading to “Patient Count.” */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">
          Patient Count by Doctor
          {myDoctorName && (
            <span className="text-sm ml-2 font-normal text-gray-600">
              (You are <strong>{myDoctorName}</strong>)
            </span>
          )}
        </h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={handleGetPatientCountByDoctor}
        >
          Fetch
        </button>
        {patientCountByDoctor.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Doctor ID</th>
                <th className="px-4 py-2">Doctor Name</th>
                <th className="px-4 py-2">Patient Count</th>
              </tr>
            </thead>
            <tbody>
              {patientCountByDoctor.map((dc) => {
                const docName = doctorNameFromIdInReports(dc.doctorId);
                return (
                  <tr key={dc.doctorId} className="border-b">
                    <td className="px-4 py-2">{dc.doctorId}</td>
                    <td className="px-4 py-2">{docName}</td>
                    {/* Make sure your backend returns "count" for the property below */}
                    <td className="px-4 py-2">{dc.count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* (E) Visit Count by Doctor */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Visit Count by Doctor</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={handleGetVisitCountByDoctor}
        >
          Fetch
        </button>
        {visitCountByDoctor.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Doctor ID</th>
                <th className="px-4 py-2">Doctor Name</th>
                <th className="px-4 py-2">Visit Count</th>
              </tr>
            </thead>
            <tbody>
              {visitCountByDoctor.map((vc) => {
                const docName = doctorNameFromIdInReports(vc.doctorId);
                return (
                  <tr key={vc.doctorId} className="border-b">
                    <td className="px-4 py-2">{vc.doctorId}</td>
                    <td className="px-4 py-2">{docName}</td>
                    <td className="px-4 py-2">{vc.visitCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* (F) Visits Grouped by Patient */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Visits Grouped by Patient</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={handleGetVisitsGroupedByPatient}
        >
          Fetch
        </button>
        {visitsGroupedByPatient.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Patient ID</th>
                <th className="px-4 py-2">Visit IDs</th>
              </tr>
            </thead>
            <tbody>
              {visitsGroupedByPatient.map((v) => (
                <tr key={v.patientId} className="border-b">
                  <td className="px-4 py-2">{v.patientId}</td>
                  <td className="px-4 py-2">{v.visitIds.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* (G) Visits in Date Range */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Visits in Date Range</h2>
        <form onSubmit={handleGetVisitsDateRange} className="flex items-center space-x-2">
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button className="bg-indigo-600 text-white px-3 py-1 rounded" type="submit">
            Fetch
          </button>
        </form>
        {visitsDateRange.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Visit ID</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Doctor</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {visitsDateRange.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="px-4 py-2">{v.id}</td>
                  <td className="px-4 py-2">{v.patientId}</td>
                  <td className="px-4 py-2">{v.doctorId}</td>
                  <td className="px-4 py-2">{v.visitDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* (H) Visits by Doctor in Date Range */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Visits by Doctor in Date Range</h2>
        <form onSubmit={handleGetVisitsByDoctorDateRange} className="flex items-center space-x-2">
          <select
            className="border rounded px-2 py-1"
            value={selectedDoctorForVisitDateRange}
            onChange={(e) => setSelectedDoctorForVisitDateRange(e.target.value)}
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} (ID: {doc.id})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <input
            type="date"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <button className="bg-indigo-600 text-white px-3 py-1 rounded" type="submit">
            Fetch
          </button>
        </form>
        {docDateRangeVisits.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Visit ID</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Doctor</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {docDateRangeVisits.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="px-4 py-2">{v.id}</td>
                  <td className="px-4 py-2">{v.patientId}</td>
                  <td className="px-4 py-2">{v.doctorId}</td>
                  <td className="px-4 py-2">{v.visitDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* (I) Month with Most Sick Leaves */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Month with Most Sick Leaves</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded"
          onClick={handleMonthWithMostSickLeaves}
        >
          Fetch
        </button>
        {monthMostLeaves !== null && (
          <p className="mt-2">
            Month (1-12) with most sick leaves: <strong>{monthMostLeaves}</strong>
          </p>
        )}
      </section>

      {/* (J) Top Doctors by Sick Leaves */}
      <section className="p-4 border bg-white">
        <h2 className="font-semibold mb-2">Top Doctors by Sick Leaves</h2>
        <form onSubmit={handleTopDoctorsSickLeaves} className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Top N"
            value={topNInput}
            onChange={(e) => setTopNInput(e.target.value)}
            className="border rounded px-2 py-1"
            style={{ width: '80px' }}
          />
          <button className="bg-indigo-600 text-white px-3 py-1 rounded" type="submit">
            Fetch
          </button>
        </form>
        {topDoctorsSickLeave.length > 0 && (
          <table className="mt-2 min-w-full bg-gray-50">
            <thead>
              <tr>
                <th className="px-4 py-2">Doctor ID</th>
                <th className="px-4 py-2">Doctor Name</th>
                <th className="px-4 py-2">Sick Leave Count</th>
              </tr>
            </thead>
            <tbody>
              {topDoctorsSickLeave.map((item) => {
                const docName = doctorNameFromIdInReports(item.doctorId);
                return (
                  <tr key={item.doctorId} className="border-b">
                    <td className="px-4 py-2">{item.doctorId}</td>
                    <td className="px-4 py-2">{docName}</td>
                    {/* Make sure your backend returns "sickLeaveCount" exactly */}
                    <td className="px-4 py-2">{item.sickLeaveCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ReportsPage;
