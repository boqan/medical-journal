// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// For typing the doctor list items
interface DoctorItem {
  id: string;              // matches your Doctor entity's @Id
  keycloakUserId: string;
  name: string;
  specialties: string[];
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Basic fields for user registration
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [message, setMessage] = useState('');

  // Additional fields for doctor or patient
  const [egn, setEgn] = useState('');            // for patient
  const [name, setName] = useState('');          // for doctor
  const [specialties, setSpecialties] = useState(''); // for doctor

  // For patient's personalDoctorId
  const [personalDoctorId, setPersonalDoctorId] = useState('');

  // Store the list of doctors to populate dropdown
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);

  // Track whether registration was successful
  const [registered, setRegistered] = useState(false);

  // On component mount, fetch the list of doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await fetch('/api/doctors/all'); 
        if (res.ok) {
          const data: DoctorItem[] = await res.json();
          setDoctors(data);
        } else {
          console.error('Failed to fetch doctors');
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    loadDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Build the request body
      const bodyData: any = {
        username,
        password,
        role
      };

      if (role === 'patient') {
        bodyData.egn = egn;
        bodyData.personalDoctorId = personalDoctorId;
      } else if (role === 'doctor') {
        bodyData.name = name;
        bodyData.specialties = specialties
          .split(',')
          .map((s) => s.trim());
      }

      // If you're not using a Vite proxy, you might need the full URL like:
      // const response = await fetch('http://localhost:8082/api/auth/register', { ... })
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        setMessage('Registration successful! You can now log in.');
        setRegistered(true);

        // OPTIONAL: if you want auto-redirect after 2 seconds:
        // setTimeout(() => {
        //   navigate(-1); // go back or navigate('/') for home
        // }, 2000);
      } else {
        const errorText = await response.text();
        setMessage(`Registration failed: ${errorText}`);
      }
    } catch (error) {
      setMessage(`Error: ${String(error)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
          Register New Account
        </h2>

        {message && (
          <div className="text-center text-sm text-red-500 mb-2">{message}</div>
        )}

        {!registered && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            {/* If role=patient, show EGN + Personal Doctor dropdown */}
            {role === 'patient' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    EGN
                  </label>
                  <input
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    value={egn}
                    onChange={(e) => setEgn(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Personal Doctor
                  </label>
                  <select
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    value={personalDoctorId}
                    onChange={(e) => setPersonalDoctorId(e.target.value)}
                  >
                    <option value="">-- Select a doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialties.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* If role=doctor, show name + specialties */}
            {role === 'doctor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Specialties (comma-separated)
                  </label>
                  <input
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4
                border border-transparent text-sm font-medium rounded-md text-white 
                bg-indigo-600 hover:bg-indigo-700"
            >
              Register
            </button>
          </form>
        )}

        {/* If registration was successful, show a "Go Back" button */}
        {registered && (
          <div className="text-center mt-4 space-y-4">
            <p className="text-green-600 font-medium">
              {message}
            </p>
            <button
              className="inline-block px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;