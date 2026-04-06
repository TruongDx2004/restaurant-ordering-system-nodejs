from fastmcp import FastMCP
import requests
import json
import logging
import sys
from datetime import datetime

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('RestaurantMCP')

# Fix UTF-8 encoding cho Windows
if sys.platform == 'win32':
    sys.stderr.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')

# Khởi tạo MCP Server
mcp = FastMCP("Restaurant-Ordering-System")

# Cấu hình Backend
BACKEND_URL = "http://localhost:8080/api"

@mcp.tool()
def get_categories() -> str:
    """Lấy danh sách các danh mục món ăn (ví dụ: Khai vị, Món chính, Đồ uống)."""
    try:
        response = requests.get(f"{BACKEND_URL}/categories", timeout=10)
        data = response.json()
        if data.get("success"):
            return json.dumps(data.get("data"), ensure_ascii=False)
        return "Không thể lấy danh sách danh mục."
    except Exception as e:
        return f"Lỗi kết nối Backend: {str(e)}"

@mcp.tool()
def get_dishes(category_id: int = None) -> str:
    """
    Lấy danh sách món ăn. 
    Nếu cung cấp category_id, sẽ chỉ lấy các món trong danh mục đó.
    """
    try:
        url = f"{BACKEND_URL}/dishes"
        if category_id:
            url = f"{BACKEND_URL}/dishes/category/{category_id}"
        
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get("success"):
            dishes = data.get("data")
            # Chỉ trả về các thông tin cần thiết để tiết kiệm token
            simplified_dishes = [
                {
                    "id": d["id"],
                    "name": d["name"],
                    "price": d["price"],
                    "status": d["status"],
                    "category": d.get("category", {}).get("name")
                }
                for d in dishes if d["status"] == "AVAILABLE"
            ]
            return json.dumps(simplified_dishes, ensure_ascii=False)
        return "Không thể lấy danh sách món ăn."
    except Exception as e:
        return f"Lỗi kết nối Backend: {str(e)}"

@mcp.tool()
def get_dish_detail(dish_id: int) -> str:
    """Lấy thông tin chi tiết của một món ăn cụ thể bằng ID."""
    try:
        response = requests.get(f"{BACKEND_URL}/dishes/{dish_id}", timeout=10)
        data = response.json()
        if data.get("success"):
            return json.dumps(data.get("data"), ensure_ascii=False)
        return f"Không tìm thấy món ăn với ID {dish_id}."
    except Exception as e:
        return f"Lỗi: {str(e)}"

@mcp.tool()
def place_order(table_id: int, items_json: str) -> str:
    """
    Đặt món cho một bàn. 
    items_json: Một chuỗi JSON mảng các đối tượng chứa dishId, quantity và note.
    Ví dụ items_json: '[{"dishId": 1, "quantity": 2, "note": "Không cay"}, {"dishId": 3, "quantity": 1}]'
    """
    try:
        items = json.loads(items_json)
        payload = {
            "tableId": table_id,
            "items": items
        }
        
        response = requests.post(
            f"{BACKEND_URL}/invoices/create-with-items",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        data = response.json()
        if data.get("success"):
            return f"Đặt món thành công! Mã hóa đơn: {data['data']['id']}. Tổng tiền: {data['data']['totalAmount']}đ"
        return f"Đặt món thất bại: {data.get('message')}"
    except json.JSONDecodeError:
        return "Lỗi: Định dạng items_json không hợp lệ. Phải là một mảng JSON."
    except Exception as e:
        return f"Lỗi hệ thống: {str(e)}"

@mcp.tool()
def get_table_status() -> str:
    """Lấy danh sách tất cả các bàn và trạng thái hiện tại của chúng."""
    try:
        response = requests.get(f"{BACKEND_URL}/tables", timeout=10)
        data = response.json()
        if data.get("success"):
            return json.dumps(data.get("data"), ensure_ascii=False)
        return "Không thể lấy trạng thái bàn."
    except Exception as e:
        return f"Lỗi: {str(e)}"

@mcp.tool()
def call_waiter(table_id: int, reason: str = "Khách hàng cần hỗ trợ") -> str:
    """Gửi yêu cầu gọi nhân viên đến một bàn cụ thể."""
    try:
        payload = {
            "tableId": table_id,
            "content": reason,
            "sender": "CUSTOMER",
            "messageType": "CALL_WAITER"
        }
        # Sử dụng API messages mới đã tái cấu trúc
        response = requests.post(f"{BACKEND_URL}/messages", json=payload, timeout=10)
        data = response.json()
        if data.get("success"):
            return f"Đã gửi yêu cầu gọi nhân viên cho bàn {table_id}."
        return "Không thể gửi yêu cầu gọi nhân viên."
    except Exception as e:
        return f"Lỗi: {str(e)}"

if __name__ == "__main__":
    mcp.run(transport="stdio")
