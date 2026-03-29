# Orders Module - React

## Mô tả
Module hiển thị đơn hàng của khách hàng với trạng thái từng món ăn, được xây dựng bằng React dựa trên cấu trúc HTML đã có.

## Cấu trúc thư mục

```
orders/
├── index.jsx                      # Main component
├── index.module.css              # Main styles
├── components/
│   ├── OrderItem.jsx             # Component hiển thị món
│   ├── OrderItem.module.css      # Styles cho OrderItem
│   ├── StatusOverview.jsx        # Component tổng quan trạng thái
│   ├── StatusOverview.module.css # Styles cho StatusOverview
│   └── index.js                  # Export components
├── hooks/
│   ├── useOrders.js              # Hook fetch orders data
│   ├── useOrderStatus.js         # Hook quản lý status
│   └── index.js                  # Export hooks
└── README.md                     # Documentation này
```

## Components

### 1. Orders (Main Component)
**File:** `index.jsx`

Component chính của trang Orders, quản lý toàn bộ logic và state.

**Props:** Không có (lấy tableId từ storage)

**Features:**
- Fetch orders data từ API
- Auto-refresh mỗi 30 giây
- Hiển thị loading, error, empty states
- Toast notifications
- Calculate totals (subtotal, service fee, total)

**States:**
```javascript
const [tableId, setTableId] = useState(null);
const [toast, setToast] = useState(null);
```

### 2. OrderItem Component
**File:** `components/OrderItem.jsx`

Hiển thị một món trong đơn hàng.

**Props:**
```javascript
{
  item: {
    id: number,
    dish: {
      id: number,
      name: string,
      image: string,
      price: number
    },
    quantity: number,
    unitPrice: number,
    totalPrice: number,
    status?: string  // Optional, từ backend
  },
  statusConfig: {
    key: string,
    label: string,
    icon: string,
    color: string,
    class: string
  },
  onStatusChange?: function  // Optional, cho WebSocket
}
```

**Features:**
- Hiển thị hình ảnh món ăn
- Quantity badge
- Unit price và total price
- Status indicator với màu sắc
- Hover animation

### 3. StatusOverview Component
**File:** `components/StatusOverview.jsx`

Hiển thị tổng quan số lượng món theo từng trạng thái.

**Props:**
```javascript
{
  statusCounts: {
    pending: number,
    preparing: number,
    ready: number,
    served: number,
    cancelled: number
  },
  ORDER_STATUSES: object  // Status configuration
}
```

**Features:**
- 3 status cards: Pending, Preparing, Ready
- Active state khi có items
- Color-coded icons
- Responsive grid layout

## Hooks

### 1. useOrders
**File:** `hooks/useOrders.js`

Hook để fetch và quản lý orders data.

**Usage:**
```javascript
const { 
  invoice, 
  items, 
  loading, 
  error, 
  refetch, 
  clearCache 
} = useOrders(tableId, autoRefreshInterval);
```

**Parameters:**
- `tableId` (number|null): ID của bàn
- `autoRefreshInterval` (number): Thời gian auto-refresh (ms), 0 = tắt, default = 30000

**Returns:**
```javascript
{
  invoice: object|null,      // Invoice data
  items: array,              // Array of invoice items
  loading: boolean,          // Loading state
  error: string|null,        // Error message
  refetch: function,         // Manual refresh function
  clearCache: function       // Clear cached data
}
```

**Features:**
- Fetch active invoice cho table
- Fetch invoice items
- Auto-refresh với interval
- Offline cache support
- Error handling với fallback to cache

### 2. useOrderStatus
**File:** `hooks/useOrderStatus.js`

Hook để quản lý trạng thái của items.

**Usage:**
```javascript
const { 
  statusCounts, 
  getItemStatus, 
  updateItemStatus,
  getStatusConfig,
  ORDER_STATUSES 
} = useOrderStatus(items);
```

**Parameters:**
- `items` (array): Danh sách order items

**Returns:**
```javascript
{
  statusCounts: object,           // Count by status
  getItemStatus: function,        // Get item's current status
  updateItemStatus: function,     // Update item status (local)
  getStatusConfig: function,      // Get status configuration
  ORDER_STATUSES: object         // All status configs
}
```

**Order Statuses:**
```javascript
{
  PENDING: { label: 'Chờ xác nhận', icon: 'fa-clock', color: '#f39c12' },
  PREPARING: { label: 'Đang làm', icon: 'fa-fire', color: '#e74c3c' },
  READY: { label: 'Đã xong', icon: 'fa-check-circle', color: '#27ae60' },
  SERVED: { label: 'Đã phục vụ', icon: 'fa-utensils', color: '#3498db' },
  CANCELLED: { label: 'Đã hủy', icon: 'fa-ban', color: '#95a5a6' }
}
```

## API Integration

### API Methods Added to `invoiceApi.js`

#### 1. getActiveInvoice
```javascript
await invoiceApi.getActiveInvoice(tableId);
```

**Endpoint:** `GET /invoices/table/{tableId}/active`

**Response:**
```javascript
{
  success: true,
  data: {
    id: 123,
    table: { id: 1, tableNumber: 5 },
    totalAmount: 150000,
    status: "PENDING",
    createdAt: "2024-01-01T12:00:00",
    items: [...]  // May include items
  }
}
```

#### 2. getInvoiceItems
```javascript
await invoiceApi.getInvoiceItems(invoiceId);
```

