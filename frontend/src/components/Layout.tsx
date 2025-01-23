import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { LogOut, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!initialized) {
    return <div>Loading Keycloak...</div>;
  }

  const handleLogout = () => {
    keycloak.logout();
  };

  // Roles
  const isAdmin = keycloak.hasResourceRole('admin', 'medical-backend');
  const isDoctor = keycloak.hasResourceRole('doctor', 'medical-backend');
  const isPatient = keycloak.hasResourceRole('patient', 'medical-backend');

  const username = keycloak.tokenParsed?.preferred_username || '';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="ml-4 font-semibold text-lg">Medical System</span>
            </div>
            <div className="flex items-center">
              <span className="mr-4">{username}</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex">
        <aside
          className={`w-64 bg-white shadow-md transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-150 ease-in-out fixed left-0 top-16 h-full`}
        >
          <nav className="mt-5 px-2">
            {/* Dashboard */}
            <button
              onClick={() => navigate('/')}
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
            >
              Dashboard
            </button>

            {/* Doctor/Admin Routes */}
            {(isAdmin || isDoctor) && (
              <>
                <button
                  onClick={() => navigate('/visits')}
                  className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                >
                  Visits
                </button>
                <button
                  onClick={() => navigate('/patients')}
                  className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                >
                  Patients
                </button>
                <button
                  onClick={() => navigate('/diagnoses')}
                  className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                >
                  Diagnoses
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                >
                  Reports
                </button>
              </>
            )}

            {/* Admin-Only Route */}
            {isAdmin && (
              <button
                onClick={() => navigate('/doctors')}
                className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
              >
                Doctors
              </button>
            )}

            {/* Patient-Specific Route */}
            {isPatient && (
                <>
                  <button
                    onClick={() => navigate('/my-visits')}
                    className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                  >
                    My Visits
                  </button>
                  <button
                    onClick={() => navigate('/my-doctor')}
                    className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                  >
                    My Doctor
                  </button>
                  <button
                    onClick={() => navigate('/my-insurance')}
                    className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full"
                  >
                    My Insurance
                  </button>
                </>
              )}
          </nav>
        </aside>

        <main
          className={`flex-1 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          } transition-margin duration-150 ease-in-out p-6`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
