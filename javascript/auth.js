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
          ${!isAdminPage ? '<button id="btnLogout" class="btn-user">Đăng Xuất</button>' : '<button class="btnLogoutAdmin"><div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div><div class="text">Logout</div></button>'}
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

    fetch('http://localhost:8080/api/v1/auth/logout', opts).catch(() => { });

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
// category menu render (public)
// ============================
const categoryMenu = document.getElementById("categoryMenu");
const API_ROOT_CATEGORIES = "http://localhost:8080/api/v1/categorys/root";
const API_CHILD_CATEGORIES = id => `http://localhost:8080/api/v1/categorys/${id}`;

// fetch public
async function fetchData(url) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const data = await res.json();
  return data.data;
}

// render menu đệ quy multi-level
async function renderCategoryItem(category) {
  let html = `<li><a href="#">${category.name}</a>`;

  try {
    const children = await fetchData(API_CHILD_CATEGORIES(category.id));
    if (children && children.length > 0) {
      html += '<ul>';
      for (const child of children) {
        html += await renderCategoryItem(child);
      }
      html += '</ul>';
    }
  } catch (err) {
    console.error("Cannot load child categories:", err);
  }

  html += '</li>';
  return html;
}

// render toàn bộ menu
async function renderCategories() {
  if (!categoryMenu) return;

  try {
    const roots = await fetchData(API_ROOT_CATEGORIES);
    if (!roots || roots.length === 0) {
      categoryMenu.innerHTML = "<p>Chưa có danh mục</p>";
      return;
    }

    let html = '<ul><li class="menu-parent title"><a href="#">DANH MỤC <i class="ri-arrow-right-wide-fill"></i></a><ul>';

    for (const root of roots) {
      html += await renderCategoryItem(root);
    }

    html += '</ul></li></ul>';

    categoryMenu.innerHTML = html;

  } catch (err) {
    console.error("Cannot render categories:", err);
    categoryMenu.innerHTML = "<p>Không thể tải danh mục</p>";
  }
}

document.addEventListener('DOMContentLoaded', renderCategories);
