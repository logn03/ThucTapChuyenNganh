// category.js
// ==========================
// config & fetch helper
// ==========================
const API_BASE = "http://localhost:8080/api/v1/categorys";

function getToken() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Bạn chưa đăng nhập!");
    throw new Error("Chưa có access token");
  }
  return token;
}

async function fetchWithToken(url, options = {}) {
  const token = getToken();
  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
  const res = await fetch(url, options);

  if (res.status === 401) {
    alert("Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
    window.location.href = "../index.html";
    throw new Error("Unauthorized");
  }

  // nếu status 204 No Content thì trả về null
  if (res.status === 204) return null;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

// ==========================
// Helpers DOM
// ==========================
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

// ==========================
// Load danh mục gốc vào sidebar
// ==========================
async function loadRootCategories() {
  const sidebar = document.getElementById("categorySidebar");
  if (!sidebar) return;
  sidebar.innerHTML = "";

  try {
    const response = await fetchWithToken(`${API_BASE}/root`);
    const categories = response.data || [];

    categories.forEach(cat => {
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.textContent = cat.name;
      li.dataset.id = cat.id;

      li.addEventListener("click", () => {
        // highlight
        qsa("#categorySidebar li").forEach(item => item.classList.remove('active'));
        li.classList.add('active');

        // load con của parent vào bảng
        loadChildrenTable(cat.id);
      });

      sidebar.appendChild(li);
    });

    // populate parent selects (for add/edit forms)
    await populateParentSelects();

  } catch (error) {
    console.error("Lỗi tải danh mục gốc:", error);
    sidebar.innerHTML = '<li class="list-group-item text-danger">Lỗi tải danh mục</li>';
  }
}

// ==========================
// Load danh mục con & hiển thị bảng
// ==========================
async function loadChildrenTable(parentId) {
  try {
    const response = await fetchWithToken(`${API_BASE}/${parentId}`);
    const childCategories = response.data || [];

    const tbody = document.getElementById("productTableBody");
    tbody.innerHTML = "";

    if (!childCategories.length) {
      tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Danh mục này không có dữ liệu.</td>
        <td class="text-center">
          <button class="btn btn-danger btn-delete-root" data-id="${parentId}">
          <i class="ri-delete-bin-line"></i> Xóa thư mục chính</button>
      </td>
      </tr>`;
      // Bắt sự kiện XÓA ROOT CATEGORY
      const rootDeleteBtn = qs(".btn-delete-root");
      if (rootDeleteBtn) {
        rootDeleteBtn.addEventListener("click", async () => {
          const id = rootDeleteBtn.dataset.id;

          if (!confirm("Bạn chắc chắn muốn xoá danh mục gốc này?")) return;

          await deleteRootCategory(id);
        });
      }
      return;
    }

    childCategories.forEach((cat, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${cat.id}</td>
        <td>${escapeHtml(cat.name)}</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>
          <div class="btn-group" role="group">
           <button type="button" class="btnEd  me-2 rounded-pill btn-edit-category" data-id="${cat.id}" >Edit</button>
           <button type="button" class="btnDl rounded-pill btn-delete-category" data-id="${cat.id}" >Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach handlers (delegation simpler: find buttons)
    qsa('.btn-edit-category').forEach(b => {
      b.removeEventListener('click', onEditClick);
      b.addEventListener('click', onEditClick);
    });
    qsa('.btn-delete-category').forEach(b => {
      b.removeEventListener('click', onDeleteClick);
      b.addEventListener('click', onDeleteClick);
    });

  } catch (error) {
    console.error(`Lỗi khi tải danh mục con của ID ${parentId}:`, error);
    const tbody = document.getElementById("productTableBody");
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
  }
}

// ==========================
// Edit / Delete handlers
// ==========================
function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function onEditClick(e) {
  const id = e.currentTarget.dataset.id;
  if (!id) return;
  try {
    const pageResp = await fetchWithToken(`${API_BASE}?page=0&size=100`);
    const items = pageResp.data?.content || pageResp.data || [];
    const target = items.find(x => String(x.id) === String(id));

    let detail = target || null;
    if (!detail) {
      const rootsResp = await fetchWithToken(`${API_BASE}/root`);
      const roots = rootsResp.data || [];
      for (const r of roots) {
        const childrenResp = await fetchWithToken(`${API_BASE}/${r.id}`);
        const ch = childrenResp.data || [];
        const f = ch.find(x => String(x.id) === String(id));
        if (f) { detail = f; break; }
      }
    }

    if (!detail) {
      alert("Không tìm thấy chi tiết danh mục trên server.");
      return;
    }

    qs('#editCategoryId').value = detail.id;
    qs('#editCategoryName').value = detail.name || '';
    qs('#editCategoryDescription').value = detail.description || '';

    const parentSelect = qs('#editCategoryParent');
    if (detail.parent && detail.parent.id) {
      parentSelect.value = detail.parent.id;
    } else {
      parentSelect.value = '';
    }


    const modalEl = document.getElementById('editCategoryModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

  } catch (err) {
    console.error('Lỗi khi mở edit modal:', err);
    alert('Lỗi khi lấy dữ liệu để chỉnh sửa.');
  }
}

async function onDeleteClick(e) {
  const id = e.currentTarget.dataset.id;
  if (!id) return;
  if (!confirm('Bạn có chắc muốn xóa category này?')) return;

  try {
    const res = await fetchWithToken(`${API_BASE}/${id}`, { method: 'DELETE' });
    alert('Xóa thành công');

    // --- CẬP NHẬT BẢNG CON NGAY ---
    const activeLi = qs('#categorySidebar li.active');
    if (activeLi) {
      // reload chỉ bảng con của parent hiện tại
      await loadChildrenTable(activeLi.dataset.id);
    } else {
      // Nếu không có parent active, reload danh mục gốc
      await loadRootCategories();
      document.getElementById('productTableBody').innerHTML = '';
    }

  } catch (err) {
    console.error('Xóa thất bại:', err);
    alert('Xóa thất bại. Kiểm tra console.');
  }
}


// ==========================
// Add/Edit parent selects
// ==========================
async function populateParentSelects() {
  try {
    // Lấy root categories
    const rootsResp = await fetchWithToken(`${API_BASE}/root`);
    const roots = rootsResp.data || [];

    const newSel = qs('#newCategoryParent');
    const editSel = qs('#editCategoryParent');

    if (newSel) newSel.innerHTML = '<option value="">-- Là danh mục gốc --</option>';
    if (editSel) editSel.innerHTML = '<option value="">-- Không có parent --</option>';

    roots.forEach(c => {
      const opt = `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
      if (newSel) newSel.insertAdjacentHTML('beforeend', opt);
      if (editSel) editSel.insertAdjacentHTML('beforeend', opt);
    });

  } catch (err) {
    console.warn('populateParentSelects error:', err);
  }
}


async function onAddCategoryClick() {
  const name = qs('#newCategoryName').value.trim();
  const desc = qs('#newCategoryDescription').value.trim();
  const parent = qs('#newCategoryParent').value || null;

  if (!name) {
    alert('Vui lòng nhập tên danh mục');
    return;
  }

  try {
    const body = {
      name,
      description: desc,
      parent: parent ? parseInt(parent) : null
    };

    await fetchWithToken(API_BASE, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    alert('Thêm danh mục thành công');
    qs('#addCategoryForm').reset();

    // --- UPDATE BẢNG CON NGAY ---
    // Nếu có parent đang active trên sidebar, reload bảng con của parent đó
    const activeLi = qs('#categorySidebar li.active');
    if (activeLi) {
      loadChildrenTable(activeLi.dataset.id);
    } else {
      // Nếu chưa chọn parent, chỉ reload sidebar gốc
      await loadRootCategories();
    }

  } catch (err) {
    console.error('Thêm danh mục lỗi:', err);
    alert('Thêm thất bại. Kiểm tra console.');
  }
}

// xóa thư mục cha 
// gọi api xóa thư mục cha
async function deleteRootCategory(id) {
  try {
    const response = await fetchWithToken(`${API_BASE}/${id}`, {
      method: "DELETE"
    });

    // Backend DELETE trả về 204 → response = null
    if (response !== null && response.success === false) {
      alert(response.message || "Không thể xoá danh mục.");
      return;
    }

    alert("Đã xoá danh mục thành công!");

    // 🔥 Load lại sidebar danh mục gốc
    await loadRootCategories();

    // 🔥 Reset bảng bên phải
    document.getElementById("productTableBody").innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Hãy chọn một danh mục.</td>
      </tr>
    `;

  } catch (error) {
    console.error("Lỗi xoá root:", error);
    alert("Xoá thất bại.");
  }
}





// ==========================
// Save edit
// ==========================
async function onSaveEditCategory() {
  const id = qs('#editCategoryId').value;
  const name = qs('#editCategoryName').value.trim();
  const desc = qs('#editCategoryDescription').value.trim();
  const parent = qs('#editCategoryParent').value || null;
  if (!name) {
    alert('Tên không được bỏ trống');
    return;
  }
  try {
    const body = {};
    body.name = name;
    body.description = desc;
    // backend expects CreateCategoryRequest with parent field maybe named "parent"
    if (parent) body.parent = parseInt(parent);

    const res = await fetchWithToken(`${API_BASE}/${id}`, {
      method: 'PUT', // Note: backend currently has POST (create) and DELETE; if no PUT endpoint, use POST to create or PATCH endpoint. Adjust accordingly.
      body: JSON.stringify(body)
    });

    alert('Cập nhật thành công');
    // hide modal
    const modalEl = document.getElementById('editCategoryModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    await loadRootCategories();
    document.getElementById('productTableBody').innerHTML = '';
  } catch (err) {
    console.error('Cập nhật thất bại:', err);
    alert('Cập nhật thất bại. Kiểm tra console.');
  }
}

// ==========================
// Init & event bindings
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  // mount add form above sidebar if container exists
  const sidebar = document.getElementById('categorySidebar');
  if (sidebar) {
    const addContainer = document.getElementById('categoryAddContainer');
    if (addContainer) sidebar.parentNode.insertBefore(addContainer, sidebar);
  }

  // Bind add button
  const btnAdd = qs('#btnAddCategory');
  if (btnAdd) {
    btnAdd.addEventListener('click', onAddCategoryClick);
  }

  // Bind save edit button
  const btnSaveEdit = qs('#btnSaveEditCategory');
  if (btnSaveEdit) {
    btnSaveEdit.addEventListener('click', onSaveEditCategory);
  }

  // Initial load
  loadRootCategories();
});
