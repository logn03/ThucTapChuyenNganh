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

      userMenu.innerHTML = `
        <div class="Navigation-user-logged-in">
          <span id="displayUsername">${escapeHtml(displayName)}</span>
          <button id="btnProfile" class="btn-user">Tài khoản</button>
          <button id="btnLogout" class="btn-user">Đăng Xuất</button>
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
      // show default login/register buttons (original markup)
      userMenu.innerHTML = `
        <button id="btnLogin" class="btn-user">Đăng Nhập</button>
        <button id="btnRegister" class="btn-user">Đăng Ký</button>
      `;

      // If there are existing scripts that open forms, they will attach handlers; otherwise users can use existing page flows.
      // Try to re-attach mobile PropMenu handlers if present
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
