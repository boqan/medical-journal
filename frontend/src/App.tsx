// App.tsx (After)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { PrivateRoute } from './components/PrivateRoute';
import RegisterPage from './pages/RegisterPage'; // Add this import

// import the new pages
import VisitsPage from './pages/VisitsPage.tsx';
import PatientsPage from './pages/PatientsPage.tsx';
import DiagnosesPage from './pages/DiagnosesPage.tsx';
import ReportsPage from './pages/ReportsPage.tsx';

import MyVisitsPage from './pages/MyVisitsPage.tsx';
import MyDoctorPage from './pages/MyDoctorPage';
import MyInsurancePage from './pages/MyInsurancePage';

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false
      }}
    >
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <Layout>
                <HomePage />
              </Layout>
            } 
          />
          <Route path="/register" element={<RegisterPage />} /> {/* Add this route */}

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes for doctors/admin */}
          <Route 
            path="/visits" 
            element={
              <PrivateRoute>
                <Layout>
                  <VisitsPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <PrivateRoute>
                <Layout>
                  <PatientsPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/diagnoses" 
            element={
              <PrivateRoute>
                <Layout>
                  <DiagnosesPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <PrivateRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </PrivateRoute>
            } 
          />
                    <Route
            path="/my-visits"
            element={
              <PrivateRoute requiredRoles={['patient']}>
                <Layout>
                  <MyVisitsPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-doctor"
            element={
              <PrivateRoute requiredRoles={['patient']}>
                <Layout>
                  <MyDoctorPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/my-insurance"
            element={
              <PrivateRoute requiredRoles={['patient']}>
                <Layout>
                  <MyInsurancePage />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ReactKeycloakProvider>
  );
}

export default App;
