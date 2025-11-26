// ============================
// auth & user menu helper
// ============================
(function () {
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('accessToken');
  }

  function renderUserMenu() {
    const userMenu = document.getElementById('UserMenu');
    if (!userMenu) return;

    if (isLoggedIn()) {
      const user = getCurrentUser();
      const displayName = (user && user.username) ? user.username : 'Tài khoản';
      const isAdminPage = document.body.getAttribute('data-admin-page') === 'true';

      userMenu.innerHTML = `
        <div class="Navigation-user-logged-in d-flex">
          <span id="displayUsername" class="me-3 align-items-center d-flex">${escapeHtml(displayName)}</span>
          ${!isAdminPage ? '<button id="btnProfile" class="btn-user">Tài khoản</button>' : ''}
          <button id="btnLogout" class="btn-user">Đăng Xuất</button>
        </div>
      `;

      const btnLogout = document.getElementById('btnLogout');
      if (btnLogout) btnLogout.addEventListener('click', logout);

      const btnProfile = document.getElementById('btnProfile');
      if (btnProfile) {
        btnProfile.addEventListener('click', () => {
          if (user && user.role === 'ADMIN') {
            window.location.href = 'TrangAdmin.html';
          } else {
            window.location.href = 'TatCaSanPham.html';
          }
        });
      }

    } else {
      userMenu.innerHTML = `
        <button id="btnLogin" class="btn-user">Đăng Nhập</button>
        <button id="btnRegister" class="btn-user">Đăng Ký</button>
      `;
    }
  }

  function logout() {
    const accessToken = localStorage.getItem('accessToken');
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (accessToken) opts.headers['Authorization'] = 'Bearer ' + accessToken;

    // notify backend (ignore failure)
    fetch('http://localhost:8080/api/v1/auth/logout', opts).catch(() => { });

    // clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');

    window.location.href = 'TatCaSanPham.html';
  }

  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', renderUserMenu);
})();

// ============================
// category menu render
// ============================
const categoryMenu = document.getElementById("categoryMenu");
const API_ROOT_CATEGORIES = "http://localhost:8080/api/v1/categorys/root";
const API_CHILD_CATEGORIES = id => `http://localhost:8080/api/v1/categorys/${id}`;

// fetch helper với token
async function fetchData(url) {
  const accessToken = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  return data.data;
}

// đệ quy render menu multi-level
async function renderCategoryItem(category) {
  let html = `<li><a href="#">${category.name}</a>`;

  // lấy con
  const children = await fetchData(API_CHILD_CATEGORIES(category.id));
  if (children && children.length > 0) {
    html += '<ul>';
    for (const child of children) {
      html += await renderCategoryItem(child); // đệ quy
    }
    html += '</ul>';
  }

  html += '</li>';
  return html;
}

// ... (trong hàm renderCategories)
async function renderCategories() {
  if (!categoryMenu) return;

  try {
    const roots = await fetchData(API_ROOT_CATEGORIES);

    // Bắt đầu bằng <li> chứa tên DANH MỤC. Danh mục cấp 1 sẽ nằm trong <ul> lồng bên dưới.
    let html = '<ul><li class="menu-parent title"><a href="#">DANH MỤC <i class="ri-arrow-right-wide-fill"></i></a>';
    
    // Bắt đầu <ul> cho menu thả xuống cấp 1 (danh mục gốc)
    html += '<ul>'; 

    for (const root of roots) {
      // renderCategoryItem sẽ trả về <li>...</li>
      html += await renderCategoryItem(root);
    }

    html += '</ul>'; // Kết thúc <ul> cấp 1
    html += '</li></ul>'; // Kết thúc <li> và <ul> chính

    categoryMenu.innerHTML = html;

  } catch (err) {
    console.error("Cannot render categories:", err);
    categoryMenu.innerHTML = "<p>Không thể tải danh mục</p>";
  }
}


document.addEventListener('DOMContentLoaded', renderCategories);
