import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSearch as useSearchContext } from '../contexts/SearchContext';
import { useCategories } from '../modules/customer/home/hooks';
import { useNotifications } from '../components/shared/Notification';
import styles from './CustomerLayout.module.css';

/**
 * Customer Layout Component
 * Layout chính cho customer với sticky header, category nav, sidebar
 */
const CustomerLayout = () => {
  // State management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearButton, setShowClearButton] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Refs
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Hooks
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications('CUSTOMER', user?.id);
  const { updateSearch, clearSearch: clearSearchContext } = useSearchContext();
  const { categories, loading: categoriesLoading } = useCategories();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is profile, cart, or orders (pages without category nav & search)
  const isSimpleHeaderPage = ['/customer/profile', '/customer/cart', '/customer/orders', '/customer/invoices', '/customer/inbox'].includes(location.pathname);

  // Get table number from localStorage
  useEffect(() => {
    const savedTableNumber = localStorage.getItem('tableNumber');
    if (savedTableNumber) {
      setTableNumber(savedTableNumber);
    }
  }, []);

  // Scroll behavior: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Show header when scrolling up, hide when scrolling down
          if (currentScrollY < lastScrollY.current) {
            // Scrolling up
            setIsHeaderVisible(true);
          } else if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            // Scrolling down and past threshold
            setIsHeaderVisible(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate('/auth');
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowClearButton(value.length > 0);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      updateSearch(searchTerm.trim());

      // Navigate to home if not already there
      if (location.pathname !== '/customer/home') {
        navigate('/customer/home');
      }
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowClearButton(false);
    clearSearchContext();
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    clearSearchContext();
    setSearchTerm('');
    setShowClearButton(false);

    // If on home page, scroll to category section
    if (location.pathname === '/customer/home') {
      if (categoryId === null) {
        // Scroll to top for "Tất cả"
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Scroll to specific category section
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
          const headerOffset = 140; // Offset for sticky header + category nav
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    } else {
      // Navigate to home if not already there
      navigate('/customer/home');
    }
  };

  // Menu items
  const menuItems = [
    { path: '/customer/home', icon: 'fas fa-home', label: 'Trang chủ' },
    // { path: '/customer/notifications', icon: 'fas fa-bell', label: 'Thông báo', badge: unreadCount },
    { path: '/customer/cart', icon: 'fas fa-shopping-cart', label: 'Giỏ hàng' },
    { path: '/customer/orders', icon: 'fas fa-receipt', label: 'Đơn hàng' },
    { path: '/customer/invoices', icon: 'fas fa-file-invoice', label: 'Hóa đơn' },
    { path: '/customer/inbox', icon: 'fas fa-envelope', label: 'Tin nhắn' },
    { path: '/customer/profile', icon: 'fas fa-user', label: 'Cá nhân' },
  ];

  return (
    <div className={styles.layoutContainer}>
      {/* Sticky Header Wrapper */}
      <div className={`${styles.stickyHeaderWrapper} ${!isHeaderVisible ? styles.hidden : ''}`}>
        {/* Header */}
        <header className={styles.header}>
          {/* Hamburger Menu */}
          <div className={styles.menuToggle} onClick={toggleSidebar}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Table Number */}
          {tableNumber && (
            <div className={styles.tableNumber}>
              Bàn {tableNumber}
            </div>
          )}

          {/* Search Container - Hide on simple header pages */}
          {!isSimpleHeaderPage && (
            <form className={styles.searchContainer} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className={styles.searchBar}
                placeholder="Tìm món ăn..."
                value={searchTerm}
                onChange={handleSearchChange}
              />

              <button
                type="button"
                className={`${styles.clearSearch} ${showClearButton ? styles.show : ''}`}
                onClick={handleClearSearch}
              >
                <i className="fas fa-times"></i>
              </button>

              <button type="submit" className={styles.searchBtn}>
                <i className="fas fa-search"></i>
              </button>
            </form>
          )}

          {/* Cart Icon */}
          <div className={styles.cartIcon} onClick={() => navigate('/customer/cart')}>
            <i className="fas fa-shopping-cart"></i>
            {/* TODO: Add cart badge with item count */}
          </div>
        </header>

        {/* Category Navigation - Hide on simple header pages */}
        {!isSimpleHeaderPage && (
          <nav className={styles.categoryNav}>
            <ul className={styles.categoryList}>
              {/* All Categories */}
              <li
                className={`${styles.categoryItem} ${selectedCategory === null ? styles.active : ''}`}
                onClick={() => handleCategorySelect(null)}
              >
                Tất cả
              </li>

              {/* Category Items */}
              {!categoriesLoading && categories.map((category) => (
                <li
                  key={category.id}
                  className={`${styles.categoryItem} ${selectedCategory === category.id ? styles.active : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <h3>{user?.fullName || user?.phone || 'Khách'}</h3>
          <p>{user?.email || 'Khách vãng lai'}</p>
        </div>

        {/* Sidebar Menu */}
        <ul className={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.sidebarItem} ${location.pathname === item.path ? styles.active : ''}`}
                onClick={closeSidebar}
              >
                <div className={styles.sidebarIconWrapper}>
                  <i className={item.icon}></i>
                  {item.badge > 0 && (
                    <span className={styles.sidebarBadge}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.show : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet context={{ selectedCategory }} />
      </main>

      {/* Floating Chat Button */}
      {location.pathname !== '/customer/inbox' && (
        <div
          className={styles.floatingChatBtn}
          onClick={() => navigate('/customer/inbox')}
          title="Tin nhắn hỗ trợ"
        >
          <i className="fas fa-comment-dots"></i>
        </div>
      )}
    </div>
  );
};

export default CustomerLayout;
