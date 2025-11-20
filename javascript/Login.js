import { jwtDecode } from 'jwt-decode';
import { openForm, closeForm } from './Ham.js';

// Lấy element
const overlay = document.getElementById("overlay");
const formLogin = document.getElementById("login-container");
const btnLoginSubmit = document.getElementById("btnLoginSubmit");

btnLoginSubmit.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("passwordLogin").value;

  if (!username || !password) {
    alert('Vui lòng nhập thông tin đăng nhập');
    return;
  }

  try {
    const rawResponse = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const res = await rawResponse.json();

    if (rawResponse.ok) {
      alert(res.message);

      // Lưu token vào localStorage
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Giải mã token để lấy thông tin role
      const decodedToken = jwtDecode(accessToken);
      const role = decodedToken.role || decodedToken.roles || decodedToken.authorities || "USER";

      console.log("Thông tin trong token:", decodedToken);
      console.log("Role:", role);

      // Lưu trạng thái đăng nhập và thông tin người dùng để các trang khác dùng
      const usernameFromToken = decodedToken.sub || decodedToken.username || decodedToken.user || decodedToken.name || null;
      const currentUser = { username: usernameFromToken, role };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // Đóng form đăng nhập
      closeForm(overlay, formLogin);

      // Kiểm tra role để chuyển hướng
      if (role === 'ADMIN') {
        const choice = confirm("Bạn là ADMIN. Bạn muốn vào trang quản trị (TrangAdmin.html) hay trang người dùng (TatcaSanPham.html)?\n\nBấm OK để vào trang ADMIN.\nBấm Cancel để vào trang USER.");
        if (choice) {
          window.location.href = "TrangAdmin.html";
        } else {
          window.location.href = "TatcaSanPham.html";
        }
      } else {
        // Nếu là USER thì tự động chuyển sang trang sản phẩm
        window.location.href = "TatcaSanPham.html";
      }
    } else {
      alert(res.message || 'Đăng nhập thất bại!');
    }
  } catch (error) {
  }
});
