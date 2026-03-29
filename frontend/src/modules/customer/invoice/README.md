# Invoice Module - React

## Mô tả
Module hiển thị hóa đơn chi tiết và xử lý thanh toán cho khách hàng.

## Cấu trúc thư mục

```
invoice/
├── index.jsx                      # Main component
├── index.module.css              # Main styles
├── components/
│   ├── InvoiceTable.jsx          # Bảng hiển thị món ăn
│   ├── InvoiceTable.module.css   # Styles cho bảng
│   ├── PaymentSection.jsx        # Phần thanh toán
│   ├── PaymentSection.module.css # Styles cho payment
│   └── index.js                  # Export components
├── hooks/
│   ├── useInvoicePayment.js      # Hook xử lý thanh toán
│   └── index.js                  # Export hooks
└── README.md                     # Documentation này
```

## Components

### 1. Invoice (Main Component)
**File:** `index.jsx`

Component chính hiển thị toàn bộ hóa đơn và xử lý thanh toán.

**Features:**
- Hiển thị thông tin hóa đơn (ID, bàn, ngày giờ, trạng thái)
- Hiển thị danh sách món ăn dạng bảng
- Phần thanh toán với chọn phương thức
- Toast notifications
- Print invoice
- Redirect sau khi thanh toán thành công

**States:**
```javascript
const [tableNumber, setTableNumber] = useState(null);
const [toast, setToast] = useState(null);
```

### 2. InvoiceTable Component
**File:** `components/InvoiceTable.jsx`

Hiển thị danh sách món ăn dạng bảng.

**Props:**
```javascript
{
  items: [
    {
      id: number,
      dish: {
        id: number,
        name: string,
        image: string,
        price: number
      },
      quantity: number,
      unitPrice: number,
      totalPrice: number
    }
  ]
}
```

**Columns:**
- STT
- Tên món (+ hình ảnh)
- Đơn giá
- Số lượng
- Thành tiền

### 3. PaymentSection Component
**File:** `components/PaymentSection.jsx`

Phần thanh toán với chọn phương thức và nút thanh toán.

**Props:**
```javascript
{
  invoice: object,           // Invoice data
  items: array,              // Invoice items
  onPayment: function,       // Callback khi thanh toán
  isProcessing: boolean      // Trạng thái đang xử lý
}
```

**Features:**
- Hiển thị tổng kết (tạm tính, phí dịch vụ, tổng cộng)
- 4 phương thức thanh toán
- Nút thanh toán với validation
- Warning message nếu chưa thể thanh toán

## Hooks

### useInvoicePayment
**File:** `hooks/useInvoicePayment.js`

Hook xử lý logic thanh toán.

**Usage:**
```javascript
const { 
  processPayment, 
  isProcessing, 
  error, 
  paymentResult,
  resetPayment 
} = useInvoicePayment();
```

**Methods:**
- `processPayment(invoiceId, paymentMethod, amount)` - Xử lý thanh toán
- `resetPayment()` - Reset trạng thái

**Returns:**
```javascript
{
  processPayment: async function,
  isProcessing: boolean,
  error: string|null,
  paymentResult: object|null,
  resetPayment: function
}
```

## API Integration

### Payment API
**File:** `src/api/paymentApi.js`

Các endpoint để xử lý thanh toán.

#### processPayment
```javascript
await paymentApi.processPayment(invoiceId, paymentMethod, amount);
```

**Endpoint:** `POST /api/payments/process`

**Params:**
- `invoiceId` - Invoice ID
- `method` - Payment method (CASH, BANK_TRANSFER, CREDIT_CARD, E_WALLET)
- `amount` - Số tiền thanh toán

**Response:**
```javascript
{
  success: true,
  data: {
    id: number,
    invoice: { id: number },
    method: string,
    amount: number,
    status: string,
    transactionCode: string,
    paidAt: string
  },
  message: "Payment processed successfully"
}
```

## Payment Flow

```
1. User vào trang Invoice (/customer/invoice)
   ↓
2. Load invoice data (reuse useOrders hook)
   ↓
3. Hiển thị InvoiceTable + PaymentSection
   ↓
4. User chọn payment method
   ↓
5. User click nút thanh toán
   ↓
6. handlePayment() được gọi
   ↓
7. processPayment(invoiceId, method, amount)
   ↓
8. Call API: POST /payments/process
   ↓
9. Backend xử lý thanh toán
   ↓
10. Nếu thành công:
    - Show toast success
    - Redirect to payment success page
    Nếu thất bại:
    - Show toast error
```

## Payment Methods

```javascript
const PAYMENT_METHODS = {
  CASH: {
    label: 'Tiền mặt',
    icon: 'fa-money-bill-wave'
  },
  BANK_TRANSFER: {
    label: 'Chuyển khoản',
    icon: 'fa-university'
  },
  CREDIT_CARD: {
    label: 'Thẻ tín dụng',
    icon: 'fa-credit-card'
  },
  E_WALLET: {
    label: 'Ví điện tử',
    icon: 'fa-wallet'
  }
};
```

## Invoice Statuses

```javascript
const INVOICE_STATUS = {
  OPEN: 'Đang phục vụ',    // Chưa thanh toán
  PAID: 'Đã thanh toán',   // Đã thanh toán
  CANCELLED: 'Đã hủy'      // Đã hủy
};
```

