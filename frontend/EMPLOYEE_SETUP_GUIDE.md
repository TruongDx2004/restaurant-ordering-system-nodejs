# 🛠️ Employee Module Setup & Troubleshooting Guide

## ✅ Đã Fix

### 1. Lỗi Routing
**Vấn đề**: EmployeeLayout không hiển thị nội dung
**Giải pháp**: Thay đổi từ wrapper component sang nested routes với `<Outlet />`

```jsx
// Before (SAI)
<Route path="/employee/orders" element={<EmployeeLayout><OrderProcessing /></EmployeeLayout>} />

// After (ĐÚNG)
<Route path="/employee" element={<EmployeeLayout />}>
  <Route path="orders" element={<OrderProcessing />} />
</Route>
```

### 2. Lỗi Promise.all Syntax
**Vấn đề**: `console.log()` nằm trong array của Promise.all
**Giải pháp**: Di chuyển console.log ra ngoài

```jsx
// Before (SAI)
const [a, b] = await Promise.all([
  apiCall(),
  console.log('test'),
  apiCall2()
]);

// After (ĐÚNG)
console.log('test');
const [a, b] = await Promise.all([
  apiCall(),
  apiCall2()
]);
```

### 3. API Endpoints
**Vấn đề**: Thiếu `UPDATE_STATUS` endpoint
**Giải pháp**: Thêm vào `apiEndpoints.js`

```javascript
export const INVOICE_ITEM_ENDPOINTS = {
  // ...
  UPDATE_STATUS: (id) => `${API_BASE.INVOICE_ITEMS}/${id}/status`,
};
```

## 📋 Kiểm tra trước khi test

### 1. Backend đang chạy?
- [ ] Java Spring Boot backend đang chạy ở `http://localhost:8080`
- [ ] Có thể truy cập `http://localhost:8080/api/tables`
- [ ] CORS đã được cấu hình cho phép `http://localhost:5175`

### 2. Frontend dev server đang chạy?
- [ ] Vite dev server đang chạy ở `http://localhost:5175`
- [ ] File `.env` có đúng `VITE_API_BASE_URL=http://localhost:8080/api`
- [ ] Không có lỗi compile trong terminal

### 3. Database có dữ liệu?
- [ ] Có tables trong database
- [ ] Có dishes trong database
- [ ] Có ít nhất 1 user với role=EMPLOYEE

## 🧪 Test Backend Connection

Đã tạo file `tmp_rovodev_simple_test.html` để test API:
1. Mở file này trong browser
2. Click các nút "Test GET /tables", etc.
3. Nếu thấy lỗi → Backend chưa chạy hoặc CORS chưa config

## 🚀 Cách test Employee Module

### Bước 1: Đăng nhập
```
URL: http://localhost:5175/admin/login
Email: employee@restaurant.com
Password: emp123
```

### Bước 2: Sau khi login
- Tự động redirect đến `/employee/orders`
- Sidebar bên trái có 3 menu items
- Nếu thấy "Đang tải dữ liệu..." → Đang gọi API
- Nếu thấy "Không thể tải dữ liệu" → Backend có vấn đề

### Bước 3: Kiểm tra DevTools
Mở Console (F12) và kiểm tra:

**✅ Tốt - không có lỗi:**
```
Fetching orders and tables...
```

**❌ Lỗi - Backend không chạy:**
```
GET http://localhost:8080/api/invoices net::ERR_CONNECTION_REFUSED
```

**❌ Lỗi - CORS:**
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**❌ Lỗi - 404:**
```
GET http://localhost:8080/api/invoices 404 (Not Found)
```

## 🐛 Common Issues & Solutions

### Issue 1: Trang trắng không có gì
**Nguyên nhân**: 
- Component đang ở trạng thái loading
- API call đang pending
- CSS không load

**Giải pháp**:
1. Mở DevTools Console → xem error
2. Mở DevTools Network tab → xem API calls có fail không
3. Check backend có chạy không: `curl http://localhost:8080/api/tables`

