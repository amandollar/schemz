import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import MatchedSchemes from './pages/user/MatchedSchemes';
import AllSchemes from './pages/user/AllSchemes';
import SchemeDetail from './pages/user/SchemeDetail';
import ApplyOrganizer from './pages/user/ApplyOrganizer';
import MyApplications from './pages/user/MyApplications';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateScheme from './pages/organizer/CreateScheme';
import MySchemes from './pages/organizer/MySchemes';
import EditScheme from './pages/organizer/EditScheme';
import SchemeApplications from './pages/organizer/SchemeApplications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import PendingSchemes from './pages/admin/PendingSchemes';
import AdminAllSchemes from './pages/admin/AllSchemes';
import PendingApplications from './pages/admin/PendingApplications';
import AllApplications from './pages/admin/AllApplications';

function AppContent() {
  const location = useLocation();
  const hideNavbar = ['/login', '/register', '/', '/verify-email'].includes(location.pathname) || location.pathname.startsWith('/verify-email/');

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

            {/* User Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/matched-schemes"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MatchedSchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/all-schemes"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <AllSchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/scheme/:id"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <SchemeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/apply-organizer"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <ApplyOrganizer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/my-applications"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MyApplications />
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/create-scheme"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <CreateScheme />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/my-schemes"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <MySchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/edit-scheme/:id"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <EditScheme />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizer/scheme-applications/:schemeId"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <SchemeApplications />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-schemes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PendingSchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/all-schemes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAllSchemes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PendingApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/all-applications"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AllApplications />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
