import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/admin/AdminAuthContext';

/**
 * Protected Route Component for Employee
 * Redirects to login if not authenticated or not an employee
 */
const ProtectedEmployeeRoute = ({ children }) => {
  const { isAuthenticated, isEmployee, isAdmin, loading } = useAdminAuth();

  // Show loading state
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

  // Check authentication
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  // Allow both EMPLOYEE and ADMIN to access employee routes
  // Admin can view employee pages for testing/supervision
  if (!isEmployee() && !isAdmin()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f6fa',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <i className="fas fa-lock" style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Không có quyền truy cập</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            Bạn không có quyền truy cập trang này. Chỉ nhân viên mới có thể truy cập.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedEmployeeRoute;
