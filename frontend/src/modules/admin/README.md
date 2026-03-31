# Admin Panel - Desktop Interface

## Overview
Admin panel quản lý toàn bộ hệ thống nhà hàng, được thiết kế dành riêng cho desktop.

## Modules Implemented

### 1. Dashboard (`/admin/dashboard`)
- Hiển thị thống kê tổng quan
- Doanh thu hôm nay, tổng đơn hàng
- Bàn đang sử dụng, đơn chờ xử lý
- Auto-refresh mỗi 30 giây
- Quick actions

**Roles**: ADMIN, EMPLOYEE

### 2. Product Management (`/admin/products`)
- **Dishes Tab**: Quản lý món ăn
  - CRUD operations
  - Filter theo category, status
  - Upload image URL
  - Update status (Available, Out of Stock, Discontinued)
- **Categories Tab**: Quản lý danh mục
  - CRUD operations
  - View dish count per category

**Roles**: ADMIN only

### 3. Table Management (`/admin/tables`)
- Quản lý bàn ăn
- CRUD operations
- Filter theo area, status
- Update status (Available, Occupied, Reserved, Maintenance)
- Visual card layout với color coding

**Roles**: ADMIN, EMPLOYEE

### 4. Order Management (`/admin/orders`)
- Xem và quản lý đơn hàng
- Filter theo status
- Update order status
- View order details (modal)
- Real-time stats

**Roles**: ADMIN, EMPLOYEE

### 5. User Management (`/admin/users`)
- Quản lý nhân viên và admin
- CRUD operations
- Filter theo role
- Password management

**Roles**: ADMIN only

## Features

### Common Features
- ✅ Desktop-first responsive design
- ✅ Search & Filter functionality
- ✅ Real-time statistics
- ✅ Loading & error states
- ✅ Modal-based forms
- ✅ Role-based access control
- ✅ Clean, modern UI with consistent styling

### Design Principles
- **Minimum width**: 1024px
- **Optimized for**: 1920x1080 (Full HD)
- **Color scheme**: Purple (#667eea) primary
- **Layout**: Sidebar + Main content area
- **Responsive**: Warning on mobile devices

## File Structure

```
admin/
├── auth/
│   ├── LoginPage.jsx
│   └── LoginPage.module.css
├── dashboard/
│   ├── index.jsx
│   ├── index.module.css
│   ├── components/
│   │   ├── StatsCard.jsx
│   │   └── StatsCard.module.css
│   └── hooks/
│       └── useDashboardStats.js
├── product-management/
│   ├── index.jsx
│   ├── index.module.css
│   └── components/
│       ├── DishManagement.jsx
│       ├── DishManagement.module.css
│       ├── DishModal.jsx
│       ├── DishModal.module.css
│       ├── CategoryManagement.jsx
│       ├── CategoryManagement.module.css
│       ├── CategoryModal.jsx
│       ├── CategoryModal.module.css
│       └── index.js
├── user-management/
│   ├── index.jsx
│   ├── index.module.css
│   └── components/
│       ├── UserModal.jsx
│       ├── UserModal.module.css
│       └── index.js
├── table-management/
│   ├── index.jsx
│   ├── index.module.css
│   └── components/
│       ├── TableModal.jsx
│       ├── TableModal.module.css
│       └── index.js
├── order-management/
│   ├── index.jsx
│   └── index.module.css
└── admin-note.md
```

## API Integration

All modules integrate with backend APIs:
- `userApi` - User management
- `tableApi` - Table management
- `dishApi` - Dish management
- `categoryApi` - Category management
- `invoiceApi` - Order/Invoice management
- `dashboardApi` - Dashboard statistics

## Routes

```jsx
/admin/login          - Admin login page (public)
/admin/dashboard      - Main dashboard (ADMIN, EMPLOYEE)
/admin/products       - Product management (ADMIN)
/admin/tables         - Table management (ADMIN, EMPLOYEE)
/admin/orders         - Order management (ADMIN, EMPLOYEE)
/admin/users          - User management (ADMIN)
```

## Usage

### Starting Development Server
```bash
cd frontend
npm run dev
```

### Access Admin Panel
1. Navigate to `http://localhost:5173/admin/login`
2. Login with admin credentials
3. Access different modules from sidebar

### Role-Based Access
- **ADMIN**: Full access to all modules
- **EMPLOYEE**: Access to Dashboard, Orders, Tables only

## Components

### Shared Components
- `AdminLayout` - Main layout with sidebar
- `ProtectedAdminRoute` - Route protection with role checking
- `AdminAuthContext` - Authentication state management

### Module-Specific Components
Each module has its own:
- Main page component
- Modal components for CRUD
- Custom hooks for data fetching
- Scoped CSS modules

## Styling

All modules use CSS Modules for scoped styling:
- Consistent color scheme
- Shared design patterns
- Responsive breakpoints
- Hover effects and transitions
- Status-based color coding

## Testing Checklist

- [ ] Login as ADMIN user
- [ ] Test Dashboard statistics display
- [ ] Create/Edit/Delete dishes and categories
- [ ] Create/Edit/Delete tables
- [ ] Create/Edit/Delete users
- [ ] View and update order status
- [ ] Test filters and search functionality
- [ ] Test role-based access (EMPLOYEE vs ADMIN)
- [ ] Test responsive behavior on different desktop sizes
- [ ] Test error handling and loading states

## Next Steps

Potential enhancements:
- [ ] Real-time updates with WebSocket
- [ ] Advanced analytics and charts
- [ ] Bulk operations
- [ ] Export reports (PDF, Excel)
- [ ] Image upload for dishes
- [ ] Notification system
- [ ] Activity logs
- [ ] Advanced filtering and sorting
