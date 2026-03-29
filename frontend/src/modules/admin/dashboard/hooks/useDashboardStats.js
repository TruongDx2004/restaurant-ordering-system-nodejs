import { useState, useEffect, useCallback } from 'react';
import { invoiceApi, tableApi, userApi, dishApi } from '../../../../api';

/**
 * Custom hook to fetch and calculate dashboard statistics
 * Uses existing APIs instead of dedicated dashboard endpoint
 * @param {number} refreshInterval - Auto refresh interval in ms (0 = no auto refresh)
 * @returns {Object} { stats, loading, error, refetch }
 */
export const useDashboardStats = (refreshInterval = 30000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Calculate statistics from raw data
   */
  const calculateStats = useCallback((invoices, tables, users, dishes) => {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Filter today's invoices
    const todayInvoices = invoices.filter(inv => {
      const createdAt = new Date(inv.createdAt);
      return createdAt >= today && createdAt <= todayEnd;
    });

    // Filter yesterday's invoices
    const yesterdayInvoices = invoices.filter(inv => {
      const createdAt = new Date(inv.createdAt);
      return createdAt >= yesterday && createdAt <= yesterdayEnd;
    });

    // Calculate today's revenue (only PAID invoices)
    const todayRevenue = todayInvoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    // Calculate yesterday's revenue
    const yesterdayRevenue = yesterdayInvoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    // Calculate total revenue (all PAID invoices)
    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    // Count orders
    const todayOrders = todayInvoices.length;
    const yesterdayOrders = yesterdayInvoices.length;

    // Active tables (OCCUPIED status)
    const activeTables = tables.filter(t => t.status === 'OCCUPIED').length;

    // Pending orders (OPEN invoices)
    const pendingOrders = invoices.filter(inv => inv.status === 'OPEN').length;

    // Calculate growth percentages
    const revenueGrowth = yesterdayRevenue === 0
      ? (todayRevenue > 0 ? 100 : 0)
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    const ordersGrowth = yesterdayOrders === 0
      ? (todayOrders > 0 ? 100 : 0)
      : ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100;

    return {
      // Today's stats
      todayRevenue: todayRevenue,
      todayOrders: todayOrders,
      activeTables: activeTables,
      pendingOrders: pendingOrders,

      // Overall stats
      totalRevenue: totalRevenue,
      totalOrders: invoices.length,
      totalCustomers: users.filter(u => u.role === 'CUSTOMER').length,
      totalDishes: dishes.length,
      totalTables: tables.length,

      // Growth metrics
      revenueGrowth: Number(revenueGrowth.toFixed(2)),
      ordersGrowth: Number(ordersGrowth.toFixed(2)),

      // Additional stats
      averageOrderValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
      tableOccupancyRate: tables.length > 0 ? (activeTables / tables.length) * 100 : 0,
    };
  }, []);

  /**
   * Fetch all required data and calculate stats
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [invoicesRes, tablesRes, usersRes, dishesRes] = await Promise.all([
        invoiceApi.getAll().catch(() => ({ data: [] })),
        tableApi.getAllTables().catch(() => ({ data: [] })),
        userApi.getAllUsers().catch(() => ({ data: [] })),
        dishApi.getAll().catch(() => ({ data: [] })),
      ]);

      // Extract data arrays
      const invoices = invoicesRes?.data || [];
      const tables = tablesRes?.data || [];
      const users = usersRes?.data || [];
      const dishes = dishesRes?.data || [];

      // Calculate statistics
      const calculatedStats = calculateStats(invoices, tables, users, dishes);
      setStats(calculatedStats);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error fetching dashboard stats';
      console.error('Dashboard stats error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        console.log('Auto-refreshing dashboard stats...');
        fetchStats();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export default useDashboardStats;