**Endpoint:** `GET /invoice-items/invoice/{invoiceId}`

**Response:**
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      dish: { id: 10, name: "Cơm tấm", price: 50000, image: "..." },
      quantity: 2,
      unitPrice: 50000,
      totalPrice: 100000
      // status: "PENDING"  // Sẽ có khi backend cập nhật
    }
  ]
}
```

## Data Flow

```
1. Component Mount
   ↓
2. Get tableId from storage
   ↓
3. useOrders(tableId) - Fetch data
   ↓
4. GET /invoices/table/{tableId}/active
   ↓
5. GET /invoice-items/invoice/{invoiceId} (if needed)
   ↓
6. useOrderStatus(items) - Calculate status counts
   ↓
7. Render OrderItems with StatusOverview
   ↓
8. Auto-refresh every 30s
```

## Storage Management

**Keys used in localStorage:**
```javascript
'currentTableId'        // Table ID đang sử dụng
'currentInvoice'        // Cached invoice data
'currentInvoiceItems'   // Cached items array
```

**Functions:**
```javascript
storage.get('currentTableId');
storage.set('currentTableId', 1);
storage.remove('currentInvoice');
```

## Styling

### CSS Modules
- `index.module.css` - Main page styles
- `OrderItem.module.css` - Item component styles
- `StatusOverview.module.css` - Status cards styles

### Key Classes
```css
.ordersContainer     - Main container
.ordersHeader        - Header with title and actions
.orderItems          - Items list
.orderSummary        - Summary section
.emptyState          - Empty state
.loading             - Loading spinner
.error               - Error message
.toast               - Toast notification
.addMoreBtn          - Floating action button
```

### Responsive Breakpoints
- Mobile: `< 768px`
- Tablet: `769px - 1024px`
- Desktop: `> 1025px`

## Usage Example

### In App Router
```javascript
import { Orders } from './modules/customer/orders';

<Route path="/customer/orders" element={<Orders />} />
```

### Programmatic Navigation
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/customer/orders');
```

### Link Navigation
```javascript
import { Link } from 'react-router-dom';

<Link to="/customer/orders">Xem đơn hàng</Link>
```

## Future Enhancements

### 1. WebSocket Integration
Thêm hook `useWebSocket` để nhận real-time updates:

```javascript
// hooks/useWebSocket.js
export const useWebSocket = (invoiceId, onUpdate) => {
  useEffect(() => {
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);
    
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/invoice/${invoiceId}`, (message) => {
        const data = JSON.parse(message.body);
        onUpdate(data);
      });
    });
    
    return () => stompClient.disconnect();
  }, [invoiceId]);
};
```

**Usage in Orders component:**
```javascript
useWebSocket(invoice?.id, (data) => {
  if (data.type === 'ITEM_STATUS_UPDATE') {
    updateItemStatus(data.itemId, data.status);
  } else {
    refetch(); // Full refresh
  }
});
```

### 2. Backend Status Support

Khi backend thêm field `status` vào `InvoiceItemEntity`:

```java
@Entity
public class InvoiceItemEntity {
    // ... existing fields
    
    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.PENDING;
}
```

Frontend sẽ **tự động nhận và hiển thị** status từ API response. Không cần thay đổi code!

### 3. Filter by Status
```javascript
const [filterStatus, setFilterStatus] = useState(null);

const filteredItems = filterStatus 
  ? items.filter(item => getItemStatus(item) === filterStatus)
  : items;
```

### 4. Pull to Refresh
```javascript
const [refreshing, setRefreshing] = useState(false);

const handlePullRefresh = async () => {
  setRefreshing(true);
  await refetch();
  setRefreshing(false);
};
```

## Troubleshooting

### Issue: "No active invoice found"
**Cause:** Bàn chưa có hóa đơn đang chờ thanh toán

**Solution:** Trang sẽ hiển thị empty state với button "Xem Menu"

### Issue: Items không hiển thị
**Cause:** API không trả về items trong invoice response

**Solution:** Hook `useOrders` sẽ tự động fetch items riêng qua endpoint `/invoice-items/invoice/{id}`

### Issue: Status không cập nhật
**Cause:** Backend chưa có field `status` trong InvoiceItemEntity

**Solution:** Tất cả items sẽ mặc định hiển thị "Chờ xác nhận" cho đến khi backend được cập nhật

### Issue: Auto-refresh không hoạt động
**Cause:** Component unmount trước khi interval chạy

**Solution:** useOrders hook đã xử lý cleanup, check console logs để debug

## Testing

### Manual Testing
1. Navigate to `/customer/orders`
2. Check if orders load correctly
3. Verify status counts are accurate
4. Click refresh button
5. Wait 30s to verify auto-refresh
6. Check responsive on mobile

### Console Debugging
```javascript
// In browser console
localStorage.setItem('currentTableId', '1');
window.location.reload();

// Check stored data
console.log(localStorage.getItem('currentInvoice'));
console.log(localStorage.getItem('currentInvoiceItems'));
```

## Dependencies
- React 18+
- react-router-dom (for navigation)
- Font Awesome (for icons)
- axios (API calls via invoiceApi)

## Performance
- Auto-refresh: 30s interval (configurable)
- Cache: Uses localStorage for offline support
- Memoization: `useMemo` for status counts calculation
- Lazy loading: Components can be code-split if needed

## Accessibility
- Semantic HTML structure
- ARIA labels can be added
- Keyboard navigation support
- Screen reader friendly

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
