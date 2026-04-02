# Restaurant MCP Server

Đây là MCP (Model Context Protocol) Server cho hệ thống quản lý đặt món nhà hàng. MCP Server này cho phép các mô hình AI (như Claude Desktop, Gemini CLI) tương tác trực tiếp với Backend của nhà hàng để thực hiện các nghiệp vụ như lấy menu, đặt món, gọi nhân viên.

## 🚀 Tính năng chính

Server cung cấp các công cụ (tools) sau:

1.  **get_categories**: Lấy danh sách danh mục món ăn.
2.  **get_dishes**: Lấy danh sách các món ăn đang sẵn có (AVAILABLE).
3.  **get_dish_detail**: Xem chi tiết một món ăn cụ thể.
4.  **place_order**: Thực hiện đặt món cho một bàn (thông qua mảng JSON).
5.  **get_table_status**: Kiểm tra trạng thái toàn bộ các bàn trong nhà hàng.
6.  **call_waiter**: Gửi yêu cầu hỗ trợ từ khách hàng đến nhân viên.

## 🛠 Cài đặt & Chạy

### 1. Yêu cầu hệ thống
*   Python 3.10 trở lên.
*   Backend Node.js đang chạy tại `http://localhost:8080`.

### 2. Cài đặt thư viện
Chạy lệnh sau tại thư mục `mcp`:
```bash
pip install -r requirements.txt
```

### 3. Chạy server qua pipe
```bash
python mcp_pipe.py
```

### 4. Kết nối với External Clients (Claude Desktop, v.v.)
Sử dụng `mcp_pipe.py` nếu bạn cần kết nối qua WebSocket hoặc cấu hình trực tiếp đường dẫn `restaurant_mcp.py` vào file config của client.

## 📁 Cấu trúc tệp tin
*   `restaurant_mcp.py`: Mã nguồn chính của MCP Server (đã tối ưu hóa).
*   `mcp_config.json`: Cấu hình danh sách các MCP Server.
*   `mcp_pipe.py`: Cầu nối (Bridge) giữa Stdio và WebSocket.
*   `requirements.txt`: Danh sách các thư viện Python cần thiết.

---
**Lưu ý**: Đảm bảo Backend đã được khởi chạy và các endpoint API khớp với cấu hình trong `restaurant_mcp.py`.
