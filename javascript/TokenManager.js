// TokenManager.js - Quản lý token và tự động refresh

const BACKEND_URL = 'http://localhost:8080';

/**
 * Refresh token nếu hết hạn
 * @returns {Promise<string|null>} accessToken mới hoặc null nếu refresh thất bại
 */
export const RefreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      console.warn('Không có refreshToken');
      return null;
    }

    console.log('Attempting to refresh token...');
    
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      body: JSON.stringify({ refreshToken })
    });

    if (response.status === 401) {
      console.warn('Refresh token hết hạn, cần đăng nhập lại');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/html/index.html';
      return null;
    }

    if (!response.ok) {
      console.error('Refresh token thất bại:', response.status);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/html/index.html';
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken || data.accessToken;
    const newRefreshToken = data.data?.refreshToken || data.refreshToken;

    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      console.log('Token refreshed successfully');
      return newAccessToken;
    }

    return null;
  } catch (err) {
    console.error('Error refreshing token:', err);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/html/index.html';
    return null;
  }
};

/**
 * Kiểm tra token đã hết hạn hay chưa
 * @param {string} token - JWT token
 * @returns {boolean} true nếu đã hết hạn
 */
export const IsTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000; // Convert to ms
    return Date.now() >= expiresAt;
  } catch (err) {
    console.error('Error parsing token:', err);
    return true;
  }
};

/**
 * Fetch wrapper với tự động refresh token
 * @param {string} url - URL để gọi
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export const FetchWithTokenRefresh = async (url, options = {}) => {
  let accessToken = localStorage.getItem('accessToken');

  // Kiểm tra token hết hạn
  if (accessToken && IsTokenExpired(accessToken)) {
    console.log('Access token hết hạn, đang refresh...');
    accessToken = await RefreshAccessToken();
    
    if (!accessToken) {
      throw new Error('Không thể refresh token');
    }
  }

  // Thêm Authorization header nếu có token
  if (accessToken) {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Gọi API
  let response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Nếu nhận 401, thử refresh token và retry
  if (response.status === 401) {
    console.log('Nhận 401, đang thử refresh token...');
    const newAccessToken = await RefreshAccessToken();
    
    if (!newAccessToken) {
      return response; // Trả về 401 response nếu refresh thất bại
    }

    // Retry request với token mới
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${newAccessToken}`;
    
    response = await fetch(url, {
      ...options,
      headers: options.headers
    });
  }

  return response;
};
