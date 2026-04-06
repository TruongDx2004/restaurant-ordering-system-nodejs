import React from 'react';
import { useDashboardStats } from './hooks';
import { StatsCard } from './components';
import styles from './index.module.css';

/**
 * Admin Dashboard - Desktop Optimized
 * Shows real-time statistics calculated from existing APIs
 */
const Dashboard = () => {
  const { stats, loading, error, refetch } = useDashboardStats(30000); // Auto-refresh every 30s

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Format number
  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  // Format percentage
  const formatPercent = (num) => {
    const value = Number(num || 0);
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading && !stats) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button onClick={refetch} className={styles.retryButton}>
            <i className="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Dashboard</h1>
          <p>Tổng quan hoạt động nhà hàng</p>
        </div>
        <div className={styles.headerRight}>
          <button onClick={refetch} className={styles.refreshButton} disabled={loading}>
            <i className={`fas fa-sync-alt ${loading ? styles.spinning : ''}`}></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* Today's Stats - Primary Cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <i className="fas fa-calendar-day"></i>
          Thống kê hôm nay
        </h2>
        <div className={styles.statsGrid}>
          <StatsCard
            title="Doanh thu hôm nay"
            value={formatCurrency(stats.todayRevenue)}
            icon="fas fa-money-bill-wave"
            trend={stats.revenueGrowth}
            trendLabel="so với hôm qua"
            color="primary"
            loading={loading}
          />
          <StatsCard
            title="Đơn hàng hôm nay"
            value={formatNumber(stats.todayOrders)}
            icon="fas fa-receipt"
            trend={stats.ordersGrowth}
            trendLabel="so với hôm qua"
            color="success"
            loading={loading}
          />
          <StatsCard
            title="Bàn đang phục vụ"
            value={formatNumber(stats.activeTables)}
            icon="fas fa-chair"
            subtitle={`${stats.tableOccupancyRate?.toFixed(1)}% công suất`}
            color="info"
            loading={loading}
          />
          <StatsCard
            title="Đơn chờ xử lý"
            value={formatNumber(stats.pendingOrders)}
            icon="fas fa-clock"
            subtitle="Cần xử lý"
            color="warning"
            loading={loading}
          />
        </div>
      </div>

      {/* Overall Stats - Secondary Cards */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <i className="fas fa-chart-line"></i>
          Tổng quan hệ thống
        </h2>
        <div className={styles.statsGrid}>
          <StatsCard
            title="Tổng doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            icon="fas fa-hand-holding-usd"
            subtitle={`${formatNumber(stats.totalOrders)} đơn hàng`}
            color="primary"
            variant="secondary"
            loading={loading}
          />
          <StatsCard
            title="Tổng khách hàng"
            value={formatNumber(stats.totalCustomers)}
            icon="fas fa-users"
            subtitle="Đã đăng ký"
            color="success"
            variant="secondary"
            loading={loading}
          />
          <StatsCard
            title="Tổng món ăn"
            value={formatNumber(stats.totalDishes)}
            icon="fas fa-utensils"
            subtitle="Trong menu"
            color="info"
            variant="secondary"
            loading={loading}
          />
          <StatsCard
            title="Tổng số bàn"
            value={formatNumber(stats.totalTables)}
            icon="fas fa-table"
            subtitle={`${formatNumber(stats.activeTables)} đang dùng`}
            color="warning"
            variant="secondary"
            loading={loading}
          />
        </div>
      </div>

      {/* Additional Insights */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <i className="fas fa-lightbulb"></i>
          Thông tin thêm
        </h2>
        <div className={styles.insightsGrid}>
          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <i className="fas fa-calculator"></i>
            </div>
            <div className={styles.insightContent}>
              <h3>Giá trị đơn hàng trung bình</h3>
              <p className={styles.insightValue}>
                {formatCurrency(stats.averageOrderValue)}
              </p>
              <span className={styles.insightLabel}>
                Tính trên {formatNumber(stats.totalOrders)} đơn hàng
              </span>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <i className="fas fa-percentage"></i>
            </div>
            <div className={styles.insightContent}>
              <h3>Tỷ lệ sử dụng bàn</h3>
              <p className={styles.insightValue}>
                {stats.tableOccupancyRate?.toFixed(1)}%
              </p>
              <span className={styles.insightLabel}>
                {formatNumber(stats.activeTables)} / {formatNumber(stats.totalTables)} bàn
              </span>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <i className="fas fa-trending-up"></i>
            </div>
            <div className={styles.insightContent}>
              <h3>Tăng trưởng doanh thu</h3>
              <p className={`${styles.insightValue} ${stats.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
                {formatPercent(stats.revenueGrowth)}
              </p>
              <span className={styles.insightLabel}>
                So với hôm qua
              </span>
            </div>
          </div>

          <div className={styles.insightCard}>
            <div className={styles.insightIcon}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className={styles.insightContent}>
              <h3>Tăng trưởng đơn hàng</h3>
              <p className={`${styles.insightValue} ${stats.ordersGrowth >= 0 ? styles.positive : styles.negative}`}>
                {formatPercent(stats.ordersGrowth)}
              </p>
              <span className={styles.insightLabel}>
                So với hôm qua
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <i className="fas fa-info-circle"></i>
          <span>Dashboard tự động cập nhật mỗi 30 giây</span>
        </div>
        <div className={styles.footerTime}>
          <i className="fas fa-clock"></i>
          <span>Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
