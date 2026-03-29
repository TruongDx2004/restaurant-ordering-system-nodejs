import React, { useEffect, useRef } from 'react';
import styles from './CategoryNav.module.css';

/**
 * CategoryNav Component
 * Navigation bar hiển thị các categories
 */
export const CategoryNav = ({ 
  categories, 
  activeCategory, 
  onSelectCategory, 
  isOpen = true,
  loading = false 
}) => {
  const navRef = useRef(null);

  useEffect(() => {
    // Auto scroll to active category when it changes
    if (activeCategory && navRef.current) {
      const activeElement = navRef.current.querySelector(`.${styles.active}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCategory]);

  if (loading) {
    return (
      <nav className={styles.categoryNav}>
        <ul className={styles.categoryList} ref={navRef}>
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className={styles.skeleton}>
              <div className={styles.skeletonItem}></div>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className={`${styles.categoryNav} ${!isOpen ? styles.closed : ''}`}>
      <ul className={styles.categoryList} ref={navRef}>
        {/* "Tất cả" option */}
        <li
          className={`${styles.categoryItem} ${!activeCategory ? styles.active : ''}`}
          onClick={() => onSelectCategory && onSelectCategory(null)}
        >
          <span className={styles.categoryName}>Tất cả</span>
        </li>

        {/* Categories from backend */}
        {categories && categories.length > 0 && categories.map((category) => (
          <li
            key={category.id}
            className={`${styles.categoryItem} ${activeCategory === category.id ? styles.active : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(category.id)}
          >
            <span className={styles.categoryName}>{category.name}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;
