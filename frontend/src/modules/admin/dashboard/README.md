# Admin Dashboard - Desktop Optimized (No Backend API)

## 🎯 Overview

Dashboard hiện tại **KHÔNG sử dụng dedicated backend API** (`/api/dashboard`). Thay vào đó, nó tính toán statistics trực tiếp từ các API có sẵn:
- `invoiceApi` - Lấy dữ liệu đơn hàng
- `tableApi` - Lấy dữ liệu bàn
- `userApi` - Lấy dữ liệu người dùng
- `dishApi` - Lấy dữ liệu món ăn

---

## 📂 File Structure

```
dashboard/
├── index.jsx                   # Main dashboard component
├── index.module.css            # Dashboard styles
├── README.md                   # This file
├── components/
│   ├── StatsCard.jsx          # Stats card component
│   ├── StatsCard.module.css   # Stats card styles
│   └── index.js               # Component exports
└── hooks/
    ├── useDashboardStats.js   # Custom hook for stats calculation
    └── index.js               # Hook exports
```

---

## 🔧 How It Works

### 1. Data Fetching (useDashboardStats hook)

```javascript
// Fetch all required data in parallel
const [invoicesRes, tablesRes, usersRes, dishesRes] = await Promise.all([
  invoiceApi.getAllInvoices(),
  tableApi.getAllTables(),
  userApi.getAllUsers(),
  dishApi.getAllDishes(),
]);
```

### 2. Statistics Calculation

**Today's Revenue:**
```javascript
const todayRevenue = todayInvoices
  .filter(inv => inv.status === 'PAID')
  .reduce((sum, inv) => sum + inv.totalAmount, 0);
```

**Growth Calculation:**
```javascript
const revenueGrowth = yesterdayRevenue === 0
  ? (todayRevenue > 0 ? 100 : 0)
  : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
```

**Active Tables:**
```javascript
const activeTables = tables.filter(t => t.status === 'OCCUPIED').length;
```

**Pending Orders:**
```javascript
const pendingOrders = invoices.filter(inv => inv.status === 'OPEN').length;
```

---

## 📊 Statistics Displayed

### Today's Stats (Primary Cards)
| Stat | Calculation | API Used |
|------|-------------|----------|
| **Doanh thu hôm nay** | Sum of PAID invoices created today | invoiceApi |
| **Đơn hàng hôm nay** | Count of invoices created today | invoiceApi |
| **Bàn đang phục vụ** | Count of OCCUPIED tables | tableApi |
| **Đơn chờ xử lý** | Count of OPEN invoices | invoiceApi |

### Overall Stats (Secondary Cards)
| Stat | Calculation | API Used |
|------|-------------|----------|
| **Tổng doanh thu** | Sum of all PAID invoices | invoiceApi |
| **Tổng khách hàng** | Count of users with role CUSTOMER | userApi |
| **Tổng món ăn** | Count of all dishes | dishApi |
| **Tổng số bàn** | Count of all tables | tableApi |

### Additional Insights
| Stat | Calculation |
|------|-------------|
| **Giá trị đơn hàng TB** | Total revenue / Total orders |
| **Tỷ lệ sử dụng bàn** | (Active tables / Total tables) × 100 |
| **Tăng trưởng doanh thu** | ((Today - Yesterday) / Yesterday) × 100 |
| **Tăng trưởng đơn hàng** | ((Today - Yesterday) / Yesterday) × 100 |

---

## 🎨 Design Features

### Color Scheme
- **Primary (Purple)**: `#667eea` → `#764ba2` - Revenue stats
- **Success (Green)**: `#48bb78` → `#38a169` - Order stats
- **Info (Blue)**: `#4299e1` → `#3182ce` - Table stats
- **Warning (Orange)**: `#ed8936` → `#dd6b20` - Pending stats

### Layout
- **Desktop (≥1600px)**: 4-column grid
- **Laptop (1400-1599px)**: 2-column grid
- **Tablet (768-1023px)**: 2-column grid
- **Mobile (<768px)**: Single column

### Card Variants
1. **Primary Cards**: Gradient icon background, white card
2. **Secondary Cards**: Light gray background, white icon container

