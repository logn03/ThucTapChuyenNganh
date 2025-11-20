# Backend Setup - Token Refresh Endpoint

## Yêu cầu cho Frontend Token Auto-Refresh

Frontend của bạn hiện tại đang sử dụng `TokenManager.js` để tự động refresh token khi hết hạn.

### 1. Endpoint Refresh Token cần thiết

Frontend mong đợi endpoint sau:

```
POST /api/v1/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Response (Success - 200):**

```json
{
  "data": {
    "accessToken": "string",
    "refreshToken": "string" (tuỳ chọn, nếu backend refresh cả refreshToken)
  }
}
```

hoặc:

```json
{
  "accessToken": "string",
  "refreshToken": "string" (tuỳ chọn)
}
```

**Response (Unauthorized - 401):**

- Nếu refreshToken không hợp lệ hoặc hết hạn
- Frontend sẽ xóa tokens và chuyển hướng về trang login

---

## 2. Cách TokenManager hoạt động

### Token Expiration Check

- Trước mỗi API call, `TokenManager` kiểm tra xem `accessToken` có hết hạn không
- Nếu hết hạn → gọi refresh endpoint
- Nếu refresh thành công → dùng token mới
- Nếu refresh thất bại (401) → logout user tự động

### Auto-Retry Logic

- Khi API trả về 401:
  1. Gọi endpoint refresh
  2. Retry request gốc với token mới
  3. Nếu retry vẫn 401 → logout

---

## 3. Sử dụng trong Frontend

### Method 1: FetchWithTokenRefresh (Recommended)

```javascript
import { FetchWithTokenRefresh } from "./TokenManager.js";

// Tự động refresh token nếu cần
const response = await FetchWithTokenRefresh("/api/v1/users", {
  method: "GET",
});
```

### Method 2: Check Token Manually

```javascript
import { IsTokenExpired, RefreshAccessToken } from "./TokenManager.js";

const token = localStorage.getItem("accessToken");
if (IsTokenExpired(token)) {
  const newToken = await RefreshAccessToken();
  // Sử dụng newToken
}
```

---

## 4. Backend Implementation Example (Spring Boot)

```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
    String refreshToken = request.get("refreshToken");

    if (jwtService.validateToken(refreshToken)) {
        String username = jwtService.extractUsername(refreshToken);
        String newAccessToken = jwtService.generateAccessToken(username);
        String newRefreshToken = jwtService.generateRefreshToken(username);

        return ResponseEntity.ok(new BaseResponse<>(
            new TokenResponse(newAccessToken, newRefreshToken),
            "Token refreshed"
        ));
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(new BaseResponse<>(null, "Invalid refresh token"));
}
```

---

## 5. Thay đổi Login Response

Đảm bảo endpoint login trả về cả `accessToken` và `refreshToken`:

```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

Frontend sẽ lưu cả hai:

- `localStorage.setItem('accessToken', data.accessToken)`
- `localStorage.setItem('refreshToken', data.refreshToken)`

---

## 6. Token Claims (JWT Payload)

Đảm bảo `accessToken` chứa:

- `exp` (expiration time) - để frontend kiểm tra hết hạn
- `username` - hoặc `sub`
- `role` - hoặc `roles`, `authorities`

```json
{
  "sub": "username",
  "exp": 1234567890,
  "role": "ROLE_USER",
  "iat": 1234567800
}
```

---

## 7. Notes

- **Refresh Token TTL**: Thường dài hơn Access Token (e.g., 7 ngày)
- **Access Token TTL**: Thường ngắn (e.g., 15 phút, 1 giờ)
- **Rotation**: Có thể rotate refresh token trên mỗi lần refresh
- **Blacklist**: Có thể maintain blacklist tokens sau khi logout
