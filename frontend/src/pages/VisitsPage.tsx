// src/pages/VisitsPage.tsx
import React, { useEffect, useState, ChangeEvent } from 'react';
import { useAuthFetch } from '../useAuthFetch';
import { useCommonLookups } from '../useCommonLookups';

// shape of your VisitDTO
interface Visit {
  id?: string;
  patientId: string;
  doctorId: string;
  visitDate: string;       // 'YYYY-MM-DD'
  diagnosisIds: string[];
  prescribedMedications: string[];
  sickLeave?: SickLeave;
}

interface SickLeave {
  startDate: string;       // 'YYYY-MM-DD'
  numberOfDays: number;
}

const VisitsPage: React.FC = () => {
  const authFetch = useAuthFetch();

  // Common lookups: doctors, patients, diagnoses
  const { doctors, patients, diagnoses, error: lookupsError } = useCommonLookups();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [error, setError] = useState('');

  // ----- CREATE FORM STATES -----
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createPatient, setCreatePatient] = useState('');
  const [createDoctor, setCreateDoctor] = useState('');
  const [createVisitDate, setCreateVisitDate] = useState('');
  const [createDiagnoses, setCreateDiagnoses] = useState<string[]>([]);
  const [createPrescribedMeds, setCreatePrescribedMeds] = useState('');
  const [createHasSickLeave, setCreateHasSickLeave] = useState(false);
  const [createSickLeaveStart, setCreateSickLeaveStart] = useState('');
  const [createSickLeaveDays, setCreateSickLeaveDays] = useState(0);

  // ----- EDIT FORM STATES -----
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editPatient, setEditPatient] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editVisitDate, setEditVisitDate] = useState('');
  const [editDiagnoses, setEditDiagnoses] = useState<string[]>([]);
  const [editPrescribedMeds, setEditPrescribedMeds] = useState('');
  const [editHasSickLeave, setEditHasSickLeave] = useState(false);
  const [editSickLeaveStart, setEditSickLeaveStart] = useState('');
  const [editSickLeaveDays, setEditSickLeaveDays] = useState(0);

  // Load visits on mount
  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      const res = await authFetch('/api/visits');
      if (res.ok) {
        const data: Visit[] = await res.json();
        setVisits(data);
      } else {
        const errorText = await res.text();
        setError(`Failed to load visits: ${errorText}`);
      }
    } catch (err) {
      setError(`Error loading visits: ${String(err)}`);
    }
  };

  // ----------------------------------------------------------------
  // CREATE Visit
  // ----------------------------------------------------------------
  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const newVisit: Visit = {
      patientId: createPatient,
      doctorId: createDoctor,
      visitDate: createVisitDate,
      diagnosisIds: createDiagnoses,
      prescribedMedications: createPrescribedMeds
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m !== ''),
    };

    if (createHasSickLeave) {
      newVisit.sickLeave = {
        startDate: createSickLeaveStart,
        numberOfDays: createSickLeaveDays,
      };
    }

    try {
      const res = await authFetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVisit),
      });

      if (res.ok) {
        loadVisits();
        // reset
        setShowCreateForm(false);
        setCreatePatient('');
        setCreateDoctor('');
        setCreateVisitDate('');
        setCreateDiagnoses([]);
        setCreatePrescribedMeds('');
        setCreateHasSickLeave(false);
        setCreateSickLeaveStart('');
        setCreateSickLeaveDays(0);
      } else {
        const errorText = await res.text();
        setError(`Failed to create visit: ${errorText}`);
      }
    } catch (err) {
      setError(`Error creating visit: ${String(err)}`);
    }
  };

  // multi-select for CREATE diagnoses
  const handleSelectCreateDiagnoses = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const values = selectedOptions.map((opt) => opt.value);
    setCreateDiagnoses(values);
  };

  // ----------------------------------------------------------------
  // EDIT Visit
  // ----------------------------------------------------------------
  const startEditVisit = (v: Visit) => {
    setEditingVisitId(v.id || null);
    // fill states
    setEditPatient(v.patientId);
    setEditDoctor(v.doctorId);
    setEditVisitDate(v.visitDate);
    setEditDiagnoses([...v.diagnosisIds]);
    setEditPrescribedMeds(v.prescribedMedications.join(', '));
    if (v.sickLeave) {
      setEditHasSickLeave(true);
      setEditSickLeaveStart(v.sickLeave.startDate);
      setEditSickLeaveDays(v.sickLeave.numberOfDays);
    } else {
      setEditHasSickLeave(false);
      setEditSickLeaveStart('');
      setEditSickLeaveDays(0);
    }
  };

  const handleUpdateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitId) return;

    const updatedVisit: Visit = {
      patientId: editPatient,
      doctorId: editDoctor,
      visitDate: editVisitDate,
      diagnosisIds: editDiagnoses,
      prescribedMedications: editPrescribedMeds
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m !== ''),
    };

    if (editHasSickLeave) {
      updatedVisit.sickLeave = {
        startDate: editSickLeaveStart,
        numberOfDays: editSickLeaveDays,
      };
    }

    try {
      const res = await authFetch(`/api/visits/${editingVisitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVisit),
      });

      if (res.ok) {
        loadVisits();
        // reset edit states
        setEditingVisitId(null);
      } else {
        const errorText = await res.text();
        setError(`Failed to update visit: ${errorText}`);
      }
    } catch (err) {
      setError(`Error updating visit: ${String(err)}`);
    }
  };

  // multi-select for EDIT diagnoses
  const handleSelectEditDiagnoses = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const values = selectedOptions.map((opt) => opt.value);
    setEditDiagnoses(values);
  };

  // ----------------------------------------------------------------
  // DELETE Visit
  // ----------------------------------------------------------------
  const handleDeleteVisit = async (visitId: string | undefined) => {
    if (!visitId) return;
    try {
      const res = await authFetch(`/api/visits/${visitId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadVisits();
      } else {
        const errorText = await res.text();
        setError(`Failed to delete visit: ${errorText}`);
      }
    } catch (err) {
      setError(`Error deleting visit: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Visits</h1>

      {/* Show errors */}
      {(error || lookupsError) && (
        <p className="text-red-500">
          {error || lookupsError}
        </p>
      )}

      {/* CREATE BUTTON */}
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        {showCreateForm ? 'Cancel' : 'Create Visit'}
      </button>

      {/* CREATE FORM */}
      {showCreateForm && (
        <form onSubmit={handleCreateVisit} className="p-4 border bg-white space-y-2 mt-2 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={createPatient}
              onChange={(e) => setCreatePatient(e.target.value)}
              required
            >
              <option value="">-- Select a patient --</option>
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} (ID: {pat.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={createDoctor}
              onChange={(e) => setCreateDoctor(e.target.value)}
              required
            >
              <option value="">-- Select a doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} (ID: {doc.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Visit Date</label>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={createVisitDate}
              onChange={(e) => setCreateVisitDate(e.target.value)}
              required
            />
          </div>

          {/* Multi-select Diagnoses */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diagnoses
            </label>
            <select
              multiple
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={createDiagnoses}
              onChange={handleSelectCreateDiagnoses}
            >
              {diagnoses.map((diag) => (
                <option key={diag.id} value={diag.id}>
                  {diag.name} (ID: {diag.id})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prescribed Medications (comma-separated)
            </label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              placeholder="e.g. Ibuprofen, Antibiotic"
              value={createPrescribedMeds}
              onChange={(e) => setCreatePrescribedMeds(e.target.value)}
            />
          </div>

          {/* SICK LEAVE TOGGLE */}
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={createHasSickLeave}
              onChange={(e) => setCreateHasSickLeave(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Sick Leave?
            </label>
          </div>

          {createHasSickLeave && (
            <div className="p-2 border rounded space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={createSickLeaveStart}
                  onChange={(e) => setCreateSickLeaveStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="number"
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={createSickLeaveDays}
                  onChange={(e) => setCreateSickLeaveDays(parseInt(e.target.value, 10))}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Save
          </button>
        </form>
      )}

      {/* EDIT FORM */}
      {editingVisitId && (
        <form onSubmit={handleUpdateVisit} className="p-4 border bg-white space-y-2 mt-2 max-w-md">
          <h2 className="text-lg font-semibold">Edit Visit</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Patient</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editPatient}
              onChange={(e) => setEditPatient(e.target.value)}
              required
            >
              <option value="">-- Select a patient --</option>
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} (ID: {pat.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <select
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editDoctor}
              onChange={(e) => setEditDoctor(e.target.value)}
              required
            >
              <option value="">-- Select a doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} (ID: {doc.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Visit Date</label>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editVisitDate}
              onChange={(e) => setEditVisitDate(e.target.value)}
              required
            />
          </div>

          {/* Multi-select Diagnoses */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Diagnoses
            </label>
            <select
              multiple
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editDiagnoses}
              onChange={handleSelectEditDiagnoses}
            >
              {diagnoses.map((diag) => (
                <option key={diag.id} value={diag.id}>
                  {diag.name} (ID: {diag.id})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Hold Ctrl or Cmd to select multiple
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prescribed Medications (comma-separated)
            </label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              placeholder="e.g. Ibuprofen, Antibiotic"
              value={editPrescribedMeds}
              onChange={(e) => setEditPrescribedMeds(e.target.value)}
            />
          </div>

          {/* SICK LEAVE TOGGLE */}
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={editHasSickLeave}
              onChange={(e) => setEditHasSickLeave(e.target.checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              Sick Leave?
            </label>
          </div>

          {editHasSickLeave && (
            <div className="p-2 border rounded space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={editSickLeaveStart}
                  onChange={(e) => setEditSickLeaveStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="number"
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  value={editSickLeaveDays}
                  onChange={(e) => setEditSickLeaveDays(parseInt(e.target.value, 10))}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Update
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded-md ml-2"
            onClick={() => setEditingVisitId(null)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* TABLE OF VISITS */}
      <table className="min-w-full bg-white mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Visit ID</th>
            <th className="px-4 py-2">Patient ID</th>
            <th className="px-4 py-2">Doctor ID</th>
            <th className="px-4 py-2">Visit Date</th>
            <th className="px-4 py-2">Diagnoses</th>
            <th className="px-4 py-2">Medications</th>
            <th className="px-4 py-2">Sick Leave</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((v) => (
            <tr key={v.id} className="border-b">
              <td className="px-4 py-2">{v.id}</td>
              <td className="px-4 py-2">{v.patientId}</td>
              <td className="px-4 py-2">{v.doctorId}</td>
              <td className="px-4 py-2">{v.visitDate}</td>
              <td className="px-4 py-2">{v.diagnosisIds?.join(', ')}</td>
              <td className="px-4 py-2">{v.prescribedMedications?.join(', ')}</td>
              <td className="px-4 py-2">
                {v.sickLeave
                  ? `From ${v.sickLeave.startDate} for ${v.sickLeave.numberOfDays} days`
                  : 'No'}
              </td>
              <td className="px-4 py-2">
                <button
                  className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => startEditVisit(v)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDeleteVisit(v.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitsPage;
