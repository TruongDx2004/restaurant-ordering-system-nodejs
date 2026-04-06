import React from 'react';
import { DishCard } from './DishCard';
import styles from './DishList.module.css';

/**
 * DishList Component
 * Container để hiển thị danh sách món ăn
 */
export const DishList = ({ dishes, loading, error, categoryName, emptyMessage }) => {
  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Đang tải món ăn...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Đã xảy ra lỗi</h3>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  // Empty state
  if (!dishes || dishes.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>🍽️</div>
        <h3 className={styles.emptyTitle}>Không tìm thấy món ăn</h3>
        <p className={styles.emptyMessage}>
          {emptyMessage || 'Hiện tại chưa có món ăn nào trong danh mục này'}
        </p>
      </div>
    );
  }

  return (
    <section className={styles.dishSection}>
      {categoryName && (
        <h3 className={styles.categoryTitle}>{categoryName}</h3>
      )}
      
      <div className={styles.dishGrid}>
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
      
      <div className={styles.dishCount}>
        {dishes.length} món ăn
      </div>
    </section>
  );
};

export default DishList;
