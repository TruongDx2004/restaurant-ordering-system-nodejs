# Customer Home Module

## 📋 Tổng quan

Module Customer Home đã được chuyển đổi hoàn toàn từ HTML/JavaScript sang React. Module này cho phép khách hàng:

- ✅ Xem danh sách món ăn
- ✅ Lọc món theo danh mục
- ✅ Tìm kiếm món ăn
- ✅ Xem banner quảng cáo
- ✅ Điều hướng đến trang chi tiết món ăn
- ✅ Truy cập giỏ hàng

## 🏗️ Cấu trúc

```
customer/home/
├── index.jsx                    # Main component
├── index.module.css             # Main styles
├── components/                  # UI Components
│   ├── Header/                  # Header với search & cart
│   ├── Banner/                  # Hero banner & slider
│   ├── CategoryNav/             # Category navigation
│   ├── DishList/                # Dish grid display
│   │   ├── DishCard.jsx        # Individual dish card
│   │   └── DishList.jsx        # List container
│   ├── Footer/                  # Footer
│   └── index.js                 # Components export
├── hooks/                       # Custom React Hooks
│   ├── useCategories.js        # Fetch categories
│   ├── useDishes.js            # Fetch dishes
│   ├── useSearch.js            # Search functionality
│   ├── useDishDetail.js        # Fetch dish detail
│   └── index.js                 # Hooks export
├── utils/                       # Utility functions
│   ├── helpers.js              # Helper functions
│   └── index.js                # Utils export
└── README.md                   # This file
```

## 🔌 API Integration

Module này sử dụng các API endpoints sau:

### Categories
- `GET /api/categories` - Lấy tất cả categories

### Dishes
- `GET /api/dishes` - Lấy tất cả dishes
- `GET /api/dishes/status/AVAILABLE` - Lấy dishes có sẵn
- `GET /api/dishes/category/{categoryId}` - Lấy dishes theo category
- `GET /api/dishes/search?name={query}` - Tìm kiếm dishes

## 🚀 Sử dụng

### 1. Import Component

```jsx
import { CustomerHome } from './modules/customer/home';

// Trong router
<Route path="/customer/home" element={<CustomerHome />} />
```

### 2. Custom Hooks

```jsx
import { useCategories, useDishes, useSearch } from './modules/customer/home/hooks';

function MyComponent() {
  const { categories, loading, error } = useCategories();
  const { dishes } = useDishes(categoryId);
  const { search, searchResults } = useSearch();
  
  // Your code here
}
```

### 3. Utility Functions

```jsx
import { formatPrice, getImageUrl, isDishAvailable } from './modules/customer/home/utils';

const priceText = formatPrice(50000); // "50.000 ₫"
const imageUrl = getImageUrl('/storage/dish/pho.jpg');
const available = isDishAvailable(dish);
```

## 🎨 Styling

Module sử dụng **CSS Modules** để tránh conflict. Mỗi component có file `.module.css` riêng.

### Customization

Để thay đổi màu chính, edit các variables:

```css
/* Trong component CSS files */
--primary-color: #ff6b6b;
--text-color: #333;
--bg-color: #f9f9f9;
```

## 📱 Responsive Design

Module được tối ưu cho:
- 📱 Mobile: 320px - 767px
- 📱 Tablet: 768px - 1023px
- 💻 Desktop: 1024px+

## ⚡ Performance

- **Lazy loading images**: Sử dụng `loading="lazy"`
- **Debounced search**: Search delay 300ms
- **Memoization**: Components được optimize với React.memo (nếu cần)
- **Code splitting**: Ready for React.lazy

## 🔧 Dependencies

### Required
- `react` >= 18.0.0
- `react-router-dom` >= 6.0.0
- `axios` >= 1.0.0

### Optional
- `@tanstack/react-query` - For better data fetching (recommended)

## 📝 Environment Variables

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
VITE_NODE_ENV=development
```

## 🐛 Troubleshooting

### Lỗi: "Cannot find module axios"
```bash
npm install axios
```

### Lỗi: Images không hiển thị
- Kiểm tra `VITE_API_BASE_URL` trong `.env`
- Kiểm tra image path trong backend
- Mở console để xem error logs

### Lỗi: API calls failed
- Kiểm tra backend đang chạy tại `http://localhost:8080`
- Kiểm tra CORS configuration trong backend
- Check Network tab trong DevTools

## 🔄 Migration từ HTML

### Chức năng đã migrate:

| HTML Feature | React Component | Status |
|-------------|-----------------|--------|
| index.html | CustomerHome | ✅ Done |
| Header search | Header component | ✅ Done |
| Category menu | CategoryNav | ✅ Done |
| Dish grid | DishList + DishCard | ✅ Done |
| Banner slider | Banner | ✅ Done |
| Footer | Footer | ✅ Done |
| Search functionality | useSearch hook | ✅ Done |
| API integration | dishApi, categoryApi | ✅ Done |

### Chức năng chưa migrate:
- Food detail page (food.html) - Cần tạo riêng
- Cart functionality - Cần tạo riêng
- WebSocket real-time - Cần implement

## 🎯 Next Steps

1. **Tạo Dish Detail Page**
   - Component hiển thị chi tiết món ăn
   - Add to cart functionality
   - Quantity controls

2. **Tạo Cart Module**
   - Shopping cart management
   - Checkout flow

3. **Add State Management**
   - Zustand hoặc Redux
   - Global cart state
   - User authentication state

4. **Implement WebSocket**
   - Real-time order updates
   - Live notifications

5. **Add React Router**
   - Routing giữa các pages
   - Protected routes

## 📚 Code Examples

### Example: Sử dụng CustomerHome

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerHome } from './modules/customer/home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerHome />} />
        <Route path="/customer/home" element={<CustomerHome />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Example: Custom Search Implementation

```jsx
import { useSearch } from './modules/customer/home/hooks';

function SearchExample() {
  const { search, searchResults, searching } = useSearch();
  
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    search(query);
  };
  
  return (
    <div>
      <form onSubmit={handleSearch}>
        <input name="search" type="text" />
        <button>Search</button>
      </form>
      
      {searching && <p>Searching...</p>}
      
      <div>
        {searchResults.map(dish => (
          <div key={dish.id}>{dish.name}</div>
        ))}
      </div>
    </div>
  );
}
```

## 👥 Team

- **Developer**: HUTECH 22DTHH4
- **Backend**: Spring Boot + MySQL
- **Frontend**: React + Vite

## 📄 License

Copyright © 2025 Restaurant Table Ordering System
