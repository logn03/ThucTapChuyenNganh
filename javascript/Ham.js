// Định nghĩa các hàm

// Hiển thị / ẩn mật khẩu
export const togglePassword = (input, icon) => {
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("ri-eye-line", "ri-eye-off-line");
  } else {
    input.type = "password";
    icon.classList.replace("ri-eye-off-line", "ri-eye-line");
  }
};

// Mở form
export const openForm = (form, overlay) => {
  form.classList.add("active");
  overlay.classList.add("active");
  document.body.classList.add("no-scroll");
};

// Đóng form
export const closeForm = (form, overlay) => {
  form.classList.remove("active");
  overlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
};

// Chuyển trang
export const redirectTo = (url) => {
  window.location.href = url;
};

// Bật/tắt menu
export const toggleMenu = (menu, icon) => {
  menu.classList.toggle("active");
  icon.classList.toggle("ri-menu-line");
  icon.classList.toggle("ri-close-large-line");
};

// Bật/tắt submenu
export const toggleSubMenu = (submenu, arrow) => {
  submenu.classList.toggle("active");
  arrow.classList.toggle("xoay");
};


