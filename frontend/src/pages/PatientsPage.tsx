// src/pages/PatientsPage.tsx
import React, { useEffect, useState, FormEvent } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useAuthFetch } from '../useAuthFetch';
import { useCommonLookups, DoctorItem } from '../useCommonLookups';

interface Patient {
  id: string;
  keycloakUserId: string;
  name: string;
  egn: string;
  personalDoctorId: string;
  // optionally lastInsurancePaidDate, etc.
}

const PatientsPage: React.FC = () => {
  const { keycloak } = useKeycloak();
  const authFetch = useAuthFetch();

  // Use the same hook for doctors, etc.
  const { doctors, error: lookupsError } = useCommonLookups();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState('');

  // Distinguish roles
  const isAdmin = keycloak.hasResourceRole('admin', 'medical-backend');
  const isDoctor = keycloak.hasResourceRole('doctor', 'medical-backend');

  // We'll store "myDoctor" once we find it by matching keycloakUserId
  const [myDoctor, setMyDoctor] = useState<DoctorItem | null>(null);

  // CREATE form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEgn, setNewEgn] = useState('');
  const [newPersonalDoc, setNewPersonalDoc] = useState('');

  // EDIT form states
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEgn, setEditEgn] = useState('');
  const [editPersonalDoc, setEditPersonalDoc] = useState('');

  // 1) Load Patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  // 2) Once doctors are loaded, if user is a doctor, find which doc record is "mine"
  useEffect(() => {
    if (isDoctor && doctors.length > 0) {
      const userSub = keycloak.tokenParsed?.sub || '';
      const found = doctors.find((d) => d.keycloakUserId === userSub);
      if (found) {
        setMyDoctor(found);
      }
    }
  }, [isDoctor, doctors]);

  const loadPatients = async () => {
    try {
      const res = await authFetch('/api/patients');
      if (!res.ok) {
        const errorText = await res.text();
        setError(`Failed to load patients: ${errorText}`);
        return;
      }
      const data: Patient[] = await res.json();
      setPatients(data);
    } catch (err) {
      setError(`Error loading patients: ${String(err)}`);
    }
  };

  // Filter the displayed patients if user is doctor & we have myDoctor
  const displayedPatients = isDoctor && myDoctor
    ? patients.filter((p) => p.personalDoctorId === myDoctor.id)
    : patients;

  // CREATE patient
  const handleCreatePatient = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const bodyData = {
      name: newName,
      egn: newEgn,
      personalDoctorId: newPersonalDoc, // either from doc's ID or admin's selection
    };

    try {
      const res = await authFetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        loadPatients();
        setShowCreateForm(false);
        setNewName('');
        setNewEgn('');
        setNewPersonalDoc('');
      } else {
        const errorText = await res.text();
        setError(`Failed to create patient: ${errorText}`);
      }
    } catch (err) {
      setError(`Error creating patient: ${String(err)}`);
    }
  };

  // START EDITING
  const startEditPatient = (p: Patient) => {
    setEditingPatientId(p.id);
    setEditName(p.name);
    setEditEgn(p.egn);
    setEditPersonalDoc(p.personalDoctorId);
  };

  // UPDATE patient
  const handleUpdatePatient = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPatientId) return;

    const bodyData = {
      name: editName,
      egn: editEgn,
      personalDoctorId: editPersonalDoc,
    };

    try {
      const res = await authFetch(`/api/patients/${editingPatientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        loadPatients();
        setEditingPatientId(null);
      } else {
        const errorText = await res.text();
        setError(`Failed to update patient: ${errorText}`);
      }
    } catch (err) {
      setError(`Error updating patient: ${String(err)}`);
    }
  };

  // DELETE patient
  const handleDeletePatient = async (patientId: string) => {
    try {
      const res = await authFetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadPatients();
      } else {
        const errorText = await res.text();
        setError(`Failed to delete patient: ${errorText}`);
      }
    } catch (err) {
      setError(`Error deleting patient: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      {isDoctor && myDoctor ? (
        <h1 className="text-2xl font-bold">
          Patients of Dr. {myDoctor.name} (ID: {myDoctor.id})
        </h1>
      ) : isAdmin ? (
        <h1 className="text-2xl font-bold">All Patients</h1>
      ) : (
        <h1 className="text-2xl font-bold">Patients</h1>
      )}

      {(error || lookupsError) && (
        <p className="text-red-500">{error || lookupsError}</p>
      )}

      {/* CREATE PATIENT BUTTON */}
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        onClick={() => {
          setShowCreateForm(!showCreateForm);
          // If user is a doctor & we have found myDoctor,
          // automatically set newPersonalDoc to myDoctor.id
          if (isDoctor && myDoctor) {
            setNewPersonalDoc(myDoctor.id);
          }
        }}
      >
        {showCreateForm ? 'Cancel' : 'Create Patient'}
      </button>

      {/* CREATE PATIENT FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreatePatient}
          className="p-4 border bg-white space-y-2 mt-2 max-w-md"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">EGN</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={newEgn}
              onChange={(e) => setNewEgn(e.target.value)}
              required
            />
          </div>

          {/* If admin -> show dropdown for any doctor. If doctor -> read-only input. */}
          {isAdmin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Doctor
              </label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md"
                value={newPersonalDoc}
                onChange={(e) => setNewPersonalDoc(e.target.value)}
                required
              >
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} (ID: {doc.id})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Doctor
              </label>
              <input
                className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100"
                value={newPersonalDoc}
                readOnly
              />
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

      {/* EDIT PATIENT FORM */}
      {editingPatientId && (
        <form
          onSubmit={handleUpdatePatient}
          className="p-4 border bg-white space-y-2 mt-2 max-w-md"
        >
          <h2 className="text-lg font-semibold">Edit Patient</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">EGN</label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editEgn}
              onChange={(e) => setEditEgn(e.target.value)}
              required
            />
          </div>

          {/* If admin -> dropdown. If doc -> read-only. */}
          {isAdmin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Doctor
              </label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md"
                value={editPersonalDoc}
                onChange={(e) => setEditPersonalDoc(e.target.value)}
                required
              >
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} (ID: {doc.id})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Doctor
              </label>
              <input
                className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100"
                value={editPersonalDoc}
                readOnly
              />
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
            onClick={() => setEditingPatientId(null)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* TABLE */}
      <table className="min-w-full bg-white mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Patient ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">EGN</th>
            <th className="px-4 py-2">Personal Doctor</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedPatients.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="px-4 py-2">{p.id}</td>
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">{p.egn}</td>
              <td className="px-4 py-2">{p.personalDoctorId}</td>
              <td className="px-4 py-2">
                <button
                  className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => startEditPatient(p)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDeletePatient(p.id)}
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

export default PatientsPage;