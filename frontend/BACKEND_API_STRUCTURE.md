# Backend API Structure - Restaurant Table Ordering System

## Tổng quan

Hệ thống sử dụng Java Spring Boot backend với cấu trúc RESTful API. Tất cả response đều theo format chuẩn:

```json
{
  "success": boolean,
  "data": object | array,
  "message": string
}
```

---

## 1. Authentication APIs

### 1.1 Admin/Employee Login
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "user": {
      "id": 1,
      "email": "admin@restaurant.com",
      "fullName": "Admin User",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00"
    }
  },
  "message": "Đăng nhập thành công"
}
```

**User Roles**:
- `ADMIN`: Quản trị viên - truy cập đầy đủ
- `EMPLOYEE`: Nhân viên - truy cập trang nhân viên

### 1.2 Customer Login
**Endpoint**: `POST /api/customers/login`

**Request Body**:
```json
{
  "phone": "0123456789",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "message": "Đăng nhập thành công"
}
```

### 1.3 Customer Registration
**Endpoint**: `POST /api/customers/register`

**Request Body**:
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 5,
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:00:00",
    "message": "Đăng ký thành công"
  },
  "message": "Đăng ký thành công"
}
```

---

## 2. Dish APIs

### 2.1 Get All Dishes
**Endpoint**: `GET /api/dishes`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Phở bò",
      "price": 50000,
      "description": "Phở bò truyền thống Hà Nội",
      "image": "https://example.com/images/pho-bo.jpg",
      "category": {
        "id": 1,
        "name": "Món chính",
        "description": "Các món ăn chính"
      },
      "status": "AVAILABLE",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-15T10:00:00"
    }
  ],
  "message": "Success"
}
```

**Dish Status**:
- `AVAILABLE`: Còn món
- `SOLD_OUT`: Hết món

### 2.2 Get Dish by ID
**Endpoint**: `GET /api/dishes/{id}`

**Response**: Same structure as single dish object above

### 2.3 Get Dishes by Category
**Endpoint**: `GET /api/dishes/category/{categoryId}`

**Response**: Array of dishes in that category

### 2.4 Search Dishes
**Endpoint**: `GET /api/dishes/search?name=phở`

**Response**: Array of dishes matching search

### 2.5 Create Dish (Admin only)
**Endpoint**: `POST /api/dishes`

**Request Body**:
```json
{
  "name": "Bún chả",
  "price": 45000,
  "description": "Bún chả Hà Nội",
  "image": "url",
  "categoryId": 1,
  "status": "AVAILABLE"
}
```

### 2.6 Update Dish Status (Admin/Employee)
**Endpoint**: `PATCH /api/dishes/{id}/status?status=SOLD_OUT`

---

## 3. Category APIs

### 3.1 Get All Categories
**Endpoint**: `GET /api/categories`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Món chính",
      "description": "Các món ăn chính",
      "createdAt": "2024-01-01T00:00:00"
    },
    {
      "id": 2,
      "name": "Đồ uống",
      "description": "Các loại nước uống",
      "createdAt": "2024-01-01T00:00:00"
    }
  ],
  "message": "Success"
}
```

---

## 4. Table APIs

### 4.1 Get All Tables
**Endpoint**: `GET /api/tables`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableNumber": 5,
      "capacity": 4,
      "area": "Tầng 1",
      "status": "OCCUPIED",
      "qrCode": "TABLE_5_QR_CODE",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "message": "Success"
}
```

**Table Status**:
- `AVAILABLE`: Trống
- `OCCUPIED`: Có khách
- `RESERVED`: Đã đặt
- `MAINTENANCE`: Bảo trì

### 4.2 Get Tables by Status
**Endpoint**: `GET /api/tables/status/{status}`

### 4.3 Update Table Status
**Endpoint**: `PATCH /api/tables/{id}/status?status=OCCUPIED`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tableNumber": 5,
    "status": "OCCUPIED",
    ...
  },
  "message": "Cập nhật trạng thái bàn thành công"
}
```

---

## 5. Invoice APIs

### 5.1 Get All Invoices
**Endpoint**: `GET /api/invoices`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tableId": 5,
      "customerId": 10,
      "status": "PENDING",
      "totalAmount": 250000,
      "notes": "",
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "message": "Success"
}
```

**Invoice Status**:
- `PENDING`: Chờ xử lý
- `CONFIRMED`: Đã xác nhận
- `PREPARING`: Đang chuẩn bị
- `READY`: Sẵn sàng
- `COMPLETED`: Hoàn thành
- `PAID`: Đã thanh toán
- `CANCELLED`: Đã hủy

### 5.2 Get Active Invoice by Table Number
**Endpoint**: `GET /api/invoices/table-number/{tableNumber}/active`

**Response**:
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
    "items": [
      {
        "id": 1,
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
        "createdAt": "2024-01-15T10:00:00"
      }
    ]
  },
  "message": "Success"
}
```

### 5.3 Create Invoice with Items
**Endpoint**: `POST /api/invoices/create-with-items`

**Request Body**:
```json
{
  "tableId": 5,
  "items": [
    {
      "dishId": 10,
      "quantity": 2,
      "notes": "Không hành"
    },
    {
      "dishId": 15,
      "quantity": 1,
      "notes": ""
    }
  ]
}
```

**Response**: Returns created invoice with all items

### 5.4 Update Invoice Status
**Endpoint**: `PATCH /api/invoices/{id}/status?status=PAID`

---

## 6. Invoice Item APIs

