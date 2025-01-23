// src/pages/DiagnosesPage.tsx

import React, { useEffect, useState, FormEvent } from 'react';
import { useAuthFetch } from '../useAuthFetch';

interface Diagnosis {
  id: string;
  name: string;
  description: string;
}

const DiagnosesPage: React.FC = () => {
  const authFetch = useAuthFetch();

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [error, setError] = useState('');

  // CREATE form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // EDIT form states
  const [editingDiagnosisId, setEditingDiagnosisId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // On mount, load existing diagnoses
  useEffect(() => {
    loadDiagnoses();
  }, []);

  // ----------------------------------------------------------------
  // LOAD Diagnoses
  // ----------------------------------------------------------------
  const loadDiagnoses = async () => {
    try {
      const res = await authFetch('/api/diagnoses');
      if (res.ok) {
        const data: Diagnosis[] = await res.json();
        setDiagnoses(data);
      } else {
        const errorText = await res.text();
        setError(`Failed to load diagnoses: ${errorText}`);
      }
    } catch (err) {
      setError(`Error loading diagnoses: ${String(err)}`);
    }
  };

  // ----------------------------------------------------------------
  // CREATE Diagnosis
  // ----------------------------------------------------------------
  const handleCreateDiagnosis = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Build the request body
    const bodyData = {
      name: newName,
      description: newDesc,
    };

    try {
      const res = await authFetch('/api/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        // Refresh
        loadDiagnoses();
        // Reset
        setShowCreateForm(false);
        setNewName('');
        setNewDesc('');
      } else {
        const errorText = await res.text();
        setError(`Failed to create diagnosis: ${errorText}`);
      }
    } catch (err) {
      setError(`Error creating diagnosis: ${String(err)}`);
    }
  };

  // ----------------------------------------------------------------
  // EDIT Diagnosis
  // ----------------------------------------------------------------
  const startEditDiagnosis = (diag: Diagnosis) => {
    setEditingDiagnosisId(diag.id);
    setEditName(diag.name);
    setEditDesc(diag.description);
  };

  const handleUpdateDiagnosis = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingDiagnosisId) return;

    const bodyData = {
      name: editName,
      description: editDesc,
    };

    try {
      const res = await authFetch(`/api/diagnoses/${editingDiagnosisId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      if (res.ok) {
        // refresh
        loadDiagnoses();
        setEditingDiagnosisId(null);
      } else {
        const errorText = await res.text();
        setError(`Failed to update diagnosis: ${errorText}`);
      }
    } catch (err) {
      setError(`Error updating diagnosis: ${String(err)}`);
    }
  };

  // ----------------------------------------------------------------
  // DELETE Diagnosis
  // ----------------------------------------------------------------
  const handleDeleteDiagnosis = async (diagId: string) => {
    try {
      const res = await authFetch(`/api/diagnoses/${diagId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadDiagnoses();
      } else {
        const errorText = await res.text();
        setError(`Failed to delete diagnosis: ${errorText}`);
      }
    } catch (err) {
      setError(`Error deleting diagnosis: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Diagnoses</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* CREATE DIAGNOSIS BUTTON */}
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        {showCreateForm ? 'Cancel' : 'Create Diagnosis'}
      </button>

      {/* CREATE DIAGNOSIS FORM */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateDiagnosis}
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
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Save
          </button>
        </form>
      )}

      {/* EDIT DIAGNOSIS FORM */}
      {editingDiagnosisId && (
        <form
          onSubmit={handleUpdateDiagnosis}
          className="p-4 border bg-white space-y-2 mt-2 max-w-md"
        >
          <h2 className="text-lg font-semibold">Edit Diagnosis</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              className="mt-1 block w-full border-gray-300 rounded-md"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Update
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded-md ml-2"
            onClick={() => setEditingDiagnosisId(null)}
          >
            Cancel
          </button>
        </form>
      )}

      {/* TABLE OF DIAGNOSES */}
      <table className="min-w-full bg-white mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Diagnosis ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {diagnoses.map((d) => (
            <tr key={d.id} className="border-b">
              <td className="px-4 py-2">{d.id}</td>
              <td className="px-4 py-2">{d.name}</td>
              <td className="px-4 py-2">{d.description}</td>
              <td className="px-4 py-2">
                <button
                  className="mr-2 px-2 py-1 bg-blue-500 text-white rounded"
                  onClick={() => startEditDiagnosis(d)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDeleteDiagnosis(d.id)}
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

export default DiagnosesPage;
