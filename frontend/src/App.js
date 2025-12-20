import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';

// Job Seeker Pages
import SeekerDashboard from './pages/jobseeker/Dashboard';
import MyApplications from './pages/jobseeker/MyApplications';
import FavoriteJobs from './pages/jobseeker/FavoriteJobs';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import ManageJobs from './pages/employer/ManageJobs';
import EditJob from './pages/employer/EditJob';
import ViewApplications from './pages/employer/ViewApplications';
import AllApplications from './pages/employer/AllApplications';

// Shared Pages
import Messages from './pages/Messages';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/jobs/:id" element={<JobDetail />} />

              {/* Job Seeker Routes */}
              <Route
                path="/jobseeker/dashboard"
                element={
                  <PrivateRoute allowedRoles={['JOB_SEEKER']}>
                    <SeekerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobseeker/applications"
                element={
                  <PrivateRoute allowedRoles={['JOB_SEEKER']}>
                    <MyApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/jobseeker/favorites"
                element={
                  <PrivateRoute allowedRoles={['JOB_SEEKER']}>
                    <FavoriteJobs />
                  </PrivateRoute>
                }
              />

              {/* Employer Routes */}
              <Route
                path="/employer/dashboard"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <EmployerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs/new"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <PostJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/post-job"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <PostJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <ManageJobs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs/:id/edit"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <EditJob />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/jobs/:id/applications"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <ViewApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/employer/applications"
                element={
                  <PrivateRoute allowedRoles={['EMPLOYER']}>
                    <AllApplications />
                  </PrivateRoute>
                }
              />

              {/* Shared Protected Routes */}
              <Route
                path="/messages"
                element={
                  <PrivateRoute>
                    <Messages />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
