import React, { useState, useEffect, useMemo } from 'react';
import { dishApi, categoryApi, invoiceApi } from '../../../../api';
import { useModal } from '../../../../contexts/ModalContext';
import styles from './QuickOrderModal.module.css';

/**
 * QuickOrderModal Component
 * Allows employees to quickly take orders for a specific table
 */
const QuickOrderModal = ({ table, onClose, onOrderSuccess }) => {
  const { showAlert } = useModal();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch menu data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dishesRes, categoriesRes] = await Promise.all([
          dishApi.getAvailable(),
          categoryApi.getAll()
        ]);
        
        if (dishesRes.success) setDishes(dishesRes.data);
        if (categoriesRes.success) setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || 
                             dish.category?.id === parseInt(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [dishes, searchTerm, selectedCategory]);

  // Cart operations
  const addToCart = (dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => 
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === dishId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    
    try {
      setSubmitting(true);
      const orderData = {
        tableId: table.id,
        items: cart.map(item => ({
          dishId: item.id,
          quantity: item.quantity,
          note: ''
        }))
      };
      
      const res = await invoiceApi.createWithItems(orderData);
      if (res.success || res.data) {
        onOrderSuccess();
        onClose();
      }
    } catch (err) {
      showAlert('Lỗi khi đặt món: ' + (err.message || 'Lỗi không xác định'), 'Lỗi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h3>Gọi món - Bàn {table.tableNumber}</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className={styles.searchBar}>
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm món ăn..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.categories}>
            <button 
              className={`${styles.catTab} ${selectedCategory === 'ALL' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`${styles.catTab} ${selectedCategory === cat.id.toString() ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat.id.toString())}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Đang tải thực đơn...</span>
            </div>
          ) : (
            <div className={styles.dishGrid}>
              {filteredDishes.map(dish => (
                <div key={dish.id} className={styles.dishCard} onClick={() => addToCart(dish)}>
                  <div className={styles.dishImage}>
                    <img 
                      src={dish.image || '/placeholder-dish.jpg'} 
                      alt={dish.name}
                      onError={e => e.target.src = '/placeholder-dish.jpg'}
                    />
                  </div>
                  <div className={styles.dishInfo}>
                    <span className={styles.dishName}>{dish.name}</span>
                    <span className={styles.dishPrice}>
                      {dish.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button className={styles.addBtn}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              ))}
              {filteredDishes.length === 0 && (
                <div className={styles.noResults}>Không tìm thấy món nào</div>
              )}
            </div>
          )}
        </div>

        {/* Footer/Cart */}
        <div className={`${styles.footer} ${cart.length > 0 ? styles.hasItems : ''}`}>
          {cart.length > 0 && (
            <div className={styles.cartSection}>
              <div className={styles.cartHeader}>
                <span>Đã chọn ({cart.length})</span>
                <button className={styles.clearBtn} onClick={() => setCart([])}>Xóa hết</button>
              </div>
              <div className={styles.cartItems}>
                {cart.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <span className={styles.itemName}>{item.name}</span>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <span className={styles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.actionRow}>
            <div className={styles.totalInfo}>
              <span>Tổng cộng:</span>
              <strong>{totalAmount.toLocaleString('vi-VN')}đ</strong>
            </div>
            <button 
              className={styles.confirmBtn} 
              disabled={cart.length === 0 || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>Xác nhận đặt món</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderModal;
