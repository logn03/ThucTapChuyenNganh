// Hàm tự động thêm access token và xử lý refresh token
export async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken) {
    alert("Bạn chưa đăng nhập!");
    throw new Error("Chưa có access token");
  }

  // Gắn access token vào header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  let response = await fetch(url, options);

  // Nếu token hết hạn → gọi refresh
  if (response.status === 401 && refreshToken) {
    console.warn("Access token hết hạn, đang gọi refresh...");

    const refreshResponse = await fetch('http://localhost:8080/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      const { accessToken: newAccess, refreshToken: newRefresh } = refreshData.data;

      // Cập nhật token mới
      localStorage.setItem('accessToken', newAccess);
      localStorage.setItem('refreshToken', newRefresh);

      // Gọi lại API ban đầu với token mới
      options.headers['Authorization'] = `Bearer ${newAccess}`;
      response = await fetch(url, options);
    } else {
      console.error("Refresh token không hợp lệ, đăng xuất...");
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      window.location.reload();
    }
  }

  return response;
}
