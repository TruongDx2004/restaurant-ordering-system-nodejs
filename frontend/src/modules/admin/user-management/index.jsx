import React, { useState, useEffect, useRef } from 'react';
import { userApi, excelApi } from '../../../api';
import { UserModal } from './components/UserModal';
import { useModal } from '../../../contexts/ModalContext';
import styles from './index.module.css';

/**
 * User Management Page
 * Manages employees and admin users
 */
const UserManagement = () => {
  const { showAlert, showConfirm } = useModal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const fileInputRef = useRef(null);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load users
  useEffect(() => {
    loadUsers();
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getAllUsers();

      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle create
  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  // Handle edit
  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    showConfirm(`Xác nhận xóa người dùng này?`, async () => {
      try {
        const response = await userApi.deleteUser(id);
        if (response.success) {
          await loadUsers();
          showAlert('Xóa người dùng thành công!', 'Thành công', 'success');
        }
      } catch (err) {
        showAlert(err.response?.data?.message || 'Không thể xóa người dùng', 'Lỗi', 'error');
      };
    }, null, 'Xác nhận');
  };

  // Handle save
  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        const response = await userApi.updateUser(editingUser.id, userData);
        if (response.success) {
          await loadUsers();
          setShowModal(false);
          showAlert('Cập nhật người dùng thành công!', 'Thành công', 'success');
        }
      } else {
        const response = await userApi.createUser(userData);
        if (response.success) {
          await loadUsers();
          setShowModal(false);
          showAlert('Tạo người dùng thành công!', 'Thành công', 'success');
        }
      }
    } catch (err) {
      throw err;
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExcelLoading(true);
      const response = await excelApi.exportData('user');

      const blob = new Blob([response.data || response], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
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
      await excelApi.importData('user', file);
      showAlert('Import dữ liệu người dùng thành công!', 'Thành công', 'success');
      await loadUsers();
    } catch (err) {
      showAlert(err.response?.data || 'Lỗi khi import file Excel!', 'Lỗi', 'error');
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
        <button onClick={loadUsers}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className={styles.userManagement}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý nhân viên và quản trị viên</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="EMPLOYEE">Nhân viên</option>
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
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tổng người dùng:</span>
          <span className={styles.statValue}>{users.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Quản trị viên:</span>
          <span className={styles.statValue}>
            {users.filter(u => u.role === 'ADMIN').length}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Nhân viên:</span>
          <span className={styles.statValue}>
            {users.filter(u => u.role === 'EMPLOYEE').length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.emptyState}>
                  <i className="fas fa-inbox"></i>
                  <p>Không tìm thấy người dùng</p>
                </td>
              </tr>
            ) : (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userName}>{user.name}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase()]}`}>
                      {user.role === 'ADMIN' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </td>
                  <td>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(user)}
                        title="Sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(user.id)}
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
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagement;
