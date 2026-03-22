import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';

// Lazy load pages for better performance
const Login = React.lazy(() => import('../pages/Login'));
const Signup = React.lazy(() => import('../pages/Signup'));
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const CreateContest = React.lazy(() => import('../pages/CreateContest'));
const ContestWrapper = React.lazy(() => import('../pages/ContestWrapper'));
const ProblemDetail = React.lazy(() => import('../pages/ProblemDetail'));
const Leaderboard = React.lazy(() => import('../pages/Leaderboard'));

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <Outlet />
                </div>
              </div>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contest/create" element={<CreateContest />} />
            <Route path="/contest/:id" element={<ContestWrapper />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
            <Route path="/leaderboard/:contestId" element={<Leaderboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
