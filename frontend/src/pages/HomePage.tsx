import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();

  if (!initialized) {
    return <div>Loading Keycloak...</div>;
  }

  const isAuthenticated = !!keycloak.authenticated;
  const isAdmin = keycloak.hasResourceRole('admin', 'medical-backend');
  const isDoctor = keycloak.hasResourceRole('doctor', 'medical-backend');
  const isPatient = keycloak.hasResourceRole('patient', 'medical-backend');

  const handleLogin = () => {
    keycloak.login();
  };

  const handleRegister = () => {
    // We'll push to our /register route (the new RegisterPage)
    navigate('/register');
  };

  return (
    <div className="space-y-6">
      {/* NAVBAR with login/register if not auth */}
      <div className="flex justify-end mb-4">
        {!isAuthenticated && (
          <>
            <button
              onClick={handleLogin}
              className="mr-2 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Register
            </button>
          </>
        )}
      </div>

      {/* If user is logged in, show dashboards */}
      {isAuthenticated && (
        <>
          <h1 className="text-3xl font-bold">
            Welcome, {keycloak.tokenParsed?.preferred_username}!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdmin && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
                <p className="text-gray-600">
                  You have full access to manage doctors, patients, visits, and system settings.
                </p>
              </div>
            )}
            {isDoctor && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Doctor Dashboard</h2>
                <p className="text-gray-600">
                  You can manage patient visits, create diagnoses, and view medical records.
                </p>
              </div>
            )}
            {isPatient && (
              <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Patient Dashboard</h2>
              <p className="text-gray-600">
                You can view your medical history, upcoming appointments, and personal information.
              </p>
            </div>
            )}
          </div>
        </>
      )}

      {/* If not authenticated, maybe a friendly welcome? */}
      {!isAuthenticated && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome to Medical System</h2>
          <p className="text-gray-600">
            Please log in or register to access your dashboard.
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;