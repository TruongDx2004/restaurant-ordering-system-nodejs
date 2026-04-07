import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/admin/AdminAuthContext';
import { useNotifications } from '../components/shared/Notification';
import styles from './AdminLayout.module.css';

/**
 * Admin Layout Component
 * Professional admin panel layout with sidebar, header, and content area
 */
const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAdminAuth();
  const { unreadCount } = useNotifications('USER', user?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  /**
   * Toggle sidebar
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Check if menu item is active
   */
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  /**
   * Get page title from pathname
   */
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles = {
      'dashboard': 'Dashboard',
      'users': 'Quản lý Users',
      'tables': 'Quản lý Bàn',
      'products': 'Quản lý Sản phẩm',
      'orders': 'Quản lý Đơn hàng'
    };
    return titles[path] || 'Dashboard';
  };

  /**
   * Menu items based on role
   */
  const menuItems = [
    {
      icon: 'fa-chart-line',
      label: 'Dashboard',
      path: '/admin/dashboard',
      roles: ['ADMIN', 'EMPLOYEE']
    },
    /*
    {
      icon: 'fa-bell',
      label: 'Thông báo',
      path: '/admin/notifications',
      roles: ['ADMIN', 'EMPLOYEE'],
      badge: unreadCount
    },
    */
    {
      icon: 'fa-shopping-cart',
      label: 'Đơn hàng',
      path: '/admin/orders',
      roles: ['ADMIN', 'EMPLOYEE']
    },
    {
      icon: 'fa-utensils',
      label: 'Sản phẩm',
      path: '/admin/products',
      roles: ['ADMIN']
    },
    {
      icon: 'fa-table',
      label: 'Bàn ăn',
      path: '/admin/tables',
      roles: ['ADMIN', 'EMPLOYEE']
    },
    {
      icon: 'fa-users-cog',
      label: 'Người dùng',
      path: '/admin/users',
      roles: ['ADMIN']
    }
  ];

  // Filter menu items by role
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role)
  );

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : styles.closed}`}>
        {/* Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <i className="fas fa-utensils"></i>
            {sidebarOpen && <span>Restaurant Admin</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <div className={styles.iconWrapper}>
                <i className={`fas ${item.icon}`}></i>
                {item.badge > 0 && (
                  <span className={styles.sidebarBadge}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.toggleButton} onClick={toggleSidebar}>
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
            {sidebarOpen && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuToggle} onClick={toggleSidebar}>
              <i className="fas fa-bars"></i>
            </button>
            <h1>{getPageTitle()}</h1>
          </div>

          <div className={styles.headerRight}>
            {/* User Menu */}
            <div className={styles.userSection}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatar}>
                  <i className="fas fa-user"></i>
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.name}</span>
                  <span className={styles.userRole}>
                    {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                  </span>
                </div>
                <i className={`fas fa-chevron-down ${styles.chevron}`}></i>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div className={styles.backdrop} onClick={() => setShowUserMenu(false)}></div>
                  <div className={styles.userMenu}>
                    <div className={styles.menuHeader}>
                      <div className={styles.menuAvatar}>
                        <i className="fas fa-user"></i>
                      </div>
                      <div>
                        <div className={styles.menuName}>{user?.name}</div>
                        <div className={styles.menuEmail}>{user?.email}</div>
                      </div>
                    </div>
                    <div className={styles.menuDivider}></div>
                    <button className={styles.menuItem}>
                      <i className="fas fa-user-circle"></i>
                      <span>Hồ sơ</span>
                    </button>
                    <button className={styles.menuItem}>
                      <i className="fas fa-cog"></i>
                      <span>Cài đặt</span>
                    </button>
                    <div className={styles.menuDivider}></div>
                    <button className={styles.menuItem} onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>© 2026 Restaurant Management System. All rights reserved.</p>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default AdminLayout;