## Styling

### CSS Modules
- `index.module.css` - Main invoice page
- `InvoiceTable.module.css` - Table styles
- `PaymentSection.module.css` - Payment section styles

### Key Classes
```css
.invoiceContainer    - Main container
.invoiceHeader       - Header with invoice info
.invoiceInfo         - Invoice details
.status             - Status badge
.paidMessage        - Message khi đã thanh toán
.emptyState         - Empty state
.loading            - Loading spinner
.error              - Error message
.toast              - Toast notification
```

### Print Styles
Trang invoice có hỗ trợ in ấn. Khi in:
- Ẩn các nút (back, print)
- Ẩn toast notifications
- Giữ lại thông tin hóa đơn và bảng món ăn

## Usage Example

### In App Router
```javascript
import Invoice from './modules/customer/invoice';

<Route path="/customer/invoice" element={<Invoice />} />
```

### Navigate to Invoice
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/customer/invoice');
```

### From Orders Page
```javascript
<Link to="/customer/invoice">Xem hóa đơn</Link>
```

## Payment Success Page (Optional)

Sau khi thanh toán thành công, redirect đến trang success:

```javascript
navigate('/customer/payment-success', {
  state: {
    payment: result.payment,
    invoice: invoice,
    items: items
  }
});
```

Tạo component PaymentSuccess để hiển thị:
- Thông báo thành công
- Thông tin payment
- Thông tin invoice
- Nút quay về home

## Backend Requirements

### Invoice Status Update
Sau khi thanh toán, backend cần:
1. Tạo Payment record
2. Update Invoice status: OPEN → PAID
3. Update Invoice.paidAt timestamp
4. Update Table status nếu cần

### Payment Service
```java
@Transactional
public PaymentEntity processPayment(Long invoiceId, PaymentMethod method, BigDecimal amount) {
    // 1. Create payment
    PaymentEntity payment = new PaymentEntity();
    payment.setInvoice(invoice);
    payment.setMethod(method);
    payment.setAmount(amount);
    payment.setStatus(PaymentStatus.COMPLETED);
    payment = paymentRepository.save(payment);
    
    // 2. Update invoice
    invoice.setStatus(InvoiceStatus.PAID);
    invoice.setPaidAt(LocalDateTime.now());
    invoiceRepository.save(invoice);
    
    // 3. Update table (optional)
    table.setStatus(TableStatus.AVAILABLE);
    tableRepository.save(table);
    
    return payment;
}
```

## Error Handling

### Common Errors

**1. No invoice found**
```javascript
if (!invoice) {
  showToast('Không tìm thấy hóa đơn', 'error');
  return;
}
```

**2. Invoice already paid**
```javascript
if (invoice.status === 'PAID') {
  // Show paid message instead of payment section
}
```

**3. Payment processing failed**
```javascript
if (!result.success) {
  showToast(result.error || 'Thanh toán thất bại!', 'error');
}
```

## Testing

### Manual Testing

1. **Tạo hóa đơn:**
   - Vào Home → Add items → Go to Cart → Order
   
2. **Xem hóa đơn:**
   - Navigate to `/customer/invoice`
   - Verify invoice info displayed
   - Verify items table correct
   
3. **Thanh toán:**
   - Select payment method
   - Click payment button
   - Verify toast success
   - Verify redirect to success page
   
4. **Print:**
   - Click print button
   - Verify print preview correct

### Console Debugging
```javascript
// Check invoice data
console.log('Invoice:', invoice);
console.log('Items:', items);

// Check payment processing
console.log('Processing payment:', { invoiceId, method, amount });
```

## Responsive Design

### Mobile (< 768px)
- Smaller fonts
- Smaller buttons
- Compact table layout
- Full-width toast

### Tablet (769px - 1024px)
- Medium layout
- Optimized spacing

### Desktop (> 1025px)
- Full layout
- Max width 900px

## Future Enhancements

### 1. Item Status Display
Khi backend thêm status cho InvoiceItemEntity:
```javascript
// In InvoiceTable.jsx
<td className={styles.status}>
  <span className={styles[item.status?.toLowerCase()]}>
    {item.status === 'SERVED' ? 'Đã giao' : 'Đang làm'}
  </span>
</td>
```

### 2. QR Code Payment
Hiển thị QR code cho chuyển khoản:
```javascript
import QRCode from 'qrcode.react';

<QRCode value={paymentInfo} />
```

### 3. Payment History
Hiển thị lịch sử thanh toán của bàn:
```javascript
const { payments } = usePaymentHistory(tableNumber);
```

### 4. Split Bill
Cho phép chia hóa đơn:
```javascript
const handleSplitBill = (splitCount) => {
  const amountPerPerson = total / splitCount;
  // Process payment for each person
};
```

## Dependencies
- React 18+
- react-router-dom (navigation)
- Font Awesome (icons)
- axios (API calls)

## Performance
- No auto-refresh (user controls when to refresh)
- Lazy load payment API only when needed
- Optimized table rendering for many items

## Accessibility
- Semantic table structure
- Proper labels for radio buttons
- Keyboard navigation support
- Print-friendly layout

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
