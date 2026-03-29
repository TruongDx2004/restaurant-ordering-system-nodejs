import React, { useState } from 'react';
import { DishManagement } from './components/DishManagement';
import { CategoryManagement } from './components/CategoryManagement';
import styles from './index.module.css';

/**
 * Product Management Page
 * Manages dishes and categories
 */
const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState('dishes');

  return (
    <div className={styles.productManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Quản lý sản phẩm</h1>
          <p>Quản lý món ăn và danh mục</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'dishes' ? styles.active : ''}`}
          onClick={() => setActiveTab('dishes')}
        >
          <i className="fas fa-utensils"></i>
          Món ăn
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <i className="fas fa-list"></i>
          Danh mục
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'dishes' && <DishManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
      </div>
    </div>
  );
};

export default ProductManagement;
