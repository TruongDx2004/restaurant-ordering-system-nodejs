# App.jsx Routes Configuration

## Add these imports at the top of App.jsx:

```javascript
// Admin Auth Context
import { AdminAuthProvider } from './contexts/admin/AdminAuthContext';

// Admin Components
import AdminLogin from './modules/admin/auth/LoginPage';
import Dashboard from './modules/admin/dashboard';
import AdminLayout from './layouts/AdminLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
```

## Wrap your Routes with AdminAuthProvider:

```javascript
function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ==================== ADMIN ROUTES ==================== */}
          
          {/* Admin Login (Public) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Dashboard (Protected) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* Admin Routes - ADMIN only */}
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute requiredRole="ADMIN">
                <AdminLayout>
                  <div>User Management - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute requiredRole="ADMIN">
                <AdminLayout>
                  <div>Categories Management - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/dishes"
            element={
              <ProtectedAdminRoute requiredRole="ADMIN">
                <AdminLayout>
                  <div>Dishes Management - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedAdminRoute requiredRole="ADMIN">
                <AdminLayout>
                  <div>Reports - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* Admin/Employee Routes (Both roles) */}
          <Route
            path="/admin/tables"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <div>Tables Management - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <div>Orders Management - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* ==================== EMPLOYEE ROUTES ==================== */}
          
          {/* Employee uses same login */}
          {/* Auto-redirect in LoginPage based on role */}
          
          <Route
            path="/employee/orders"
            element={
              <ProtectedAdminRoute requiredRole="EMPLOYEE">
                <AdminLayout>
                  <div>Employee Orders - Coming soon</div>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* ==================== CUSTOMER ROUTES ==================== */}
          
          {/* Your existing customer routes here */}
          <Route path="/customer/home" element={<Home />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/orders" element={<Orders />} />
          <Route path="/customer/invoice" element={<Invoice />} />
          <Route path="/customer/profile" element={<Profile />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/customer/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
```

## Full Example App.jsx:

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Admin Auth Context
import { AdminAuthProvider } from './contexts/admin/AdminAuthContext';

// Admin Components
import AdminLogin from './modules/admin/auth/LoginPage';
import Dashboard from './modules/admin/dashboard';
import AdminLayout from './layouts/AdminLayout';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Customer Components (your existing)
import Home from './modules/customer/home';
import Cart from './modules/customer/cart';
import Orders from './modules/customer/orders';
import Invoice from './modules/customer/invoice';
import Profile from './modules/customer/profile';

function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* Customer Routes */}
          <Route path="/customer/home" element={<Home />} />
          <Route path="/customer/cart" element={<Cart />} />
          <Route path="/customer/orders" element={<Orders />} />
          <Route path="/customer/invoice" element={<Invoice />} />
          <Route path="/customer/profile" element={<Profile />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/customer/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
```

## Notes:

1. **AdminAuthProvider** wraps everything to provide auth context
2. **ProtectedAdminRoute** requires authentication
3. **requiredRole prop** restricts access to specific roles
4. **AdminLayout** provides sidebar + header
5. Routes without `requiredRole` allow both ADMIN and EMPLOYEE

## Testing URLs:

- Admin Login: `http://localhost:5173/admin/login`
- Dashboard: `http://localhost:5173/admin/dashboard`
- Customer Home: `http://localhost:5173/customer/home`
