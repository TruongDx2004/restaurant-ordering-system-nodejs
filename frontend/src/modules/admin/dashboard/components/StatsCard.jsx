import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatsCard.module.css';

/**
 * StatsCard Component - Desktop Optimized
 * Displays a single statistic with icon, value, and optional trend
 */
const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  subtitle,
  color = 'primary',
  variant = 'primary',
  loading = false
}) => {
  // Format trend display
  const formatTrend = (trendValue) => {
    if (trendValue === null || trendValue === undefined) return null;
    const num = Number(trendValue);
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const trendValue = trend !== null && trend !== undefined ? Number(trend) : null;
  const isPositive = trendValue !== null && trendValue >= 0;

  return (
    <div className={`${styles.statsCard} ${styles[color]} ${styles[variant]} ${loading ? styles.loading : ''}`}>
      {loading && <div className={styles.loadingOverlay}></div>}
      
      {/* Icon */}
      <div className={styles.iconContainer}>
        <i className={icon}></i>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>

        {/* Trend or Subtitle */}
        {trend !== null && trend !== undefined && (
          <div className={`${styles.trend} ${isPositive ? styles.trendUp : styles.trendDown}`}>
            <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
            <span>{formatTrend(trend)}</span>
            {trendLabel && <span className={styles.trendLabel}>{trendLabel}</span>}
          </div>
        )}

        {subtitle && !trend && (
          <p className={styles.subtitle}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  trend: PropTypes.number,
  trendLabel: PropTypes.string,
  subtitle: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'success', 'info', 'warning', 'danger']),
  variant: PropTypes.oneOf(['primary', 'secondary']),
  loading: PropTypes.bool
};

export default StatsCard;