---

## ⚡ Performance

### Auto Refresh
- Default: **30 seconds** (configurable)
- Can be disabled by passing `0` to `useDashboardStats(0)`

### Optimization
- **Parallel API calls** using `Promise.all()`
- **Client-side calculation** (no extra backend load)
- **Memoized calculations** with `useCallback`
- **Loading states** for better UX

---

## 🚀 Usage

### Basic Usage
```jsx
import Dashboard from './modules/admin/dashboard';

function App() {
  return <Dashboard />;
}
```

### Custom Refresh Interval
```jsx
// In useDashboardStats.js, change:
const { stats, loading, error, refetch } = useDashboardStats(60000); // 60s
```

### Manual Refresh
```jsx
<button onClick={refetch}>Refresh</button>
```

---

## 📱 Responsive Breakpoints

```css
/* Desktop Full HD */
@media (min-width: 1600px) {
  .statsGrid { grid-template-columns: repeat(4, 1fr); }
}

/* Desktop/Laptop */
@media (max-width: 1400px) {
  .statsGrid { grid-template-columns: repeat(2, 1fr); }
}

/* Tablet */
@media (max-width: 1024px) {
  .dashboard { padding: 24px 30px; }
}

/* Mobile */
@media (max-width: 768px) {
  .statsGrid { grid-template-columns: 1fr; }
}
```

---

## 🔍 Debugging

### Check API Responses
```javascript
console.log('Invoices:', invoices);
console.log('Tables:', tables);
console.log('Users:', users);
console.log('Dishes:', dishes);
```

### Check Calculated Stats
```javascript
console.log('Today Revenue:', todayRevenue);
console.log('Growth:', revenueGrowth);
```

### Enable Verbose Logging
Add to `useDashboardStats.js`:
```javascript
console.log('Dashboard stats calculated:', calculatedStats);
```

---

## ⚠️ Important Notes

### Date Handling
- Uses client-side timezone
- Today = 00:00:00 to 23:59:59 local time
- Yesterday = previous day 00:00:00 to 23:59:59

### Invoice Status
- **PAID**: Counted in revenue
- **OPEN**: Counted in pending orders
- **CANCELLED**: Not counted

### Table Status
- **OCCUPIED**: Counted as active
- **AVAILABLE**: Not counted
- **RESERVED**: Not counted

---

## 🎯 Future Enhancements (Optional)

- [ ] Add date range picker for custom periods
- [ ] Add charts (revenue trend, order distribution)
- [ ] Add export to PDF/Excel functionality
- [ ] Add real-time WebSocket updates
- [ ] Add filters (by table, by user, by dish)
- [ ] Add comparison with last week/month
- [ ] Add top dishes/customers widgets

---

## 📸 Preview

**Desktop View (1920x1080)**:
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard - Tổng quan hoạt động nhà hàng    [Làm mới 🔄]  │
├─────────────────────────────────────────────────────────────┤
│  📅 Thống kê hôm nay                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ 💵 10M │ │ 📋 50  │ │ 🪑 12  │ │ ⏰ 5   │              │
│  │ +15%   │ │ +20%   │ │ 60%    │ │ Chờ    │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                              │
│  📈 Tổng quan hệ thống                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ 💰 500M│ │ 👥 300 │ │ 🍕 50  │ │ 🔲 20  │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                              │
│  💡 Thông tin thêm                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 200K/đơn │ │ Sử dụng  │ │ Tăng DT  │ │ Tăng ĐH  │     │
│  │ TB       │ │ 60%      │ │ +15%     │ │ +20%     │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [x] Dashboard loads without errors
- [x] Statistics calculate correctly
- [x] Auto-refresh works (30s interval)
- [x] Manual refresh button works
- [x] Growth percentages display correctly
- [x] Responsive on different screen sizes
- [x] Loading states show properly
- [x] Error handling works
- [x] Color variants display correctly
- [x] Hover effects work
- [x] Icons display from Font Awesome

---

**Status**: ✅ **COMPLETED**  
**Last Updated**: 2024-03-02  
**Developer**: Rovo Dev
