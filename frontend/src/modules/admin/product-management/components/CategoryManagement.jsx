import React, { useState, useEffect, useRef } from 'react';
import { categoryApi, excelApi } from '../../../../api';
import { CategoryModal } from './CategoryModal';
import styles from './CategoryManagement.module.css';

/**
 * Category Management Component
 * CRUD operations for categories
 */
export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const fileInputRef = useRef(null);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load categories
  useEffect(() => {
    loadCategories();
    setCurrentPage(1);
  }, [searchTerm]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryApi.getAll();
      
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  // Handle create
  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này? Tất cả món ăn trong danh mục sẽ bị ảnh hưởng.')) {
      return;
    }

    try {
      const response = await categoryApi.deleteCategory(id);
      if (response.success) {
        await loadCategories();
        alert('Xóa danh mục thành công!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  // Handle save
  const handleSave = async (categoryData) => {
    try {
      if (editingCategory) {
        const response = await categoryApi.updateCategory(editingCategory.id, categoryData);
        if (response.success) {
          await loadCategories();
          setShowModal(false);
          alert('Cập nhật danh mục thành công!');
        }
      } else {
        const response = await categoryApi.createCategory(categoryData);
        if (response.success) {
          await loadCategories();
          setShowModal(false);
          alert('Tạo danh mục thành công!');
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExcelLoading(true);
      const response = await excelApi.exportData('category'); // Đổi thành 'category'
      
      const blob = new Blob([response.data || response], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'categories.xlsx'); // Đổi tên file tải về
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi khi tải xuống file Excel!');
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
      await excelApi.importData('category', file);
      alert('Import dữ liệu danh mục thành công!');
      await loadCategories();
    } catch (err) {
      alert(err.response?.data || 'Lỗi khi import file Excel!');
      console.error(err);
    } finally {
      setIsExcelLoading(false);
      event.target.value = '';
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
        <button onClick={loadCategories}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className={styles.categoryManagement}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tổng danh mục:</span>
          <span className={styles.statValue}>{categories.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.categoryGrid}>
        {currentCategories.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fas fa-inbox"></i>
            <p>Không tìm thấy danh mục</p>
          </div>
        ) : (
          currentCategories.map(category => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.cardHeader}>
                <h3>{category.name}</h3>
                <div className={styles.cardActions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(category)}
                    title="Sửa"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(category.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p className={styles.cardDescription}>
                {category.description || 'Không có mô tả'}
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.dishCount}>
                  <i className="fas fa-utensils"></i>
                  {category.dishCount || 0} món ăn
                </span>
              </div>
            </div>
          ))
        )}
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
        <CategoryModal
          category={editingCategory}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
