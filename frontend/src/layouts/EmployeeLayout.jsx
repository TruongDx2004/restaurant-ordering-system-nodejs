import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useModal } from '../contexts/ModalContext';
import { useAdminAuth } from '../contexts/admin/AdminAuthContext';
import { useNotifications } from '../components/shared/Notification';
import styles from './EmployeeLayout.module.css';

/**
 * Employee Layout Component
 * Layout cho nhân viên với sidebar navigation trên desktop 
 * và top header + bottom navigation trên mobile
 */
const EmployeeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showConfirm } = useModal();
  const { user, logout } = useAdminAuth();
  const { unreadCount } = useNotifications('USER', user?.id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle resize for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    showConfirm('Bạn có chắc muốn đăng xuất?', async () => {
      await logout();
      navigate('/admin/login');
    }, null, 'Xác nhận');
  };

  // Navigation items cho nhân viên
  const navItems = [
    {
      path: '/employee/orders',
      icon: 'fa-clipboard-list',
      label: 'Đơn hàng',
      shortLabel: 'Đơn',
      description: 'Cập nhật món ăn'
    },
    {
      path: '/employee/tables',
      icon: 'fa-table',
      label: 'Quản lý bàn',
      shortLabel: 'Bàn',
      description: 'Cập nhật trạng thái bàn'
    },
    {
      path: '/employee/notifications',
      icon: 'fa-bell',
      label: 'Thông báo',
      shortLabel: 'T.Báo',
      badge: unreadCount
    },
    {
      path: '/employee/inbox',
      icon: 'fa-envelope',
      label: 'Tin nhắn',
      shortLabel: 'Inbox',
      description: 'Hỗ trợ khách hàng'
    }
  ];

  return (
    <div className={`${styles.employeeLayout} ${isMobile ? styles.isMobile : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <header className={styles.mobileHeader}>
          <div className={styles.mobileLogo}>
            <i className="fas fa-utensils"></i>
            <span>Nhà hàng</span>
          </div>
          <div className={styles.mobileUser}>
            <span>{user?.fullName?.split(' ').pop() || 'NV'}</span>
            <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
          {/* Logo & Header */}
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>
              <i className="fas fa-user-tie"></i>
              {!sidebarCollapsed && <span>Nhân viên</span>}
            </div>
            <button
              className={styles.toggleBtn}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              <i className={`fas fa-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
            </button>
          </div>

          {/* User Info */}
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <i className="fas fa-user"></i>
            </div>
            {!sidebarCollapsed && (
              <div className={styles.userDetails}>
                <h4>{user?.fullName || user?.email || 'Nhân viên'}</h4>
                <span className={styles.userRole}>
                  <i className="fas fa-badge-check"></i>
                  Nhân viên
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             location.pathname.startsWith(item.path + '/');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <div className={styles.iconWrapper}>
                    <i className={`fas ${item.icon}`}></i>
                    {/* {item.badge > 0 && (
                      <span className={styles.sidebarBadge}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )} */}
                  </div>
                  {!sidebarCollapsed && (
                    <div className={styles.navItemContent}>
                      <span className={styles.navLabel}>{item.label}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className={styles.sidebarFooter}>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              title={sidebarCollapsed ? 'Đăng xuất' : ''}
            >
              <i className="fas fa-sign-out-alt"></i>
              {!sidebarCollapsed && <span>Đăng xuất</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile only) */}
      {isMobile && (
        <nav className={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.bottomNavItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.iconWrapper}>
                  <i className={`fas ${item.icon}`}></i>
                  {item.badge > 0 && (
                    <span className={styles.sidebarBadge}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span>{item.shortLabel}</span>
              </Link>
            );          })}
        </nav>
      )}
    </div>
  );
};

export default EmployeeLayout;
