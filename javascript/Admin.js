// Admin.js - sidebar controls + load users for TrangAdmin
import { FetchWithTokenRefresh, IsTokenExpired, RefreshAccessToken } from './TokenManager.js';

(function () {
  // Pagination state
  let currentPage = 0;
  let totalPages = 1;
  // currentSearchParams: if set, pagination should use search endpoint
  let currentSearchParams = null;
  const BACKEND_URL = 'http://localhost:8080';

  // hàm hiện sidebars khi ở ipad mobile
  const HamMoSideBars = function (sidebar, iconClose, iconhumberger) {
    if (!iconhumberger || !iconClose || !sidebar) return;
    iconhumberger.addEventListener("click", () => {
      sidebar.classList.toggle("show");
      iconClose.classList.toggle("d-lg-none");
      iconClose.classList.add("d-lg-none");
    });
  }

  // hàm tắt sidebars
  const TatSideBar = function (sidebar, iconClose) {
    if (!iconClose || !sidebar) return;
    iconClose.addEventListener("click", () => {
      sidebar.classList.remove("show");
    })
  }

  // Lấy danh sách người dùng với phân trang
  const LoadDanhSachUser = async (page = 0) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.warn('No access token found, redirect to login');
        window.location.href = '/html/index.html';
        return;
      }

      // Gọi trực tiếp backend với page param
      const url = `${BACKEND_URL}/api/v1/users?page=${page}`;
      console.log('Fetching:', url);

      const res = await FetchWithTokenRefresh(url, {
        method: 'GET'
      });

      console.log('Response status:', res.status);

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        window.location.href = '/html/index.html';
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => 'No response body');
        console.error('Failed to load users', res.status, text);
        const tbody = document.getElementById('userTableBody');
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Lỗi: ${res.status}</td></tr>`;
        }
        return;
      }

      const json = await res.json();
      console.log('Response:', json);

      // Backend trả List<User> từ page.getContent(), không phải Page object
      // Vì vậy chúng ta nhận mảng trực tiếp hoặc wrapped in data
      let users = Array.isArray(json) ? json : (json.data || json.content || []);
      
      // Vì backend không trả totalPages, ta sẽ estimate:
      // - Nếu page = 0 và có 10 users → có thể có trang tiếp
      // - Nếu có < 10 users → đó là trang cuối
      const PAGE_SIZE = 10; // Backend set @PageableDefault(size = 10)
      const hasMore = users.length === PAGE_SIZE; // Nếu = 10, có thể có trang tiếp
      const total = hasMore ? (currentPage + 2) : (currentPage + 1);

      console.log('Users count:', users.length, 'Has more:', hasMore, 'Estimated total pages:', total);

      currentPage = page;
      totalPages = total;

      const tbody = document.getElementById('userTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!Array.isArray(users) || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Không có dữ liệu người dùng</td></tr>';
        UpdatePaginationUI();
        return;
      }

      users.forEach((u, i) => {
        const isActive = u.isActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>';
        const role = u.role || (u.roles && u.roles[0]) || 'USER';

        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${u.username || ''}</td>
          <td>${u.firstName || u.firstname || ''}</td>
          <td>${u.lastName || u.lastname || ''}</td>
          <td>${u.phone || ''}</td>
          <td>${u.amount || 0}</td>
          <td>${isActive}</td>
          <td>${role}</td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          LoadUserDetail(u.username);
        });
      });

      UpdatePaginationUI();

    } catch (err) {
      console.error('Error loading users:', err);
      const tbody = document.getElementById('userTableBody');
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Lỗi: ${err.message}</td></tr>`;
      }
    }
  };

  // Update pagination UI
  const UpdatePaginationUI = () => {
    const pageNum = document.getElementById('currentPageNum');
    const totalNum = document.getElementById('totalPagesNum');
    if (pageNum) pageNum.textContent = currentPage + 1;
    if (totalNum) totalNum.textContent = totalPages;
    
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    
    if (btnPrev) btnPrev.disabled = currentPage === 0;
    if (btnNext) btnNext.disabled = currentPage >= totalPages - 1;
  };

  // Fetch and display user detail
  const LoadUserDetail = async (username) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Bạn chưa đăng nhập!');
        return;
      }

      const url = `${BACKEND_URL}/api/v1/users/${username}`;
      console.log('Loading detail:', url);

      const res = await FetchWithTokenRefresh(url, {
        method: 'GET'
      });

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Phiên đăng nhập đã hết hạn!');
        window.location.href = '/html/index.html';
        return;
      }

      if (!res.ok) {
        alert(`Lỗi tải thông tin user: ${res.status}`);
        return;
      }

      const json = await res.json();
      const user = json.data || json;

      // Populate detail panel
      const hoTen = (user.firstName || user.firstname || '') + ' ' + (user.lastName || user.lastname || '');
      document.getElementById('detailHoTen').textContent = hoTen.trim() || '-';
      document.getElementById('detailUsername').textContent = user.username || '-';
      document.getElementById('detailEmail').textContent = user.email || '-';
      document.getElementById('detailPhone').textContent = user.phone || '-';
      document.getElementById('detailAmount').textContent = user.amount || 0;
      document.getElementById('detailRole').textContent = user.role || (user.roles && user.roles[0]) || 'USER';
      document.getElementById('detailStatus').textContent = user.isActive ? 'Hoạt động' : 'Không hoạt động';

      // Set search input and show panel
      document.getElementById('searchUsername').value = username;
      document.getElementById('userDetailPanel').style.display = 'block';

      // Scroll to detail panel
      document.getElementById('userDetailPanel').scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
      console.error('Error loading user detail:', err);
      alert('Không thể tải thông tin user: ' + err.message);
    }
  };

  // Build query string from params object
  const buildQueryString = (params) => {
    const usp = new URLSearchParams();
    Object.keys(params || {}).forEach(key => {
      const v = params[key];
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        usp.append(key, v);
      }
    });
    return usp.toString();
  };

  // Search users using filter endpoint (returns Page<User>)
  const SearchUsers = async (page = 0, params = null) => {
    try {
      // if params provided, set as currentSearchParams
      if (params) currentSearchParams = params;

      // ensure we have search params
      const searchParams = currentSearchParams || {};
      searchParams.page = page;
      // set page size explicitly to 10
      if (!searchParams.size) searchParams.size = 10;

      const qs = buildQueryString(searchParams);
      const url = `${BACKEND_URL}/api/v1/users/search?${qs}`;
      console.log('Search URL:', url);

      const res = await FetchWithTokenRefresh(url, { method: 'GET' });

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
        window.location.href = '/html/index.html';
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => 'No response body');
        console.error('Search users failed', res.status, text);
        const tbody = document.getElementById('userTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Lỗi tìm kiếm: ${res.status}</td></tr>`;
        return;
      }

      const json = await res.json();
      // Expecting BaseResponse<Page<User>> or Page<User>
      const pageData = (json.data && json.data.content !== undefined) ? json.data : (json.content !== undefined ? json : (json.data || {}));
      const users = pageData.content || [];
      const tbody = document.getElementById('userTableBody');
      if (!tbody) return;
      tbody.innerHTML = '';

      if (!Array.isArray(users) || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Không có dữ liệu người dùng</td></tr>';
        // set pagination
        currentPage = pageData.number || 0;
        totalPages = pageData.totalPages || 1;
        UpdatePaginationUI();
        return;
      }

      users.forEach((u, i) => {
        const isActive = u.isActive ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>';
        const role = u.role || (u.roles && u.roles[0]) || 'USER';

        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${i + 1}</td>
          <td>${u.username || ''}</td>
          <td>${u.firstName || u.firstname || ''}</td>
          <td>${u.lastName || u.lastname || ''}</td>
          <td>${u.phone || ''}</td>
          <td>${u.amount || 0}</td>
          <td>${isActive}</td>
          <td>${role}</td>
        `;
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          LoadUserDetail(u.username);
        });
      });

      // update pagination from pageData
      currentPage = pageData.number || 0;
      totalPages = pageData.totalPages || (users.length === 10 ? currentPage + 2 : currentPage + 1);
      UpdatePaginationUI();

    } catch (err) {
      console.error('Error searching users:', err);
      const tbody = document.getElementById('userTableBody');
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Lỗi: ${err.message}</td></tr>`;
    }
  };

  // Setup UI and events when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    const clickHumberger = document.getElementById("toggleSidebar");
    const clickCloseSideBars = document.getElementById("IconClose");
    const sidebar = document.getElementById("sidebars");

    HamMoSideBars(sidebar, clickCloseSideBars, clickHumberger);
    TatSideBar(sidebar, clickCloseSideBars);

    LoadDanhSachUser(0);

    // Pagination button handlers
    const btnPrev = document.getElementById('btnPrevPage');
    const btnNext = document.getElementById('btnNextPage');
    
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        console.log('Prev clicked: currentPage =', currentPage, 'totalPages =', totalPages);
        if (currentPage > 0) {
          console.log('Loading page', currentPage - 1);
          if (currentSearchParams) {
            SearchUsers(currentPage - 1);
          } else {
            LoadDanhSachUser(currentPage - 1);
          }
        } else {
          console.log('Already on first page');
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        console.log('Next clicked: currentPage =', currentPage, 'totalPages =', totalPages);
        if (currentPage < totalPages - 1) {
          console.log('Loading page', currentPage + 1);
          if (currentSearchParams) {
            SearchUsers(currentPage + 1);
          } else {
            LoadDanhSachUser(currentPage + 1);
          }
        } else {
          console.log('Already on last page');
        }
      });
    }

    // Search button handler
    const btnSearch = document.getElementById('btnSearch');
    if (btnSearch) {
      btnSearch.addEventListener('click', () => {
        const username = document.getElementById('searchUsername').value.trim();
        if (username) {
          LoadUserDetail(username);
        } else {
          alert('Vui lòng nhập username!');
        }
      });
    }

    // Set Admin button handler
    const btnSetAdmin = document.getElementById('btnSetAdmin');
    if (btnSetAdmin) {
      btnSetAdmin.addEventListener('click', () => {
        const username = document.getElementById('searchUsername').value.trim();
        if (!username) {
          alert('Vui lòng chọn user trước!');
          return;
        }
        SetUserAdmin(username);
      });
    }

    // Delete button handler
    const btnDelete = document.getElementById('btnDelete');
    if (btnDelete) {
      btnDelete.addEventListener('click', () => {
        const username = document.getElementById('searchUsername').value.trim();
        if (!username) {
          alert('Vui lòng chọn user trước!');
          return;
        }
        if (confirm(`Bạn chắc chắn muốn xóa user "${username}"? Hành động này không thể hoàn tác!`)) {
          DeleteUser(username);
        }
      });
    }

    // Edit toggle button handler - Opens modal
    const btnEditToggle = document.getElementById('btnEditToggle');
    
    if (btnEditToggle) {
      btnEditToggle.addEventListener('click', () => {
        const username = document.getElementById('searchUsername').value.trim();
        if (!username) {
          alert('Vui lòng chọn user trước!');
          return;
        }
        
        // Populate modal with current values
        const firstName = document.getElementById('detailHoTen').textContent.split(' ')[0] || '';
        const lastName = document.getElementById('detailHoTen').textContent.split(' ').slice(1).join(' ') || '';
        
        document.getElementById('modalEditFirstName').value = firstName;
        document.getElementById('modalEditLastName').value = lastName;
        document.getElementById('modalEditEmail').value = document.getElementById('detailEmail').textContent;
        document.getElementById('modalEditPhone').value = document.getElementById('detailPhone').textContent;
        document.getElementById('modalEditAmount').value = document.getElementById('detailAmount').textContent;
        document.getElementById('modalEditIsActive').value = document.getElementById('detailStatus').textContent === 'Hoạt động' ? 'true' : 'false';
      });
    }

    // Update button handler (in modal)
    const btnModalUpdate = document.getElementById('btnModalUpdate');
    if (btnModalUpdate) {
      btnModalUpdate.addEventListener('click', () => {
        const username = document.getElementById('searchUsername').value.trim();
        if (!username) {
          alert('Vui lòng chọn user trước!');
          return;
        }
        UpdateUser(username);
      });
    }

    // Filter modal controls
    const btnOpenFilter = document.getElementById('btnOpenFilter');
    const filterModalEl = document.getElementById('filterUserModal');
    const filterModal = filterModalEl ? new bootstrap.Modal(filterModalEl) : null;
    const btnFilterSearch = document.getElementById('btnFilterSearch');
    const btnFilterClear = document.getElementById('btnFilterClear');
    const btnClearFilterToolbar = document.getElementById('btnClearFilter');

    if (btnOpenFilter && filterModal) {
      btnOpenFilter.addEventListener('click', () => {
        // populate fields from currentSearchParams if exists
        const p = currentSearchParams || {};
        document.getElementById('filterUsername').value = p.username || '';
        document.getElementById('filterEmail').value = p.email || '';
        document.getElementById('filterFirstName').value = p.firstName || '';
        document.getElementById('filterLastName').value = p.lastName || '';
        document.getElementById('filterPhone').value = p.phone || '';
        filterModal.show();
      });
    }

    if (btnFilterSearch) {
      btnFilterSearch.addEventListener('click', () => {
        const username = document.getElementById('filterUsername').value.trim();
        const email = document.getElementById('filterEmail').value.trim();
        const firstName = document.getElementById('filterFirstName').value.trim();
        const lastName = document.getElementById('filterLastName').value.trim();
        const phone = document.getElementById('filterPhone').value.trim();

        // Basic validations per DTO
        if (email && (email.length < 6 || email.length > 30 || !email.includes('@'))) {
          alert('Email không hợp lệ (6-30 ký tự, phải có @)');
          return;
        }
        if (phone) {
          const phoneRegex = /^(0|\+84)\d{9,10}$/;
          if (!phoneRegex.test(phone)) {
            alert('Số điện thoại không hợp lệ!');
            return;
          }
        }

        const params = {};
        if (username) params.username = username;
        if (email) params.email = email;
        if (firstName) params.firstName = firstName;
        if (lastName) params.lastName = lastName;
        if (phone) params.phone = phone;

        // run search
        currentSearchParams = params;
        SearchUsers(0, params);
        if (filterModal) filterModal.hide();
      });
    }

    if (btnFilterClear) {
      btnFilterClear.addEventListener('click', () => {
        // clear form
        document.getElementById('filterUsername').value = '';
        document.getElementById('filterEmail').value = '';
        document.getElementById('filterFirstName').value = '';
        document.getElementById('filterLastName').value = '';
        document.getElementById('filterPhone').value = '';
        // clear active filter
        currentSearchParams = null;
        if (filterModal) filterModal.hide();
        LoadDanhSachUser(0);
      });
    }

    if (btnClearFilterToolbar) {
      btnClearFilterToolbar.addEventListener('click', () => {
        currentSearchParams = null;
        // clear visible filter inputs if present
        const f = document.getElementById('filterForm');
        if (f) f.reset();
        LoadDanhSachUser(0);
      });
    }
  });


  // Delete user
  const DeleteUser = async (username) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Bạn chưa đăng nhập!');
        return;
      }

      const url = `${BACKEND_URL}/api/v1/users/${username}`;
      console.log('Deleting user:', url);

      const res = await FetchWithTokenRefresh(url, {
        method: 'DELETE'
      });

      console.log('Delete response status:', res.status);

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Phiên đăng nhập đã hết hạn!');
        window.location.href = '/html/index.html';
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => 'No response body');
        alert(`Lỗi xóa user: ${res.status}`);
        console.error('Delete error:', text);
        return;
      }

      const json = await res.json();
      console.log('Delete response:', json);
      alert('Xóa user thành công: ' + username);
      
      // Clear detail panel
      document.getElementById('userDetailPanel').style.display = 'none';
      document.getElementById('searchUsername').value = '';
      
      // Reload danh sách user
      LoadDanhSachUser(currentPage);

    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Không thể xóa user: ' + err.message);
    }
  };

  // Set user as admin
  const SetUserAdmin = async (username) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Bạn chưa đăng nhập!');
        return;
      }

      const url = `${BACKEND_URL}/api/v1/users/set-admin`;
      console.log('Setting admin for:', username);

      const res = await FetchWithTokenRefresh(url, {
        method: 'POST',
        body: JSON.stringify({ username: username })
      });

      console.log('Set Admin response status:', res.status);

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Phiên đăng nhập đã hết hạn!');
        window.location.href = '/html/index.html';
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => 'No response body');
        alert(`Lỗi set admin: ${res.status}`);
        console.error('Set Admin error:', text);
        return;
      }

      const json = await res.json();
      console.log('Set Admin response:', json);
      alert('Set Admin thành công cho ' + username);
      
      // Reload user detail sau khi set admin
      LoadUserDetail(username);
      
      // Reload danh sách user
      LoadDanhSachUser(currentPage);

    } catch (err) {
      console.error('Error setting admin:', err);
      alert('Không thể set admin: ' + err.message);
    }
  };

  // Update user
  const UpdateUser = async (username) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Bạn chưa đăng nhập!');
        return;
      }

      // Validate and collect form data from MODAL
      const firstName = document.getElementById('modalEditFirstName').value.trim();
      const lastName = document.getElementById('modalEditLastName').value.trim();
      const email = document.getElementById('modalEditEmail').value.trim();
      const phone = document.getElementById('modalEditPhone').value.trim();
      const amount = document.getElementById('modalEditAmount').value;
      const isActive = document.getElementById('modalEditIsActive').value;
      const role = document.getElementById('modalEditRole').value;

      // Validation
      if (firstName && (firstName.length < 2 || firstName.length > 150)) {
        alert('Họ phải từ 2-150 ký tự!');
        return;
      }

      if (lastName && (lastName.length < 2 || lastName.length > 150)) {
        alert('Tên phải từ 2-150 ký tự!');
        return;
      }

      if (email && (email.length < 6 || email.length > 30 || !email.includes('@'))) {
        alert('Email không hợp lệ (6-30 ký tự, phải có @)!');
        return;
      }

      if (phone) {
        const phoneRegex = /^(0|\+84)\d{9,10}$/;
        if (!phoneRegex.test(phone)) {
          alert('Số điện thoại không hợp lệ! Định dạng: 0 hoặc +84 theo sau 9-10 chữ số');
          return;
        }
      }

      // Build request body - only include fields that are not empty
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (amount !== '') updateData.amount = parseFloat(amount) || null;
      if (isActive !== '') updateData.isActive = isActive === 'true';
if (role) {
            const cleanRole = role.replace('ROLE_', '');
            updateData.role = cleanRole; 
        }

      console.log('Update data:', updateData);

      const url = `${BACKEND_URL}/api/v1/users/${username}`;
      const res = await FetchWithTokenRefresh(url, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      console.log('Update response status:', res.status);

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Phiên đăng nhập đã hết hạn!');
        window.location.href = '/html/index.html';
        return;
      }

      if (!res.ok) {
        const text = await res.text().catch(() => 'No response body');
        alert(`Lỗi cập nhật user: ${res.status}\n${text}`);
        console.error('Update error:', text);
        return;
      }

      const json = await res.json();
      console.log('Update response:', json);
      alert('Cập nhật user thành công!');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
      if (modal) {
        modal.hide();
      }
      
      // Reload user detail
      LoadUserDetail(username);
      
      // Reload danh sách user
      LoadDanhSachUser(currentPage);

    } catch (err) {
      console.error('Error updating user:', err);
      alert('Không thể cập nhật user: ' + err.message);
    }
  };

})();
