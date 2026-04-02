# Cấu hình MCP Bridge (Stdio <-> WebSocket)

Tài liệu này hướng dẫn cách sử dụng `mcp_pipe.py` để kết nối các MCP Server nội bộ với các dịch vụ WebSocket bên ngoài (ví dụ: các Agent AI đám mây).

## ⚙️ Cách hoạt động
`mcp_pipe.py` hoạt động như một "đường ống" truyền dẫn:
1.  Kết nối tới một WebSocket Endpoint.
2.  Khởi chạy các MCP Server cục bộ được định nghĩa trong `mcp_config.json`.
3.  Chuyển tiếp các thông điệp giữa WebSocket và Stdio của các server đó.

## 📝 Cấu hình `mcp_config.json`

File này chứa danh sách các server bạn muốn chạy. Ví dụ:

```json
{
  "mcpServers": {
    "restaurant-mcp": {
      "type": "stdio",
      "command": "python",
      "args": ["restaurant_mcp.py"]
    }
  }
}
```

## 🚀 Cách chạy Bridge

1.  **Thiết lập biến môi trường** (Nếu backend WebSocket yêu cầu):
    *   Windows (PowerShell): `$env:MCP_ENDPOINT = "wss://api.example.com/mcp?token=your_token"`
    *   Linux/macOS: `export MCP_ENDPOINT="wss://api.example.com/mcp?token=your_token"`

2.  **Khởi chạy pipe**:
    ```bash
    python mcp_pipe.py
    ```

`mcp_pipe.py` sẽ tự động đọc `mcp_config.json` và khởi chạy tất cả các server được bật.

## 🛠 Xử lý sự cố
*   **Lỗi kết nối**: Kiểm tra internet và tính chính xác của `MCP_ENDPOINT`.
*   **Lỗi server con**: Chạy thử `python restaurant_mcp.py` để đảm bảo code Python không có lỗi trước khi chạy qua bridge.
*   **Lỗi Backend**: Đảm bảo server Node.js đang chạy tại `http://localhost:8080`.
