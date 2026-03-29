import React, { useState, useEffect } from 'react';
import styles from './DishModal.module.css';

/**
 * Dish Modal Component
 * Create/Edit dish form
 */
export const DishModal = ({ dish, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    status: 'AVAILABLE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load dish data if editing
  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || '',
        description: dish.description || '',
        price: dish.price || '',
        categoryId: dish.category?.id || '',
        imageUrl: dish.imageUrl || '',
        status: dish.status || 'AVAILABLE'
      });
    }
  }, [dish]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên món ăn');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId)
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{dish ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorAlert}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name">
              Tên món ăn <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên món ăn"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả món ăn"
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price">
                Giá (VNĐ) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="categoryId">
                Danh mục <span className={styles.required}>*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="imageUrl">URL hình ảnh</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="AVAILABLE">Có sẵn</option>
                <option value="SOLD_OUT">Hết hàng</option>
              </select>
            </div>
          </div>

          {formData.imageUrl && (
            <div className={styles.imagePreview}>
              <img src={formData.imageUrl} alt="Preview" onError={(e) => {
                e.target.style.display = 'none';
              }} />
            </div>
          )}

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {dish ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
