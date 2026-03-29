import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/admin/AdminAuthContext';
import styles from './LoginPage.module.css';

/**
 * Admin/Employee Login Page - Desktop Optimized
 * Two-column layout: Branding + Login Form
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, user, error: authError } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      if (isAdmin()) {
        navigate('/admin/dashboard');
      } else if (user?.role === 'EMPLOYEE') {
        navigate('/employee/orders');
      } else {
        navigate('/employee/orders');
      }
    }
  }, [isAuthenticated, isAdmin, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        console.log('Login successful:', result.user);
      } else {
        setErrors({
          submit: result.error || 'Đăng nhập thất bại'
        });
      }
    } catch (err) {
      setErrors({
        submit: 'Đã xảy ra lỗi. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@restaurant.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        email: 'employee@restaurant.com',
        password: 'emp123'
      });
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left Panel - Branding & Features */}
      <div className={styles.brandingPanel}>
        <div className={styles.brandingContent}>
          {/* Logo & Title */}
          <div className={styles.brandingHeader}>
            <div className={styles.brandingLogo}>
              <div className={styles.logoCircle}>
                <i className="fas fa-utensils"></i>
              </div>
            </div>
            <h1 className={styles.brandingTitle}>Restaurant Management</h1>
            <p className={styles.brandingSubtitle}>Hệ thống quản lý nhà hàng thông minh</p>
          </div>

          {/* Features List */}
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className={styles.featureContent}>
                <h3>Dashboard Thông Minh</h3>
                <p>Theo dõi doanh thu và đơn hàng real-time với WebSocket</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <i className="fas fa-concierge-bell"></i>
              </div>
              <div className={styles.featureContent}>
                <h3>Quản Lý Món Ăn</h3>
                <p>Cập nhật menu, giá cả và trạng thái món ăn dễ dàng</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <i className="fas fa-users"></i>
              </div>
              <div className={styles.featureContent}>
                <h3>Quản Lý Nhân Viên</h3>
                <p>Phân quyền chi tiết và theo dõi hiệu suất làm việc</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>
                <i className="fas fa-receipt"></i>
              </div>
              <div className={styles.featureContent}>
                <h3>Xử Lý Đơn Hàng</h3>
                <p>Quản lý đơn hàng và thanh toán tự động, nhanh chóng</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.brandingFooter}>
            <p>© 2024 Restaurant Management System</p>
            <p className={styles.version}>Version 2.0 - Desktop Edition</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.loginPanel}>
        <div className={styles.loginContainer}>
          <div className={styles.loginBox}>
            {/* Header */}
            <div className={styles.loginHeader}>
              <div className={styles.headerBadge}>
                <i className="fas fa-shield-alt"></i>
                <span>Admin Portal</span>
              </div>
              <h2>Đăng Nhập</h2>
              <p>Vui lòng đăng nhập để tiếp tục quản lý hệ thống</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              {/* Email Field */}
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@restaurant.com"
                    className={errors.email ? styles.inputError : ''}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className={styles.errorMessage}>
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className={styles.formGroup}>
                <label htmlFor="password">Mật khẩu</label>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputIcon}>
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={errors.password ? styles.inputError : ''}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorMessage}>
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Submit Error */}
              {(errors.submit || authError) && (
                <div className={styles.submitError}>
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{errors.submit || authError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={styles.divider}>
              <span>Hoặc sử dụng tài khoản demo</span>
            </div>

            {/* Demo Accounts */}
            <div className={styles.demoSection}>
              <div className={styles.demoButtons}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className={`${styles.demoButton} ${styles.adminDemo}`}
                  disabled={loading}
                >
                  <div className={styles.demoIcon}>
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <div className={styles.demoInfo}>
                    <strong>Admin</strong>
                    <small>admin@restaurant.com</small>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('employee')}
                  className={`${styles.demoButton} ${styles.employeeDemo}`}
                  disabled={loading}
                >
                  <div className={styles.demoIcon}>
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className={styles.demoInfo}>
                    <strong>Employee</strong>
                    <small>employee@restaurant.com</small>
                  </div>
                </button>
              </div>
            </div>

            {/* Help Text */}
            <div className={styles.helpText}>
              <i className="fas fa-info-circle"></i>
              <span>Click vào tài khoản demo để tự động điền thông tin đăng nhập</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
