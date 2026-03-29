import React, { useState, useEffect } from 'react';
import styles from './TableModal.module.css';

/**
 * Table Modal Component
 * Create/Edit table form
 */
export const TableModal = ({ table, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    area: '',
    status: 'AVAILABLE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load table data if editing
  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.tableNumber || '',
        capacity: table.capacity || '',
        area: table.area || '',
        status: table.status || 'AVAILABLE'
      });
    }
  }, [table]);

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
    if (!formData.tableNumber || formData.tableNumber <= 0) {
      setError('Vui lòng nhập số bàn hợp lệ');
      return;
    }
    if (!formData.capacity || formData.capacity <= 0) {
      setError('Vui lòng nhập sức chứa hợp lệ');
      return;
    }
    if (!formData.area.trim()) {
      setError('Vui lòng nhập khu vực');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        ...formData,
        tableNumber: parseInt(formData.tableNumber),
        capacity: parseInt(formData.capacity)
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
          <h2>{table ? 'Sửa bàn' : 'Thêm bàn mới'}</h2>
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

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="tableNumber">
                Số bàn <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="tableNumber"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                placeholder="1"
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="capacity">
                Sức chứa <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="4"
                min="1"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="area">
                Khu vực <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="VD: Tầng 1, Sân thượng..."
                required
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
                <option value="AVAILABLE">Trống</option>
                <option value="OCCUPIED">Đang dùng</option>
                <option value="RESERVED">Đã đặt</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>
          </div>

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
                  {table ? 'Cập nhật' : 'Tạo mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
