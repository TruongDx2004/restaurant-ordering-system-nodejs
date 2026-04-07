import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { tableApi } from '../../../api';
import QuickOrderModal from './components/QuickOrderModal';
import styles from './index.module.css';
import webSocketService from '../../../services/webSocketService';
import { useModal } from '../../../contexts/ModalContext';

/**
 * Table Management Page for Employees
 * Quản lý trạng thái bàn - Optimized for Mobile with Quick Order
 */
const TableManagement = () => {
  const { showAlert } = useModal();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTable, setSearchTable] = useState('');

  // Quick order state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Table statuses
  const TABLE_STATUSES = {
    AVAILABLE: { label: 'Trống', color: '#27ae60', icon: 'fa-check-circle' },
    OCCUPIED: { label: 'Khách', color: '#e74c3c', icon: 'fa-users' },
    RESERVED: { label: 'Đặt', color: '#f39c12', icon: 'fa-bookmark' },
  };

  /**
   * Fetch all tables
   */
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tableApi.getAllTables();
      if (response.success && response.data) {
        setTables(response.data);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu bàn');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    const unsubscribeItems = webSocketService.subscribe('/topic/table-status', (message) => {
      console.log('[Table Management] Received table status update:', message);
      setTables(prevTables =>
        prevTables.map(table =>
          table.id === message.tableId ? { ...table, status: message.status } : table
        )
      );
    });
    
    return () => {
      unsubscribeItems();
    };
  }, []);

    /**
     * Update table status
     */
    const handleUpdateStatus = async (tableId, newStatus) => {
      try {
        const response = await tableApi.updateTableStatus(tableId, newStatus);
        if (response.success) {
          setTables(prevTables =>
            prevTables.map(table =>
              table.id === tableId ? { ...table, status: newStatus } : table
            )
          );
        }
      } catch (err) {
        showAlert('Lỗi: ' + (err.message || 'Không thể cập nhật'), 'Lỗi', 'error');
      }
    };

    /**
     * Open order modal
     */
    const handleOpenOrder = (table) => {
      setSelectedTable(table);
      setShowOrderModal(true);
    };

    /**
     * Filter tables
     */
    const filteredTables = useMemo(() => {
      return tables.filter(table => {
        const matchesSearch = searchTable === '' ||
          table.tableNumber.toString().includes(searchTable) ||
          (table.area && table.area.toLowerCase().includes(searchTable.toLowerCase()));
        const matchesStatus = filterStatus === 'ALL' || table.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    }, [tables, searchTable, filterStatus]);

    /**
     * Calculate statistics for small badges
     */
    const stats = useMemo(() => ({
      total: tables.length,
      AVAILABLE: tables.filter(t => t.status === 'AVAILABLE').length,
      OCCUPIED: tables.filter(t => t.status === 'OCCUPIED').length,
      RESERVED: tables.filter(t => t.status === 'RESERVED').length,
      MAINTENANCE: tables.filter(t => t.status === 'MAINTENANCE').length
    }), [tables]);

    if (loading && tables.length === 0) {
      return (
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dữ liệu bàn...</p>
        </div>
      );
    }

    return (
      <div className={styles.tableManagement}>
        {/* Search & Stats Bar */}
        <div className={styles.topBar}>
          <div className={styles.searchBox}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Số bàn/Khu vực..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
            />
          </div>
          <button className={styles.refreshBtn} onClick={fetchTables}>
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>

        {/* Quick Filter & Stats */}
        <div className={styles.quickFilters}>
          <button
            className={`${styles.filterBtn} ${filterStatus === 'ALL' ? styles.active : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            Tất cả ({stats.total})
          </button>
          {Object.entries(TABLE_STATUSES).map(([key, config]) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${filterStatus === key ? styles.active : ''}`}
              onClick={() => setFilterStatus(key)}
              style={{ '--accent-color': config.color }}
            >
              {config.label} ({stats[key]})
            </button>
          ))}
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        {/* Tables Grid */}
        <div className={styles.tablesGrid}>
          {filteredTables.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fas fa-table"></i>
              <p>Không tìm thấy bàn nào</p>
            </div>
          ) : (
            filteredTables.map(table => {
              const statusConfig = TABLE_STATUSES[table.status] || TABLE_STATUSES.AVAILABLE;
              return (
                <div key={table.id} className={styles.tableCard}>
                  <div className={styles.tableCardHeader}>
                    <div className={styles.tableNumber}>
                      <span>Bàn</span>
                      <strong>{table.tableNumber}</strong>
                    </div>
                    <div
                      className={styles.statusBadge}
                      style={{ background: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </div>
                  </div>

                  <div className={styles.tableDetails}>
                    <div className={styles.detailItem}>
                      <i className="fas fa-users"></i> {table.capacity || 4}
                    </div>
                    <div className={styles.detailItem}>
                      <i className="fas fa-map-marker-alt"></i> {table.area || 'N/A'}
                    </div>
                  </div>

                  <div className={styles.tableActions}>
                    <button
                      className={styles.orderBtn}
                      onClick={() => handleOpenOrder(table)}
                      disabled={table.status === 'MAINTENANCE'}
                    >
                      <i className="fas fa-utensils"></i> Gọi món
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Order Modal */}
        {showOrderModal && selectedTable && (
          <QuickOrderModal
            table={selectedTable}
            onClose={() => setShowOrderModal(false)}
            onOrderSuccess={() => {
              fetchTables();
              showAlert('Đặt món thành công cho bàn ' + selectedTable.tableNumber, 'Thành công', 'success');
            }}
          />
        )}
      </div>
    );
  };

  export default TableManagement;