### 6.1 Get Invoice Items by Invoice ID
**Endpoint**: `GET /api/invoice-items/invoice/{invoiceId}`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoiceId": 5,
      "dishId": 10,
      "dish": {
        "id": 10,
        "name": "Phở bò",
        "price": 50000,
        "image": "url"
      },
      "quantity": 2,
      "unitPrice": 50000,
      "totalPrice": 100000,
      "status": "PREPARING",
      "notes": "Không hành",
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-01-15T10:30:00"
    }
  ],
  "message": "Success"
}
```

**Invoice Item Status** (cho nhân viên cập nhật):
- `PENDING`: Chờ xử lý
- `PREPARING`: Đang làm
- `READY`: Đã xong
- `SERVED`: Đã phục vụ
- `CANCELLED`: Đã hủy

### 6.2 Update Invoice Item Status
**Endpoint**: `PATCH /api/invoice-items/{id}/status?status=PREPARING`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "PREPARING",
    ...
  },
  "message": "Cập nhật trạng thái món ăn thành công"
}
```

**Use Case**: Nhân viên cập nhật trạng thái món ăn từ màn hình Order Processing hoặc Kitchen

### 6.3 Create Invoice Item
**Endpoint**: `POST /api/invoice-items`

**Request Body**:
```json
{
  "invoiceId": 5,
  "dishId": 10,
  "quantity": 2,
  "notes": "Không hành"
}
```

### 6.4 Update Invoice Item
**Endpoint**: `PUT /api/invoice-items/{id}`

### 6.5 Delete Invoice Item
**Endpoint**: `DELETE /api/invoice-items/{id}`

---

## 7. Payment APIs

### 7.1 Create Payment
**Endpoint**: `POST /api/payments`

**Request Body**:
```json
{
  "invoiceId": 5,
  "paymentMethod": "CASH",
  "amount": 250000
}
```

**Payment Methods**:
- `CASH`: Tiền mặt
- `CREDIT_CARD`: Thẻ tín dụng
- `BANK_TRANSFER`: Chuyển khoản
- `E_WALLET`: Ví điện tử

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "invoiceId": 5,
    "paymentMethod": "CASH",
    "amount": 250000,
    "status": "COMPLETED",
    "transactionId": "TXN123456",
    "paidAt": "2024-01-15T11:00:00"
  },
  "message": "Thanh toán thành công"
}
```

### 7.2 Process Payment
**Endpoint**: `POST /api/payments/process`

---

## 8. User Management APIs (Admin only)

### 8.1 Get All Users
**Endpoint**: `GET /api/users`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@restaurant.com",
      "fullName": "Admin User",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00"
    },
    {
      "id": 2,
      "email": "employee@restaurant.com",
      "fullName": "Employee User",
      "role": "EMPLOYEE",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00"
    }
  ],
  "message": "Success"
}
```

### 8.2 Create User
**Endpoint**: `POST /api/users`

**Request Body**:
```json
{
  "email": "newemployee@restaurant.com",
  "password": "password123",
  "fullName": "New Employee",
  "role": "EMPLOYEE"
}
```

### 8.3 Update User
**Endpoint**: `PUT /api/users/{id}`

### 8.4 Delete User
**Endpoint**: `DELETE /api/users/{id}`

---

## 9. WebSocket Endpoints

### 9.1 Connect to WebSocket
**Endpoint**: `ws://localhost:8080/ws`

### 9.2 Subscribe to Topics
- `/topic/orders` - Nhận thông báo đơn hàng mới
- `/topic/notifications` - Nhận thông báo chung
- `/topic/messages` - Nhận tin nhắn

### 9.3 Send Message
**Topic**: `/app/message`

---

## Error Response Structure

Khi có lỗi, backend trả về:

```json
{
  "success": false,
  "data": null,
  "message": "Thông báo lỗi cụ thể"
}
```

**HTTP Status Codes**:
- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Dữ liệu không hợp lệ
- `401 Unauthorized`: Chưa xác thực
- `403 Forbidden`: Không có quyền
- `404 Not Found`: Không tìm thấy
- `500 Internal Server Error`: Lỗi server

---

## Authentication Headers

Tất cả các API cần authentication phải gửi kèm header:

```
Authorization: Bearer {token}
```

Token được lấy từ response của API login và lưu trong localStorage.

---

## Frontend Integration

Frontend sử dụng Axios instance (`src/api/axiosConfig.js`) để tự động:
1. Thêm Bearer token vào header
2. Xử lý response format chuẩn
3. Xử lý lỗi (401 → redirect login)
4. Log requests/responses trong dev mode

---

## Luồng hoạt động cho Employee

### Scenario 1: Nhân viên cập nhật món ăn
1. Customer đặt món → Invoice Item được tạo với `status: PENDING`
2. Nhân viên xem màn hình `/employee/orders` hoặc `/employee/kitchen`
3. Nhân viên thấy món mới trong cột "Chờ xử lý"
4. Nhân viên click "Bắt đầu" → `PATCH /api/invoice-items/{id}/status?status=PREPARING`
5. Món chuyển sang cột "Đang làm"
6. Sau khi làm xong, click "Hoàn thành" → `status=READY`
7. Món chuyển sang cột "Đã xong"
8. Khi mang món ra, click "Đã mang ra" → `status=SERVED`

### Scenario 2: Nhân viên quản lý bàn
1. Customer đến, nhân viên vào `/employee/tables`
2. Tìm bàn trống (status: AVAILABLE)
3. Click dropdown chọn "Có khách" → `PATCH /api/tables/{id}/status?status=OCCUPIED`
4. Sau khi khách đi, chọn "Trống" → `status=AVAILABLE`

---

## Demo Accounts

### Admin
- Email: `admin@restaurant.com`
- Password: `admin123`
- Role: `ADMIN`

### Employee
- Email: `employee@restaurant.com`
- Password: `emp123`
- Role: `EMPLOYEE`

### Customer
- Phone: `0123456789`
- Password: `password123`
