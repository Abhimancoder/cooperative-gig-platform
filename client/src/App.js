import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages - Public
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages - Customer
import CustomerDashboard from './pages/customer/Dashboard';
import BookService from './pages/customer/BookService';
import MyBookings from './pages/customer/MyBookings';
import TrackService from './pages/customer/TrackService';

// Pages - Provider
import ProviderDashboard from './pages/provider/Dashboard';
import JobRequests from './pages/provider/JobRequests';
import Earnings from './pages/provider/Earnings';
import ProviderProfile from './pages/provider/Profile';

// Pages - Cooperative
import Governance from './pages/cooperative/Governance';
import WelfareFund from './pages/cooperative/WelfareFund';

// Pages - Admin
import AdminDashboard from './pages/admin/Dashboard';
import Members from './pages/admin/Members';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<ProtectedRoute role="CUSTOMER" />}>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="book" element={<BookService />} />
              <Route path="bookings" element={<MyBookings />} />
              <Route path="track/:bookingId" element={<TrackService />} />
            </Route>

            {/* Provider Routes */}
            <Route path="/provider" element={<ProtectedRoute role="PROVIDER" />}>
              <Route path="dashboard" element={<ProviderDashboard />} />
              <Route path="jobs" element={<JobRequests />} />
              <Route path="earnings" element={<Earnings />} />
              <Route path="profile" element={<ProviderProfile />} />
              <Route path="governance" element={<Governance />} />
              <Route path="welfare" element={<WelfareFund />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="ADMIN" />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="members" element={<Members />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
