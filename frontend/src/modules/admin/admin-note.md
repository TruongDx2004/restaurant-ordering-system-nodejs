# Admin Panel - Desktop Only

## Thiết kế cho Desktop

Admin panel được thiết kế **chuyên dụng cho desktop** (≥1024px):

### Độ phân giải khuyến nghị:
- ✅ **1920x1080** (Full HD) - Tối ưu nhất
- ✅ **1600x900** - Tốt
- ✅ **1366x768** - Tối thiểu
- ⚠️ **<1024px** - Hạn chế (chỉ hỗ trợ cơ bản)

### Tính năng Desktop:
- Sidebar collapsible (280px ↔ 80px)
- Multi-column stats grid
- Rich data tables
- Complex forms
- Charts & graphs
- Keyboard shortcuts (future)

### Mobile/Tablet:
- ⚠️ **Không tối ưu** cho mobile
- Hiển thị warning message khi < 768px
- Sidebar chuyển thành drawer trên tablet
- Chức năng hạn chế

### Lưu ý:
- Employee có thể dùng tablet cho một số tác vụ đơn giản
- Admin cần desktop để quản lý hiệu quả
- Customer pages vẫn là mobile-first (như đã làm)

## So sánh:

| Feature | Customer Pages | Admin Panel |
|---------|---------------|-------------|
| Platform | Mobile-first | Desktop-only |
| Min width | 320px | 1024px |
| Responsive | Full mobile | Desktop + warning |
| Primary device | Smartphone | Desktop/Laptop |
| Layout | Single column | Multi-column |