### Issue 2: "Không thể tải dữ liệu"
**Nguyên nhân**: Backend API trả về error hoặc không response

**Giải pháp**:
1. Kiểm tra backend logs
2. Verify endpoints exist:
   - `GET /api/invoices`
   - `GET /api/tables`
   - `GET /api/invoice-items/invoice/{id}`
3. Test bằng Postman hoặc curl

### Issue 3: Sidebar hiển thị nhưng content trống
**Nguyên nhân**: Outlet không render hoặc nested route sai

**Giải pháp**:
- Check `EmployeeLayout.jsx` có `<Outlet />` không
- Check `App.jsx` routes structure đúng chưa

### Issue 4: Icons không hiển thị
**Nguyên nhân**: FontAwesome chưa load

**Giải pháp**:
- Check `index.html` có CDN link FontAwesome
- Check Network tab xem có load thành công không

## 📊 Expected Behavior

### Order Processing Page (`/employee/orders`)
**Khi backend có dữ liệu:**
- Header: "Xử lý đơn hàng"
- 4 stat cards với số lượng món theo status
- Filter dropdowns
- Danh sách orders với items
- Mỗi item có dropdown để chuyển status

**Khi backend không có orders:**
- Header: "Xử lý đơn hàng"
- 4 stat cards với số 0
- Empty state: "Không có đơn hàng nào"

**Khi backend lỗi:**
- Red error banner: "Không thể tải dữ liệu"

### Table Management Page (`/employee/tables`)
**Khi backend có dữ liệu:**
- Header: "Quản lý bàn"
- Stats cards với số bàn theo status
- Grid of table cards
- Mỗi card có dropdown để chuyển status

**Khi backend không có tables:**
- Empty state: "Không tìm thấy bàn nào"

### Kitchen View Page (`/employee/kitchen`)
**Khi có món:**
- 3 columns: Chờ xử lý | Đang làm | Đã xong
- Live indicator (red dot pulsing)
- Cards có nút "Bắt đầu", "Hoàn thành", "Đã mang ra"

**Khi không có món:**
- Empty states trong mỗi column

## 🔍 Debug Checklist

Khi gặp vấn đề, làm theo thứ tự:

1. **Check Terminal (Backend)**
   ```bash
   # Có thấy Spring Boot startup logs?
   # Có error khi start không?
   # Port 8080 có đang được dùng không?
   ```

2. **Check Terminal (Frontend)**
   ```bash
   # Vite server có chạy không?
   # Có lỗi compile không?
   # Port 5175 có available không?
   ```

3. **Check Browser Console**
   ```javascript
   // Có lỗi màu đỏ không?
   // Network calls có fail không?
   // Component có render không?
   ```

4. **Check Network Tab**
   ```
   # API calls có status 200 không?
   # Response có data không?
   # Có CORS error không?
   ```

5. **Check Elements Tab**
   ```html
   <!-- HTML có render không? -->
   <!-- CSS classes có đúng không? -->
   <!-- Sidebar có hiện không? -->
   ```

## 📝 Backend Requirements

Để employee module hoạt động, backend cần có:

### Required Endpoints:
```
GET    /api/invoices
GET    /api/tables
GET    /api/invoice-items/invoice/{invoiceId}
PATCH  /api/invoice-items/{id}/status?status=PREPARING
PATCH  /api/tables/{id}/status?status=OCCUPIED
```

### Required Response Format:
```json
{
  "success": true,
  "data": [...],
  "message": "Success"
}
```

### CORS Configuration:
```java
@CrossOrigin(origins = "http://localhost:5175")
```

## 🎯 Next Steps

Nếu vẫn không hiển thị:

1. **Tạo mock data** để test frontend riêng
2. **Thêm more detailed error logging** trong các component
3. **Kiểm tra database** có dữ liệu không
4. **Check user permissions** - employee có quyền truy cập API không?

## 📞 Contact

Nếu vẫn gặp vấn đề, cung cấp:
- Screenshot của browser console (F12)
- Screenshot của Network tab
- Backend console logs
- Frontend terminal logs
