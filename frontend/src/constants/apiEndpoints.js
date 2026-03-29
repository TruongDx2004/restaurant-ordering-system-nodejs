/**
 * API Endpoints Constants
 * Tập trung tất cả các API endpoints ở một nơi để dễ quản lý
 */

// Base paths
export const API_BASE = {
  DISHES: '/dishes',
  CATEGORIES: '/categories',
  TABLES: '/tables',
  INVOICES: '/invoices',
  INVOICE_ITEMS: '/invoice-items',
  PAYMENTS: '/payments',
  CUSTOMERS: '/customers',
  AUTH: '/auth',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
};

// Dish endpoints
export const DISH_ENDPOINTS = {
  GET_ALL: `${API_BASE.DISHES}`,
  GET_BY_ID: (id) => `${API_BASE.DISHES}/${id}`,
  CREATE: `${API_BASE.DISHES}`,
  UPDATE: (id) => `${API_BASE.DISHES}/${id}`,
  DELETE: (id) => `${API_BASE.DISHES}/${id}`,
  
  // Query endpoints
  GET_BY_STATUS: (status) => `${API_BASE.DISHES}/status/${status}`,
  GET_BY_CATEGORY: (categoryId) => `${API_BASE.DISHES}/category/${categoryId}`,
  SEARCH: `${API_BASE.DISHES}/search`, // ?name=query
  UPDATE_STATUS: (id) => `${API_BASE.DISHES}/${id}/status`, // ?status=AVAILABLE
};

// Category endpoints
export const CATEGORY_ENDPOINTS = {
  GET_ALL: `${API_BASE.CATEGORIES}`,
  GET_BY_ID: (id) => `${API_BASE.CATEGORIES}/${id}`,
  GET_BY_NAME: (name) => `${API_BASE.CATEGORIES}/name/${name}`,
  CREATE: `${API_BASE.CATEGORIES}`,
  UPDATE: (id) => `${API_BASE.CATEGORIES}/${id}`,
  DELETE: (id) => `${API_BASE.CATEGORIES}/${id}`,
};

// Table endpoints
export const TABLE_ENDPOINTS = {
  GET_ALL: `${API_BASE.TABLES}`,
  GET_BY_ID: (id) => `${API_BASE.TABLES}/${id}`,
  GET_BY_STATUS: (status) => `${API_BASE.TABLES}/status/${status}`,
  CREATE: `${API_BASE.TABLES}`,
  UPDATE: (id) => `${API_BASE.TABLES}/${id}`,
  DELETE: (id) => `${API_BASE.TABLES}/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE.TABLES}/${id}/status`,
};

// Invoice endpoints
export const INVOICE_ENDPOINTS = {
  GET_ALL: `${API_BASE.INVOICES}`,
  GET_BY_ID: (id) => `${API_BASE.INVOICES}/${id}`,
  GET_BY_TABLE: (tableId) => `${API_BASE.INVOICES}/table/${tableId}`,
  GET_BY_STATUS: (status) => `${API_BASE.INVOICES}/status/${status}`,
  CREATE: `${API_BASE.INVOICES}`,
  UPDATE: (id) => `${API_BASE.INVOICES}/${id}`,
  DELETE: (id) => `${API_BASE.INVOICES}/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE.INVOICES}/${id}/status`,
  ADD_ITEM: (id) => `${API_BASE.INVOICES}/${id}/items`,
};

// Invoice Item endpoints
export const INVOICE_ITEM_ENDPOINTS = {
  GET_ALL: `${API_BASE.INVOICE_ITEMS}`,
  GET_BY_ID: (id) => `${API_BASE.INVOICE_ITEMS}/${id}`,
  GET_BY_INVOICE: (invoiceId) => `${API_BASE.INVOICE_ITEMS}/invoice/${invoiceId}`,
  CREATE: `${API_BASE.INVOICE_ITEMS}`,
  UPDATE: (id) => `${API_BASE.INVOICE_ITEMS}/${id}`,
  DELETE: (id) => `${API_BASE.INVOICE_ITEMS}/${id}`,
  UPDATE_STATUS: (id) => `${API_BASE.INVOICE_ITEMS}/${id}/status`, // ?status=PREPARING
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  GET_ALL: `${API_BASE.PAYMENTS}`,
  GET_BY_ID: (id) => `${API_BASE.PAYMENTS}/${id}`,
  GET_BY_INVOICE: (invoiceId) => `${API_BASE.PAYMENTS}/invoice/${invoiceId}`,
  CREATE: `${API_BASE.PAYMENTS}`,
  PROCESS: `${API_BASE.PAYMENTS}/process`,
};

// Customer Auth endpoints
export const CUSTOMER_AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE.CUSTOMERS}/login`,
  REGISTER: `${API_BASE.CUSTOMERS}/register`,
  LOGOUT: `${API_BASE.CUSTOMERS}/logout`,
  REFRESH_TOKEN: `${API_BASE.CUSTOMERS}/refresh`,
};

// Customer endpoints
export const CUSTOMER_ENDPOINTS = {
  GET_PROFILE: `${API_BASE.CUSTOMERS}/profile`,
  UPDATE_PROFILE: `${API_BASE.CUSTOMERS}/profile`,
  GET_ORDERS: `${API_BASE.CUSTOMERS}/orders`,
};

// Message endpoints
export const MESSAGE_ENDPOINTS = {
  GET_ALL: `${API_BASE.MESSAGES}`,
  GET_BY_ID: (id) => `${API_BASE.MESSAGES}/${id}`,
  SEND: `${API_BASE.MESSAGES}`,
  GET_BY_RECIPIENT: (recipientType, recipientId) => 
    `${API_BASE.MESSAGES}/recipient/${recipientType}/${recipientId}`,
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_ALL: `${API_BASE.NOTIFICATIONS}`,
  GET_BY_ID: (id) => `${API_BASE.NOTIFICATIONS}/${id}`,
  CREATE: `${API_BASE.NOTIFICATIONS}`,
  MARK_AS_READ: (id) => `${API_BASE.NOTIFICATIONS}/${id}/read`,
  GET_UNREAD: `${API_BASE.NOTIFICATIONS}/unread`,
};

// WebSocket endpoints
export const WEBSOCKET_ENDPOINTS = {
  CONNECT: '/ws',
  SUBSCRIBE_ORDERS: '/topic/orders',
  SUBSCRIBE_NOTIFICATIONS: '/topic/notifications',
  SUBSCRIBE_MESSAGES: '/topic/messages',
  SEND_MESSAGE: '/app/message',
};

export default {
  API_BASE,
  DISH_ENDPOINTS,
  CATEGORY_ENDPOINTS,
  TABLE_ENDPOINTS,
  INVOICE_ENDPOINTS,
  INVOICE_ITEM_ENDPOINTS,
  PAYMENT_ENDPOINTS,
  CUSTOMER_AUTH_ENDPOINTS,
  CUSTOMER_ENDPOINTS,
  MESSAGE_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  WEBSOCKET_ENDPOINTS,
};
