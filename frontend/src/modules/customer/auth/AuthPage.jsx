import React, { useState, useEffect } from 'react';
import { useAuthForm } from './hooks';
import { GuestAccess } from './components';
import { saveTableNumberFromUrl } from './utils';
import styles from './AuthPage.module.css';

/**
 * Authentication Page Component
 * Handles customer login and registration with modern UI
 */
const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Use separate hooks for login and register forms
  const loginForm = useAuthForm('login');
  const registerForm = useAuthForm('register');
  
  // Get current form based on active tab
  const currentForm = activeTab === 'login' ? loginForm : registerForm;

  // Save table number from URL on mount
  useEffect(() => {
    saveTableNumberFromUrl();
  }, []);

  // Reset form when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loginForm.resetForm();
    registerForm.resetForm();
  };

  return (
    <div className={styles.authPage}>
      {/* Background Image */}
      <div className={styles.background} />
      
      {/* Auth Container */}
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>QUÁN BÚN ĐẬU THẰNG BỜM</h1>
            <p className={styles.subtitle}>Đặt món ăn của bạn một cách nhanh chóng</p>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'login' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'register' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('register')}
            >
              Đăng ký
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={loginForm.handleSubmit} className={styles.form}>
                {/* General Error Message */}
                {loginForm.generalError && (
                  <div className={styles.errorAlert}>
                    <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {loginForm.generalError}
                  </div>
                )}

                {/* Phone Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="login-phone" className={styles.label}>
                    Số điện thoại
                  </label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      id="login-phone"
                      name="phone"
                      value={loginForm.formData.phone}
                      onChange={loginForm.handleChange}
                      className={`${styles.input} ${loginForm.errors.phone ? styles.inputError : ''}`}
                      placeholder="Nhập số điện thoại"
                      maxLength={10}
                    />
                  </div>
                  {loginForm.errors.phone && (
                    <p className={styles.errorText}>{loginForm.errors.phone}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="login-password" className={styles.label}>
                    Mật khẩu
                  </label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      id="login-password"
                      name="password"
                      value={loginForm.formData.password}
                      onChange={loginForm.handleChange}
                      className={`${styles.input} ${loginForm.errors.password ? styles.inputError : ''}`}
                      placeholder="Nhập mật khẩu"
                    />
                  </div>
                  {loginForm.errors.password && (
                    <p className={styles.errorText}>{loginForm.errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loginForm.isLoading}
                >
                  {loginForm.isLoading ? (
                    <>
                      <svg className={styles.spinner} viewBox="0 0 24 24">
                        <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    'Đăng Nhập'
                  )}
                </button>

                {/* Guest Access */}
                <GuestAccess />
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={registerForm.handleSubmit} className={styles.form}>
                {/* General Error Message */}
                {registerForm.generalError && (
                  <div className={styles.errorAlert}>
                    <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {registerForm.generalError}
                  </div>
                )}

                {/* Full Name Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="register-fullName" className={styles.label}>
                    Họ và tên
                  </label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input
                      type="text"
                      id="register-fullName"
                      name="fullName"
                      value={registerForm.formData.fullName}
                      onChange={registerForm.handleChange}
                      className={`${styles.input} ${registerForm.errors.fullName ? styles.inputError : ''}`}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  {registerForm.errors.fullName && (
                    <p className={styles.errorText}>{registerForm.errors.fullName}</p>
                  )}
                </div>

                {/* Phone Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="register-phone" className={styles.label}>
                    Số điện thoại
                  </label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel"
                      id="register-phone"
                      name="phone"
                      value={registerForm.formData.phone}
                      onChange={registerForm.handleChange}
                      className={`${styles.input} ${registerForm.errors.phone ? styles.inputError : ''}`}
                      placeholder="Nhập số điện thoại"
                      maxLength={10}
                    />
                  </div>
                  {registerForm.errors.phone && (
                    <p className={styles.errorText}>{registerForm.errors.phone}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="register-password" className={styles.label}>
                    Mật khẩu
                  </label>
                  <div className={styles.inputWrapper}>
                    <svg className={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="password"
                      id="register-password"
                      name="password"
                      value={registerForm.formData.password}
                      onChange={registerForm.handleChange}
                      className={`${styles.input} ${registerForm.errors.password ? styles.inputError : ''}`}
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    />
                  </div>
                  {registerForm.errors.password && (
                    <p className={styles.errorText}>{registerForm.errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={registerForm.isLoading}
                >
                  {registerForm.isLoading ? (
                    <>
                      <svg className={styles.spinner} viewBox="0 0 24 24">
                        <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    'Đăng Ký'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
