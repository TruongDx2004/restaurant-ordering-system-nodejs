import React, { useState, useEffect, useRef } from 'react';
import { dishApi, categoryApi, excelApi } from '../../../../api';
import { DishModal } from './DishModal';
import { useModal } from '../../../../contexts/ModalContext';
import styles from './DishManagement.module.css';

/**
 * Dish Management Component
 * CRUD operations for dishes
 */
export const DishManagement = () => {
  const { showAlert, showConfirm } = useModal();
  const [dishes, setDishes] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const fileInputRef = useRef(null);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load dishes and categories
  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dishesRes, categoriesRes] = await Promise.all([
        dishApi.getAll(),
        categoryApi.getAll()
      ]);

      if (dishesRes.success) {
        setDishes(dishesRes.data);
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Filter dishes
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || dish.category?.id === parseInt(filterCategory);
    const matchesStatus = filterStatus === 'all' || dish.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);

  const SERVER_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-dish.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${SERVER_URL}${imagePath}`;
  };

  // Handle create
  const handleCreate = () => {
    setEditingDish(null);
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (dish) => {
    setEditingDish(dish);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    showConfirm('Bạn có chắc muốn xóa món ăn này?',  async () => {
      try {
        const response = await dishApi.deleteDish(id);
        if (response.success) {
          await loadData();
          showAlert('Xóa món ăn thành công!', 'Thành công', 'success');
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Không thể xóa món ăn', 'Lỗi', 'error');
      };
    }, null, 'Xác nhận');
  };

  // Handle save
  const handleSave = async (dishData) => {
    try {
      if (editingDish) {
        const response = await dishApi.updateDish(editingDish.id, dishData);
        if (response.success) {
          await loadData();
          setShowModal(false);
          showAlert('Cập nhật món ăn thành công!', 'Thành công', 'success');
        }
      } else {
        const response = await dishApi.createDish(dishData);
        if (response.success) {
          await loadData();
          setShowModal(false);
          showAlert('Tạo món ăn thành công!', 'Thành công', 'success');
        }
      }
    } catch (err) {
      throw err;
    }
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await dishApi.updateDishStatus(id, newStatus);
      if (response.success) {
        await loadData();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Không thể cập nhật trạng thái', 'Lỗi', 'error');
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExcelLoading(true);
      const response = await excelApi.exportData('dish'); // 'dish' là tên entity

      const blob = new Blob([response.data || response], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dishes.xlsx'); // Tên file tải về
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showAlert('Lỗi khi tải xuống file Excel!', 'Lỗi', 'error');
      console.error(err);
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsExcelLoading(true);
      await excelApi.importData('dish', file); // 'dish' là tên entity
      showAlert('Import dữ liệu món ăn thành công!', 'Thành công', 'success');
      await loadData(); // Tải lại bảng dữ liệu sau khi import
    } catch (err) {
      showAlert(err.response?.data || 'Lỗi khi import file Excel!', 'Lỗi', 'error');
      console.error(err);
    } finally {
      setIsExcelLoading(false);
      event.target.value = ''; // Reset input để chọn lại file cũ nếu cần
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <i className="fas fa-exclamation-triangle"></i>
        <p>{error}</p>
        <button onClick={loadData}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className={styles.dishManagement}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="SOLD_OUT">Hết hàng</option>
          </select>
        </div>

        <div className={styles.actionGroup}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
          />

          <button
            className={styles.exportBtn}
            onClick={handleExportExcel}
            disabled={isExcelLoading}
          >
            <i className={`fas ${isExcelLoading ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i>
            Export
          </button>

          <button
            className={styles.importBtn}
            onClick={handleImportClick}
            disabled={isExcelLoading}
          >
            <i className={`fas ${isExcelLoading ? 'fa-spinner fa-spin' : 'fa-file-import'}`}></i>
            Import
          </button>

          <button className={styles.createBtn} onClick={handleCreate}>
            <i className="fas fa-plus"></i>
            Thêm món ăn
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tổng món ăn:</span>
          <span className={styles.statValue}>{dishes.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Có sẵn:</span>
          <span className={styles.statValue}>
            {dishes.filter(d => d.status === 'AVAILABLE').length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Hết hàng:</span>
          <span className={styles.statValue}>
            {dishes.filter(d => d.status === 'SOLD_OUT').length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentDishes.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  <i className="fas fa-inbox"></i>
                  <p>Không tìm thấy món ăn</p>
                </td>
              </tr>
            ) : (
              currentDishes.map(dish => (
                <tr key={dish.id}>
                  <td>
                    <img
                      src={getImageUrl(dish.image)}
                      alt={dish.name}
                      className={styles.dishImage}
                    />
                  </td>
                  <td>
                    <div className={styles.dishName}>{dish.name}</div>
                    <div className={styles.dishDesc}>{dish.description}</div>
                  </td>
                  <td>{dish.category?.name || 'N/A'}</td>
                  <td className={styles.price}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(dish.price)}
                  </td>
                  <td>
                    <select
                      className={`${styles.statusSelect} ${styles[dish.status?.toLowerCase()]}`}
                      value={dish.status}
                      onChange={(e) => handleStatusChange(dish.id, e.target.value)}
                    >
                      <option value="AVAILABLE">Có sẵn</option>
                      <option value="SOLD_OUT">Hết hàng</option>
                    </select>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(dish)}
                        title="Sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(dish.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={styles.pageBtn}>
            <i className="fas fa-chevron-left"></i> Trước
          </button>
          <div className={styles.pageNumbers}>
            {[...Array(totalPages)].map((_, idx) => (
              <button key={idx + 1} onClick={() => setCurrentPage(idx + 1)} className={`${styles.pageNumberBtn} ${currentPage === idx + 1 ? styles.activePage : ''}`}>
                {idx + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={styles.pageBtn}>
            Sau <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DishModal
          dish={editingDish}
          categories={categories}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
