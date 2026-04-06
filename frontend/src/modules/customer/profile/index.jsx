import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { DesktopWarning } from '../../../components/shared';
import styles from './index.module.css';

/**
 * ProfilePage Component - Customer Profile Dashboard
 * Hiển thị thông tin khách hàng với thiết kế modern, clean
 */
export const ProfilePage = () => {
  const [tableNumber, setTableNumber] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load table number và login time từ localStorage
  useEffect(() => {
    const loadData = () => {
      const savedTableNumber = localStorage.getItem('tableNumber');
      const savedLoginTime = localStorage.getItem('loginTime');

      setTableNumber(savedTableNumber || 'Chưa chọn bàn');

      if (savedLoginTime) {
        const date = new Date(savedLoginTime);
        setLoginTime(date.toLocaleString('vi-VN'));
      } else {
        // Nếu chưa có, lưu thời gian hiện tại
        const now = new Date();
        localStorage.setItem('loginTime', now.toISOString());
        setLoginTime(now.toLocaleString('vi-VN'));
      }

      // Simulate loading
      setTimeout(() => setIsLoading(false), 300);
    };

    loadData();
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Handle go to home
  const handleGoHome = () => {
    navigate('/customer/home');
  };

  // Feature cards data (future features)
  const featureCards = [
    {
      icon: 'fa-receipt',
      title: 'Lịch sử đơn hàng',
      description: 'Xem lại các đơn đã đặt',
      badge: 'Sắp ra mắt',
      disabled: true
    },
    {
      icon: 'fa-star',
      title: 'Điểm tích lũy',
      description: 'Tích điểm đổi quà',
      points: 0,
      disabled: true
    },
    {
      icon: 'fa-gift',
      title: 'Khuyến mãi',
      description: 'Voucher & ưu đãi cá nhân',
      badge: 'Sắp ra mắt',
      disabled: true
    },
    {
      icon: 'fa-comment-dots',
      title: 'Đánh giá',
      description: 'Gửi feedback nhà hàng',
      badge: 'Sắp ra mắt',
      disabled: true
    }
  ];

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopWarning />
      <div className={styles.container}>
        {/* Logout Button */}
        <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất">
          <i className="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </button>

        {/* Header Profile Card (30%) */}
        <div className={styles.headerCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <i className="fas fa-user"></i>
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.phoneNumber}>{user?.phone || 'Khách vãng lai'}</h2>
              <span className={styles.statusBadge}>
                <i className="fas fa-circle"></i>
                Đang hoạt động
              </span>
            </div>
          </div>

          <div className={styles.quickInfo}>
            <div className={styles.tableChip}>
              <i className="fas fa-chair"></i>
              Bàn số {tableNumber}
            </div>
            <div className={styles.loginTime}>
              <i className="fas fa-clock"></i>
              Đăng nhập: {loginTime}
            </div>
          </div>
        </div>

        {/* Main Content (70%) */}
        <div className={styles.mainContent}>
          {/* Account Information Card */}
          <div className={styles.accountCard}>
            <h3 className={styles.sectionTitle}>Thông tin tài khoản</h3>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-phone"></i>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.label}>Số điện thoại</span>
                  <span className={styles.value}>{user?.phone || 'Chưa có'}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-chair"></i>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.label}>Bàn đang sử dụng</span>
                  <span className={styles.value}>Bàn số {tableNumber}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-clock"></i>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.label}>Thời gian đăng nhập</span>
                  <span className={styles.value}>{loginTime}</span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <div className={styles.infoIcon}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className={styles.infoText}>
                  <span className={styles.label}>Trạng thái</span>
                  <span className={`${styles.value} ${styles.verified}`}>
                    <i className="fas fa-shield-alt"></i>
                    Đã xác thực
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Features Grid */}
          {0 && (
            <div className={styles.featuresSection}>
              <h3 className={styles.sectionTitle}>Tính năng</h3>

              <div className={styles.featuresGrid}>
                {featureCards.map((feature, index) => (
                  <div
                    key={index}
                    className={`${styles.featureCard} ${feature.disabled ? styles.disabled : ''}`}
                    title={feature.disabled ? 'Tính năng sắp ra mắt' : feature.title}
                  >
                    <div className={styles.featureIcon}>
                      <i className={`fas ${feature.icon}`}></i>
                    </div>
                    <div className={styles.featureContent}>
                      <h4 className={styles.featureTitle}>{feature.title}</h4>
                      <p className={styles.featureDesc}>{feature.description}</p>

                      {feature.badge && (
                        <span className={styles.comingSoonBadge}>{feature.badge}</span>
                      )}

                      {feature.points !== undefined && (
                        <div className={styles.pointsSection}>
                          <span className={styles.points}>{feature.points} điểm</span>
                          <div className={styles.progressBar}>
                            <div className={styles.progress} style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
