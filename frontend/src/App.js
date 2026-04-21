import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';

// Protected Components
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import Chatbot from './pages/dashboard/Chatbot';
import ThreatDetection from './pages/dashboard/ThreatDetection';
import Logs from './pages/dashboard/Logs';
import Reports from './pages/dashboard/Reports';
import AIInsights from './pages/dashboard/AIInsights';
import Settings from './pages/dashboard/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col text-gray-200">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="chatbot" element={<Chatbot />} />
                <Route path="threats" element={<ThreatDetection />} />
                <Route path="logs" element={<Logs />} />
                <Route path="reports" element={<Reports />} />
                <Route path="insights" element={<AIInsights />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
