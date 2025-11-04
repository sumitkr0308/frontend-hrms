// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import the new landing page
import LandingPage from './pages/LandingPage';

// Import all role-based pages
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import HRLogin from './pages/HRLogin';
import HRDashboard from './pages/HRDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import ClientJobDetailPage from './pages/ClientJobDetailPage';

// 🔐 Generic ProtectedRoute component for token-based access
const ProtectedRoute = ({ tokenName, redirectTo, children }) => {
  const token = localStorage.getItem(tokenName);
  return token ? children : <Navigate to={redirectTo} />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 🏠 Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* 👥 Client Routes */}
        <Route path="/client/login" element={<ClientLogin />} />
        <Route 
          path="/client/dashboard" 
          element={
            <ProtectedRoute tokenName="clientToken" redirectTo="/client/login">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/client/job/:jobId" 
          element={
            <ProtectedRoute tokenName="clientToken" redirectTo="/client/login">
              <ClientJobDetailPage />
            </ProtectedRoute>
          } 
        />

        {/* 💼 HR Routes */}
        <Route path="/hr/login" element={<HRLogin />} />
        <Route 
          path="/hr/dashboard" 
          element={
            <ProtectedRoute tokenName="hrToken" redirectTo="/hr/login">
              <HRDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/manager/dashboard" 
          element={
            <ProtectedRoute tokenName="hrToken" redirectTo="/hr/login">
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 🧑‍💼 Super Admin Routes (hidden access) */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route 
          path="/superadmin/dashboard" 
          element={
            <ProtectedRoute tokenName="superAdminToken" redirectTo="/superadmin/login">
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 🔄 Fallbacks for older or deprecated routes */}
        <Route path="/login" element={<Navigate to="/client/login" />} />
        <Route path="/admin" element={<Navigate to="/superadmin/login" />} />

        {/* 404 fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
