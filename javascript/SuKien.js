import {
  togglePassword,
  openForm,
  closeForm,
  redirectTo,
  toggleMenu,
} from './Ham.js';

// Ẩn/hiện mật khẩu
export const suKienMatKhau = () => {
  const passwordInput = document.getElementById("passwordLogin");
  const eyeIcon = document.getElementById("open-eye");
  if (eyeIcon && passwordInput) {
    eyeIcon.addEventListener("click", () => togglePassword(passwordInput, eyeIcon));
  }
};

// Nút “Shop Now”
export const suKienShopNow = () => {
  const shopNow = document.getElementById("shopnow");
  if (shopNow) shopNow.addEventListener("click", () => redirectTo('./TatCaSanPham.html'));
};

// Menu mobile
export const suKienMenuMobile = () => {
  const menu = document.getElementById("Humberger-menu-mobile");
  const iconMenu = document.getElementById("Humberger-icon-open");
  if (menu && iconMenu) {
    iconMenu.addEventListener("click", () => toggleMenu(menu, iconMenu));
  }
};



// Mở form đăng nhập/đăng ký
export const suKienFormDangNhap = () => {
  const overlay = document.getElementById("overlay");
  const formLogin = document.getElementById("login-container");
  const formRegister = document.getElementById("register-container");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnHeaderLogin = document.getElementById("DangNhapHeader");
  const btnLoginMobile = document.getElementById("PropMenuUserLogin");
  const btnRegisterMobile = document.getElementById("PropMenuUserRegister");

  if (btnLogin) btnLogin.addEventListener("click", () => openForm(formLogin, overlay));
  if (btnRegister) btnRegister.addEventListener("click", () => openForm(formRegister, overlay));
  if (btnHeaderLogin) btnHeaderLogin.addEventListener("click", () => openForm(formLogin, overlay));
  if (btnLoginMobile) btnLoginMobile.addEventListener("click", () => openForm(formLogin, overlay));
  if (btnRegisterMobile) btnRegisterMobile.addEventListener("click", () => openForm(formRegister, overlay));
};

// Nút đóng form
export const suKienNutDongForm = () => {
  const overlay = document.getElementById("overlay");
  const formLogin = document.getElementById("login-container");
  const formRegister = document.getElementById("register-container");
  const iconCloseLogin = document.querySelector(".login-form-title .iconX i");
  const iconCloseRegister = document.querySelector(".register-form-title .iconX i");

  if (iconCloseLogin)
    iconCloseLogin.addEventListener("click", () => closeForm(formLogin, overlay));
  if (iconCloseRegister)
    iconCloseRegister.addEventListener("click", () => closeForm(formRegister, overlay));
  if (overlay) {
    overlay.addEventListener("click", () => {
      closeForm(formLogin, overlay);
      closeForm(formRegister, overlay);
    });
  }
};



// Hàm gọi tất cả sự kiện
export const suKien = () => {
  suKienMatKhau();
  suKienShopNow();
  suKienMenuMobile();
  suKienFormDangNhap();
  suKienNutDongForm();
};
