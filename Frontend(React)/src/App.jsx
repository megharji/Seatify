import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import EventDetailsPage from './pages/user/EventDetailsPage';
import WalletPage from './pages/user/WalletPage';
import BookingsPage from './pages/user/BookingsPage';
import EventsPage from './pages/user/EventsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import Event from './pages/admin/events/Event';
import CancelRefundPage from './pages/admin/CancelRefundPage';
import TransactionsPage from './pages/admin/TransactionsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <EventDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <EventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Event />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cancel-refund"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CancelRefundPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
