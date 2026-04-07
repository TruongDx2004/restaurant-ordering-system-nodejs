import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/admin/AdminAuthContext';

/**
 * Protected Route Component for Admin/Employee
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 */
const ProtectedAdminRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading, hasRole } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f6fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#667eea' }}></i>
          <p style={{ marginTop: '20px', color: '#7f8c8d' }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
  return <Navigate to="/admin/login" replace />;
}

  return children;
};

export default ProtectedAdminRoute;
