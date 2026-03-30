import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dishApi } from '../../../api';
import styles from './index.module.css';

/**
 * DishDetail Component
 * Trang chi tiết món ăn với khả năng thêm vào giỏ hàng
 */
export const DishDetail = () => {
  const { dishId } = useParams();
  const navigate = useNavigate();
  
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Fetch dish details
  useEffect(() => {
    const fetchDishDetail = async () => {
      setLoading(true);
      try {
        const response = await dishApi.getById(dishId);
        let dishData = null;
        
        if (response.data && response.data.data) {
          dishData = response.data.data;
        } else if (response.data) {
          dishData = response.data;
        } else if (response) {
          dishData = response;
        }
        
        setDish(dishData);
      } catch (error) {
        console.error('Error fetching dish:', error);
        showAlert('Không thể tải thông tin món ăn');
      } finally {
        setLoading(false);
      }
    };

    if (dishId) {
      fetchDishDetail();
    }
  }, [dishId]);

  // Show notification
  const showAlert = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Handle quantity change
  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!dish || dish.status !== 'AVAILABLE') {
      showAlert('Món ăn hiện không có sẵn');
      return;
    }

    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Find if dish already in cart
    const existingItemIndex = existingCart.findIndex(item => item.id === dish.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity and notes
      existingCart[existingItemIndex].quantity += quantity;
      if (notes.trim()) {
        existingCart[existingItemIndex].notes = notes.trim();
      }
    } else {
      // Add new item
      existingCart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: quantity,
        notes: notes.trim(),
        category: dish.category
      });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    showAlert(`Đã thêm ${quantity} ${dish.name} vào giỏ hàng`);
    
    // Reset form
    setQuantity(1);
    setNotes('');
  };

  // Handle back
  const handleBack = () => {
    navigate(-1);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-dish.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${path}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-circle"></i>
          <p>Không tìm thấy món ăn</p>
          <button onClick={handleBack} className={styles.backBtn}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = dish.status === 'AVAILABLE';

  return (
    <div className={styles.container}>
      {/* Header with Back Button */}
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className={styles.headerTitle}>Chi tiết món ăn</h2>
        <div className={styles.placeholder}></div>
      </header>

      {/* Dish Image */}
      <div className={styles.imageContainer}>
        <img 
          src={getImageUrl(dish.image)} 
          alt={dish.name}
          className={styles.dishImage}
        />
        {!isAvailable && (
          <div className={styles.unavailableOverlay}>
            <span>Hết hàng</span>
          </div>
        )}
      </div>

      {/* Dish Info */}
      <div className={styles.content}>
        <div className={styles.dishInfo}>
          <h1 className={styles.dishName}>{dish.name}</h1>
          
          <div className={styles.priceSection}>
            <span className={styles.price}>{formatPrice(dish.price)}</span>
            <span className={`${styles.status} ${isAvailable ? styles.available : styles.unavailable}`}>
              {isAvailable ? 'Có sẵn' : 'Hết hàng'}
            </span>
          </div>

          {dish.category && (
            <div className={styles.category}>
              <i className="fas fa-utensils"></i>
              <span>{dish.category.name}</span>
            </div>
          )}

          {dish.description && (
            <div className={styles.description}>
              <h3>Mô tả</h3>
              <p>{dish.description}</p>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className={styles.notesSection}>
          <h3>Ghi chú</h3>
          <textarea
            className={styles.notesInput}
            placeholder="Thêm ghi chú (Ví dụ: Thêm đá, ít ngọt...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={200}
          />
          <span className={styles.charCount}>{notes.length}/200</span>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className={styles.bottomActions}>
        <div className={styles.quantityControl}>
          <button 
            onClick={handleDecrease} 
            className={styles.qtyBtn}
            disabled={quantity <= 1}
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className={styles.quantity}>{quantity}</span>
          <button 
            onClick={handleIncrease} 
            className={styles.qtyBtn}
            disabled={quantity >= 99}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        <button 
          onClick={handleAddToCart} 
          className={styles.addToCartBtn}
          disabled={!isAvailable}
        >
          <i className="fas fa-shopping-cart"></i>
          <span>Thêm vào giỏ hàng</span>
        </button>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className={styles.notification}>
          <i className="fas fa-check-circle"></i>
          <span>{notificationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DishDetail;
