# Employee Module

Module dành cho nhân viên nhà hàng để quản lý đơn hàng và bàn.

## Tính năng

### 1. Order Processing (`/employee/orders`)
- Xem tất cả đơn hàng đang hoạt động
- Cập nhật trạng thái món ăn:
  - **WAITING**: Chờ xử lý (màu vàng)
  - **PREPARING**: Đang làm (màu đỏ)
  - **SERVED**: Đã phục vụ (màu xanh dương)
  - **CANCELLED**: Đã hủy (màu xám)
- Lọc đơn hàng theo trạng thái món ăn
- Tìm kiếm theo số bàn
- Tự động làm mới mỗi 30 giây

### 2. Table Management (`/employee/tables`)
- Xem danh sách tất cả bàn
- Cập nhật trạng thái bàn:
  - **AVAILABLE**: Trống (màu xanh lá)
  - **OCCUPIED**: Có khách (màu đỏ)
  - **RESERVED**: Đã đặt (màu vàng)
- Lọc bàn theo trạng thái
- Tìm kiếm theo số bàn hoặc khu vực
- Hiển thị thông tin sức chứa và khu vực
- Thống kê tổng quan về bàn
- Tự động làm mới mỗi 30 giây

### 3. Kitchen View (`/employee/kitchen`)
- Màn hình bếp dạng Kanban board
- 2 cột: Chờ xử lý → Đang làm
- Hiển thị món ăn cần chế biến với:
  - Số bàn
  - Tên món
  - Số lượng
  - Ghi chú đặc biệt
  - Thời gian đặt món
- Nút bấm nhanh để chuyển trạng thái:
  - "Bắt đầu" (WAITING → PREPARING)
  - "Hoàn thành" (PREPARING → SERVED)
- Live indicator hiển thị cập nhật real-time
- Tự động làm mới mỗi 10 giây


## API Endpoints

### Invoice Item APIs
```javascript
// Get all invoice items
GET /api/invoice-items

// Get invoice item by ID
GET /api/invoice-items/{id}

// Get items by invoice ID
GET /api/invoice-items/invoice/{invoiceId}

// Update item status
PATCH /api/invoice-items/{id}/status?status=PREPARING

// Create invoice item
POST /api/invoice-items

// Update invoice item
PUT /api/invoice-items/{id}

// Delete invoice item
DELETE /api/invoice-items/{id}
```

### Table APIs
```javascript
// Get all tables
GET /api/tables

// Get table by ID
GET /api/tables/{id}

// Update table status
PATCH /api/tables/{id}/status?status=OCCUPIED

// Get tables by status
GET /api/tables/status/{status}

// Get tables by area
GET /api/tables/area/{area}
```

### Invoice APIs
```javascript
// Get all invoices
GET /api/invoices

// Get active invoice by table number
GET /api/invoices/table-number/{tableNumber}/active

// Get invoice items
GET /api/invoice-items/invoice/{invoiceId}

// Update invoice status
PATCH /api/invoices/{id}/status?status=PAID
```

## Backend Response Structure

### Invoice Item Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoiceId": 5,
    "dishId": 10,
    "dish": {
      "id": 10,
      "name": "Phở bò",
      "price": 50000,
      "image": "url",
      "category": { "id": 1, "name": "Món chính" },
      "status": "AVAILABLE"
    },
    "quantity": 2,
    "unitPrice": 50000,
    "totalPrice": 100000,
    "status": "PREPARING",
    "notes": "Không hành",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:35:00"
  },
  "message": "Success"
}
```

### Table Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableNumber": 5,
    "capacity": 4,
    "area": "Tầng 1",
    "status": "OCCUPIED",
    "qrCode": "QR_CODE_STRING",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  "message": "Success"
}
```

### Invoice Response with Items
```json
{
  "success": true,
  "data": {
    "id": 5,
    "tableId": 1,
    "customerId": 10,
    "status": "PENDING",
    "totalAmount": 250000,
    "notes": "",
    "createdAt": "2024-01-15T10:00:00",
    "updatedAt": "2024-01-15T10:30:00",
    "items": [
      {
        "id": 1,
        "dishId": 10,
        "dish": { ... },
        "quantity": 2,
        "unitPrice": 50000,
        "totalPrice": 100000,
        "status": "PREPARING",
        "notes": "Không hành"
      }
    ]
  },
  "message": "Success"
}
```

## Quyền truy cập

- **EMPLOYEE**: Có thể truy cập tất cả trang nhân viên
- **ADMIN**: Cũng có thể truy cập để giám sát

## Navigation

Layout nhân viên có sidebar với các menu:
1. **Xử lý đơn hàng** - Cập nhật trạng thái món ăn
2. **Quản lý bàn** - Theo dõi và cập nhật trạng thái bàn
3. **Bếp** - Màn hình bếp dạng Kanban

## Auto Refresh

- Order Processing: 30 giây
- Table Management: 30 giây
- Kitchen View: 10 giây (nhanh hơn để phù hợp với môi trường bếp)

## Đăng nhập

Nhân viên đăng nhập tại `/admin/login` với:
- Email: `employee@restaurant.com`
- Password: `emp123`

Sau khi đăng nhập thành công, hệ thống sẽ tự động chuyển đến `/employee/orders`.
