// auth.js - simple auth state UI helper for all pages
// - Reads localStorage keys: accessToken, refreshToken, isLoggedIn, currentUser
// - Updates header `#UserMenu` to show login buttons or logged-in state
// - Implements logout: clears auth keys and reloads/redirects to index.html

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

      const isAdminPage =
        document.body.getAttribute('data-admin-page') === 'true';

      userMenu.innerHTML = `
  <div class="Navigation-user-logged-in d-flex ">
    <span id="displayUsername" class="me-3 align-items-center d-flex">${escapeHtml(displayName)}</span>
    ${isAdminPage
          ? ''  // 👉 TRANG ADMIN → KHÔNG RENDER NÚT TÀI KHOẢN
          : '<button id="btnProfile" class="btn-user">Tài khoản</button>'
        }
    ${isAdminPage
          ? '<button id="btnLogout" class="btn-user"><div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div><div class="text">Logout</div></button>' 
          : '    <button id="btnLogout" class="btn-user">Đăng Xuất</button>'
        }

    


    
  </div>
`;


      // attach handlers
      const btnLogout = document.getElementById('btnLogout');
      if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
          e.preventDefault();
          logout();
        });
      }

      const btnProfile = document.getElementById('btnProfile');
      if (btnProfile) {
        btnProfile.addEventListener('click', (e) => {
          e.preventDefault();
          // go to profile or admin if role
          const user = getCurrentUser();
          if (user && user.role === 'ADMIN') {
            window.location.href = 'TrangAdmin.html';
          } else {
            // stay on products or go to a profile page if exists
            window.location.href = 'TatCaSanPham.html';
          }
        });
      }

    } else {
      userMenu.innerHTML = `
        <button id="btnLogin" class="btn-user">Đăng Nhập</button>
        <button id="btnRegister" class="btn-user">Đăng Ký</button>
      `;


      const propLogin = document.getElementById('PropMenuUserLogin');
      const propRegister = document.getElementById('PropMenuUserRegister');
      if (propLogin) propLogin.style.display = '';
      if (propRegister) propRegister.style.display = '';
    }
  }

  function logout() {
    (async function () {
      try {
        // attempt to notify backend logout endpoint - try common paths
        const accessToken = localStorage.getItem('accessToken');
        const opts = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        if (accessToken) {
          opts.headers['Authorization'] = 'Bearer ' + accessToken;
        }

        // try /logout then /api/v1/auth/logout (ignore failures)
        try { await fetch('http://localhost:8080/logout', opts); } catch (e) { /* ignore */ }
        try { await fetch('http://localhost:8080/api/v1/auth/logout', opts); } catch (e) { /* ignore */ }
      } catch (e) {
        console.warn('Logout API call failed', e);
      } finally {
        // remove tokens and login state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');

        // redirect to product listing
        window.location.href = 'TatCaSanPham.html';
      }
    })();
  }

  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      renderUserMenu();
    } catch (e) {
      console.error('auth.js error', e);
    }
  });
})();
