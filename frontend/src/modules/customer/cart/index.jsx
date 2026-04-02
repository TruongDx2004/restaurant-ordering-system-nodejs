import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceApi } from '../../../api';
import { DesktopWarning } from '../../../components/shared';
import styles from './index.module.css';

/**
 * Cart Component
 * Trang giỏ hàng với chức năng quản lý món ăn
 */
export const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load cart from localStorage
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem('cart');
      const items = stored ? JSON.parse(stored) : [];
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Save cart to localStorage
  const saveCart = (items) => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      setCartItems(items);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Show toast notification
  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
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

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    if (newQuantity > 99) {
      showNotification('Số lượng tối đa là 99');
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );

    saveCart(updatedItems);
    showNotification('Đã cập nhật số lượng');
  };

  // Remove item
  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    saveCart(updatedItems);
    showNotification('Đã xóa món khỏi giỏ hàng');
  };

  // Clear cart
  const clearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả món trong giỏ hàng?')) {
      saveCart([]);
      showNotification('Đã xóa tất cả món');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Giỏ hàng trống');
      return;
    }
    setShowModal(true);
  };

  // Confirm order
  const confirmOrder = async () => {
    try {
      // Lấy tableNumber từ localStorage
      const tableNumber = localStorage.getItem('tableNumber') || '1';

      // Chuẩn bị order data theo format backend yêu cầu
      const orderData = {
        tableId: parseInt(tableNumber),
        items: cartItems.map(item => ({
          dishId: item.id,
          quantity: item.quantity,
          note: item.note || ''
        }))
      };

      // Call API to create invoice with items
      const response = await invoiceApi.createWithItems(orderData);

      // Check response
      if (response.success || response.data) {
        // Clear cart on success
        saveCart([]);
        setShowModal(false);
        showNotification('Đặt món thành công!');

        setTimeout(() => {
          navigate('/customer/orders');
        }, 500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setShowModal(false);
      showNotification('Đặt món thất bại. Vui lòng thử lại.');
    }
  };

  // Cancel order
  const cancelOrder = () => {
    setShowModal(false);
  };

  // Navigate to menu
  const goToMenu = () => {
    navigate('/customer/home');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.skeletonItem}></div>
          <div className={styles.skeletonItem}></div>
          <div className={styles.skeletonItem}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopWarning />
      <div className={styles.container}>
        {/* Page Title & Actions */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Giỏ Hàng</h1>
          {cartItems.length > 0 && (
            <button onClick={clearCart} className={styles.clearBtn}>
              <i className="fas fa-trash"></i> Xóa tất cả
            </button>
          )}
        </div>

        {/* Empty State */}
        {cartItems.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <i className="fas fa-shopping-cart"></i>
            </div>
            <h3>Giỏ hàng của bạn đang trống</h3>
            <p>Hãy thêm món ăn từ trang menu</p>
            <button onClick={goToMenu} className={styles.browseMenuBtn}>
              Xem Menu
            </button>
          </div>
        )}

        {/* Cart Items */}
        {cartItems.length > 0 && (
          <>
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className={styles.itemImage}
                  />

                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
                    {item.note && (
                      <p className={styles.itemNotes}>
                        <i className="fas fa-sticky-note"></i> {item.note}
                      </p>
                    )}
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.quantityControl}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={styles.qtyBtn}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className={styles.removeBtn}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Tạm tính:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Tổng cộng:</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>

              <button
                onClick={handleCheckout}
                className={styles.checkoutBtn}
              >
                <i className="fas fa-utensils"></i> Gọi Món
              </button>
            </div>
          </>
        )}

        {/* Floating Add Button
      <button onClick={goToMenu} className={styles.addMoreBtn}>
        <i className="fas fa-plus"></i>
      </button> */}

        {/* Confirmation Modal */}
        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>Xác nhận đặt món</h2>
                <button onClick={cancelOrder} className={styles.closeModal}>
                  &times;
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.orderSummary}>
                  <p className={styles.itemsCount}>
                    <i className="fas fa-utensils"></i> {cartItems.length} món
                  </p>
                  <p className={styles.totalPrice}>
                    Tổng tiền: <strong>{formatPrice(calculateTotal())}</strong>
                  </p>
                </div>
                <p className={styles.confirmMessage}>
                  Bạn có chắc muốn đặt món không?
                </p>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={confirmOrder} className={styles.confirmBtn}>
                  Xác nhận
                </button>
                <button onClick={cancelOrder} className={styles.cancelBtn}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className={styles.toast}>
            <i className="fas fa-check-circle"></i>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
