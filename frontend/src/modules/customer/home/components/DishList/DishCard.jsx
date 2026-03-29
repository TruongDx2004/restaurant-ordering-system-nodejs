import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, getDishStatusText, getImageUrl, isDishAvailable } from '../../utils/helpers';
import styles from './DishCard.module.css';

/**
 * DishCard Component
 * Hiển thị thông tin món ăn trong card
 */
export const DishCard = ({ dish }) => {
  const navigate = useNavigate();

  if (!dish) return null;

  const handleClick = () => {
    // Navigate đến trang chi tiết món ăn
    navigate(`/customer/dish/${dish.id}`);
  };

  const isAvailable = isDishAvailable(dish);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Find if dish already in cart
    const existingItemIndex = existingCart.findIndex(item => item.id === dish.id);
    
    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      existingCart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: 1,
        notes: '',
        category: dish.category
      });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Dispatch custom event to notify other components (like Header/Cart badge)
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
  };

  return (
    <div 
      className={`${styles.dishCard} ${!isAvailable ? styles.soldOut : ''}`}
      onClick={handleClick}
    >
      <div className={styles.imageWrapper}>
        <img 
          src={getImageUrl(dish.image)} 
          alt={dish.name}
          className={styles.image}
          loading="lazy"
        />
        
        {!isAvailable && (
          <div className={styles.soldOutOverlay}>
            <span className={styles.soldOutText}>Hết hàng</span>
          </div>
        )}

        {isAvailable && (
          <button 
            className={styles.addToCartBtn} 
            onClick={handleAddToCart}
            title="Thêm vào giỏ"
          >
            <i className="fas fa-cart-plus"></i>
          </button>
        )}
      </div>
      
      <div className={styles.info}>
        <h3 className={styles.name}>{dish.name}</h3>
        
        <div className={styles.priceRow}>
          <p className={styles.price}>{formatPrice(dish.price)}</p>
          <span className={`${styles.status} ${styles[dish.status?.toLowerCase()]}`}>
            {getDishStatusText(dish.status)}
          </span>
        </div>
        
        {dish.category && (
          <p className={styles.category}>{dish.category.name}</p>
        )}
      </div>
    </div>
  );
};

export default DishCard;
