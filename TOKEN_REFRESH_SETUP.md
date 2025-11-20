# Auto Token Refresh Implementation

## 📋 Tóm tắt thay đổi

Tôi đã thêm tính năng **tự động refresh token** khi hết hạn, giúp người dùng không bị logout bất ngờ.

---

## 🆕 Files được tạo

### 1. **TokenManager.js** (`d:\LC-Store\javascript\TokenManager.js`)

File quản lý token trung tâm với 3 hàm chính:

- **`FetchWithTokenRefresh(url, options)`**

  - Wrapper cho fetch() với tự động refresh token
  - Kiểm tra token hết hạn TRƯỚC khi gọi API
  - Nếu 401 được trả về → retry với token mới
  - Nếu vẫn thất bại → logout tự động

- **`IsTokenExpired(token)`**

  - Giải mã JWT token
  - So sánh expiration time với thời gian hiện tại
  - Return true nếu hết hạn

- **`RefreshAccessToken()`**
  - Gọi `POST /api/v1/auth/refresh` endpoint
  - Lưu token mới vào localStorage
  - Xử lý 401 → logout
  - Xử lý error → logout

---

## 📝 Files được cập nhật

### 1. **Admin.js** (d:\LC-Store\javascript\Admin.js)

**Thêm:**

```javascript
import {
  FetchWithTokenRefresh,
  IsTokenExpired,
  RefreshAccessToken,
} from "./TokenManager.js";
```

**Thay đổi các hàm API:**

- `LoadDanhSachUser()` - Dùng `FetchWithTokenRefresh()` thay vì `fetch()`
- `LoadUserDetail()` - Dùng `FetchWithTokenRefresh()`
- `SetUserAdmin()` - Dùng `FetchWithTokenRefresh()`
- `DeleteUser()` - Dùng `FetchWithTokenRefresh()`
- `UpdateUser()` - Dùng `FetchWithTokenRefresh()`

**Lợi ích:**

- Tất cả API calls tự động refresh token nếu cần
- Không cần kiểm tra 401 thủ công
- Retry tự động được xử lý

### 2. **TrangAdmin.html** (d:\LC-Store\html\TrangAdmin.html)

**Thay đổi:**

```html
<!-- Trước: -->
<script src="/javascript/Admin.js"></script>

<!-- Sau: -->
<script type="module" src="/javascript/Admin.js"></script>
```

Điều này cho phép sử dụng ES6 import/export.

---

## 🆕 Files phụ trợ

### 1. **TokenManagerTest.html** (d:\LC-Store\html\TokenManagerTest.html)

- Trang test để kiểm tra TokenManager
- Kiểm tra token expiration
- Test endpoint refresh
- Decode token payload
- URL: `http://127.0.0.1:5500/html/TokenManagerTest.html`

### 2. **BACKEND_SETUP.md** (d:\LC-Store\BACKEND_SETUP.md)

- Hướng dẫn setup backend
- Yêu cầu endpoint refresh token
- Format request/response
- Ví dụ Spring Boot implementation

---

## 🔄 Luồng hoạt động

```
1. User click button → gọi API (e.g., LoadDanhSachUser)
   ↓
2. FetchWithTokenRefresh() kiểm tra token
   ↓
3. IsTokenExpired() ?
   ├─ YES → Gọi RefreshAccessToken()
   │       → Lưu token mới
   │       → Tiếp tục API call
   └─ NO → Tiếp tục ngay
   ↓
4. Gửi API request với Bearer token
   ↓
5. Response 401 ?
   ├─ YES → Retry kịch bản 1: Refresh token + retry
   │       → Nếu vẫn 401 → Logout
   └─ NO → Trả về response
```

---

## ✅ Cách test

### 1. Test TokenManager (không cần backend)

1. Mở `http://127.0.0.1:5500/html/TokenManagerTest.html`
2. Click "Setup Tokens" để tạo sample tokens
3. Click "Test IsTokenExpired" để kiểm tra
4. Xem console.log để theo dõi

### 2. Test với Admin Dashboard (cần backend)

1. Login vào TrangAdmin.html
2. Mở DevTools (F12) → Console
3. Xem logs:
   - "Fetching: http://localhost:8080/api/v1/users?page=0"
   - "Response status: 200" hoặc "401"
   - Nếu 401 → sẽ thấy "Attempting to refresh token..."
4. Click vào user → xem refresh token tự động xảy ra

---

## ⚙️ Yêu cầu Backend

**QUAN TRỌNG:** Backend PHẢI có endpoint này:

```
POST /api/v1/auth/refresh
Content-Type: application/json
Authorization: Bearer {refreshToken}

Request:
{
  "refreshToken": "string"
}

Response (200):
{
  "data": {
    "accessToken": "string",
    "refreshToken": "string" (optional)
  }
}

Response (401):
{
  "message": "Invalid refresh token"
}
```

---

## 🐛 Debugging

### Xem logs trong Console:

```javascript
// Khi token refresh:
console.log("Attempting to refresh token...");
console.log("Token refreshed successfully");

// Khi error:
console.log("Error refreshing token:", err);

// Khi 401:
console.log("Nhận 401, đang thử refresh token...");
```

### Kiểm tra localStorage:

```javascript
// F12 Console:
localStorage.getItem("accessToken");
localStorage.getItem("refreshToken");
```

### Decode token:

```javascript
// F12 Console:
JSON.parse(atob(localStorage.getItem("accessToken").split(".")[1]));
```

---

## 🔒 Security Notes

1. **Token expiration**: Đảm bảo:

   - Access Token: 15 min - 1 hour
   - Refresh Token: 1 - 30 days

2. **HTTPS**: Trong production, LUÔN dùng HTTPS

3. **HttpOnly cookies** (Optional):

   - Có thể lưu tokens trong HttpOnly cookies thay vì localStorage
   - Bảo vệ tốt hơn khỏi XSS attacks

4. **Token rotation**:
   - Có thể rotate refresh token mỗi lần refresh
   - Prevent token reuse attacks

---

## 🎯 Kết quả

✅ Token tự động refresh khi hết hạn
✅ Retry tự động khi API trả về 401
✅ Logout tự động khi refresh thất bại
✅ Không cần điều chỉnh mã từng API call
✅ Xử lý error centralized

---

## 📞 Ghi chú

Nếu backend chưa có endpoint refresh, hãy:

1. Thêm endpoint `/api/v1/auth/refresh` vào backend
2. Validate refreshToken
3. Trả về accessToken mới (và refreshToken nếu muốn rotate)
4. Trả về 401 nếu token không hợp lệ

Chi tiết xem trong **BACKEND_SETUP.md**
