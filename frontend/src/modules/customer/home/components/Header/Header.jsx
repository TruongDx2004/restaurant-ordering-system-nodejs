import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTableNumber } from '../../../../../utils/storage';
import styles from './Header.module.css';

/**
 * Header Component
 * Header cho Customer Home với search, table number, cart icon
 */
export const Header = ({ onSearch, onMenuToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearButton, setShowClearButton] = useState(false);
  const [tableNumber, setTableNumber] = useState('1');
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy table number từ localStorage
    const savedTableNumber = getTableNumber();
    setTableNumber(savedTableNumber);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowClearButton(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch && onSearch(searchTerm.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowClearButton(false);
    onSearch && onSearch('');
  };

  const handleCartClick = () => {
    navigate('/customer/cart');
  };

  const handleMenuToggle = () => {
    onMenuToggle && onMenuToggle();
  };

  return (
    <header className={styles.header}>
      {/* Menu Toggle Button */}
      <div className={styles.menuToggle} onClick={handleMenuToggle}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Table Number */}
      <div className={styles.tableInfo}>
        <h2 className={styles.tableNumber}>Bàn {tableNumber}</h2>
      </div>

      {/* Search Container */}
      <div className={styles.searchContainer}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Tìm món ăn..."
            className={styles.searchBar}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          
          <button 
            type="submit" 
            className={styles.searchBtn}
            aria-label="Tìm kiếm"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

          {showClearButton && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClearSearch}
              aria-label="Xóa tìm kiếm"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* Cart Icon */}
      <div className={styles.headerActions}>
        <button 
          className={styles.cartBtn}
          onClick={handleCartClick}
          aria-label="Giỏ hàng"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
