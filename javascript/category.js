// category.js - FINAL VERSION (Cập nhật logic EDIT sản phẩm)
// ==========================
// Config & fetch helper
// ==========================
const API_BASE = "http://localhost:8080/api/v1/categorys";
const PRODUCT_API = "http://localhost:8080/api/products"; 

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

  if (res.status === 204) return null;

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

// ==========================
// DOM Helpers
// ==========================
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Mở modal thêm sản phẩm và thiết lập Category ID.
 */
function openAddProductForm(categoryId) {
  qs("#productCategoryId").value = categoryId;
  qs("#productName").value = "";
  qs("#productDescription").value = "";
  qs("#productBasePrice").value = "";
  qs("#variantContainer").innerHTML = "";
  qs("#imageContainer").innerHTML = "";

  const modalEl = qs("#addProductModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Gắn sự kiện riêng cho nút add variant trong modal này
  const btnVariant = modalEl.querySelector("#btnAddVariant");
  btnVariant?.addEventListener("click", () => {
    const container = modalEl.querySelector("#variantContainer"); 
    const div = document.createElement("div");
    div.className = "mb-2 d-flex gap-2 flex-wrap align-items-center"; 
    div.innerHTML = `
      <input type="text" class="form-control variantSize" style="flex: 1 1 15%" placeholder="Size (M, L)" required>
      <input type="text" class="form-control variantColor" style="flex: 1 1 15%" placeholder="Màu sắc" required>
      <input type="number" class="form-control variantPrice" style="flex: 1 1 15%" placeholder="Giá" required>
      <input type="number" class="form-control variantStock" style="flex: 1 1 15%" placeholder="Tồn kho" required>
      <input type="text" class="form-control variantSku" style="flex: 1 1 25%" placeholder="SKU (Mã Variant)" >
      <button type="button" class="btn btn-danger btn-sm btnRemoveVariant" style="flex: 0 0 5%">Xóa</button>
    `;
    container.appendChild(div);

    div.querySelector(".btnRemoveVariant")?.addEventListener("click", () => div.remove());
  });

  // Tự động thêm 1 biến thể khi modal mở
  btnVariant?.click();
}

/**
 * Mở modal chỉnh sửa sản phẩm (Chỉ cho phép sửa Tên, Mô tả, Giá cơ bản)
 */
async function openEditProductModal(productId) {
    const modalEl = qs("#editProductModal");
    const modal = new bootstrap.Modal(modalEl);
    
    // Đảm bảo nút Save/Update được cập nhật listener mới nhất
    const btnSaveProduct = qs("#btnSaveProduct");
    // Clone nút để xóa tất cả các listener cũ
    const newBtnSaveProduct = btnSaveProduct.cloneNode(true);
    btnSaveProduct.replaceWith(newBtnSaveProduct);

    try {
        // 1. Lấy dữ liệu sản phẩm
        const res = await fetchWithToken(`${PRODUCT_API}/${productId}`);
        const p = res.data;

        // 2. Điền dữ liệu vào form EDIT
        qs("#editName").value = p.name ?? "";
        qs("#editDescription").value = p.description ?? "";
        qs("#editBasePrice").value = p.baseprice ?? "";
        
        // Các trường bị khóa (Category Name)
        qs("#editCategoryName").value = p.categoryName ?? "Không rõ";

        // Gắn ID sản phẩm và Category ID
        newBtnSaveProduct.setAttribute("data-product-id", productId);
        newBtnSaveProduct.setAttribute("data-category-id", p.categoryId); 
        
        // Ẩn/hiện modal
        modal.show();

        // 3. Xử lý sự kiện LƯU (PUT request)
        newBtnSaveProduct.addEventListener("click", async () => {
            const updatedName = qs("#editName").value.trim();
            const updatedDescription = qs("#editDescription").value.trim();
            const updatedBasePrice = parseFloat(qs("#editBasePrice").value) || 0;
            const categoryId = parseInt(newBtnSaveProduct.getAttribute("data-category-id"));
            
            if (!updatedName) return alert("Tên sản phẩm không được để trống!");
            if (updatedBasePrice <= 0) return alert("Giá cơ bản phải lớn hơn 0!");

            // Chỉ gửi 3 trường được phép sửa
            const reqBody = {
                name: updatedName,
                description: updatedDescription,
                baseprice: updatedBasePrice
            };

            try {
                await fetchWithToken(`${PRODUCT_API}/${productId}`, {
                    method: "PUT",
                    body: JSON.stringify(reqBody)
                });
                alert("Cập nhật sản phẩm thành công!");
                modal.hide();
                // Load lại danh sách sản phẩm của danh mục hiện tại
                loadProductsByCategory(categoryId); 
            } catch (err) {
                console.error(err);
                alert("Cập nhật thất bại! Vui lòng kiểm tra console.");
            }
        });

    } catch (err) {
        console.error(err);
        alert("Lỗi tải dữ liệu sản phẩm để chỉnh sửa");
        modal.hide();
    }
}


// ==========================
// Lắng nghe sự kiện FORM SẢN PHẨM (THÊM MỚI)
// ==========================

// Thêm variant
qs("#btnAddVariant")?.addEventListener("click", () => {
  const container = qs("#variantContainer"); 
  const div = document.createElement("div");
  div.className = "mb-2 d-flex gap-2 flex-wrap align-items-center"; 
  div.innerHTML = `
    <input type="text" class="form-control variantSize" style="flex: 1 1 15%" placeholder="Size (M, L)" required>
    <input type="text" class="form-control variantColor" style="flex: 1 1 15%" placeholder="Màu sắc" required>
    <input type="number" class="form-control variantPrice" style="flex: 1 1 15%" placeholder="Giá" required>
    <input type="number" class="form-control variantStock" style="flex: 1 1 15%" placeholder="Tồn kho" required>
    <input type="text" class="form-control variantSku" style="flex: 1 1 25%" placeholder="SKU (Mã Variant)">
    <button type="button" class="btn btn-danger btn-sm btnRemoveVariant" style="flex: 0 0 5%">Xóa</button>
  `;
  container.appendChild(div);

  div.querySelector(".btnRemoveVariant")?.addEventListener("click", () => div.remove());
});

// Thêm ảnh
qs("#btnAddImage")?.addEventListener("click", () => {
  const container = qs("#imageContainer");
  const div = document.createElement("div");
  div.className = "mb-2 d-flex gap-2";
  div.innerHTML = `
    <input type="text" class="form-control imageUrl" placeholder="URL ảnh" required>
    <button type="button" class="btn btn-danger btn-sm btnRemoveImage">Xóa</button>
  `;
  container.appendChild(div);

  div.querySelector(".btnRemoveImage")?.addEventListener("click", () => div.remove());
});

// Gửi tạo sản phẩm
qs("#btnSubmitProduct")?.addEventListener("click", async () => {
  const categoryId = parseInt(qs("#productCategoryId").value);
  const name = qs("#productName").value.trim();
  const description = qs("#productDescription").value.trim();
  const baseprice = parseFloat(qs("#productBasePrice").value) || 0;

  // === THU THẬP DỮ LIỆU BIẾN THỂ VÀ SKU ===
  const variantSizes = qsa(".variantSize");
  const variantColors = qsa(".variantColor");
  const variantPrices = qsa(".variantPrice");
  const variantStocks = qsa(".variantStock");
  // Lưu ý: variantSkus không được sử dụng ở đây

  const variants = variantSizes.map((el, i) => ({
    // Tên trường phải khớp chính xác với CreateProductVariantRequest
    size: el.value.trim(),
    color: variantColors[i].value.trim(),
    price: parseFloat(variantPrices[i].value) || 0,
    quantityInStock: parseInt(variantStocks[i].value)
  }));
  // ======================================

  const imageUrls = qsa(".imageUrl").map(el => el.value.trim());

  if (!name) return alert("Tên sản phẩm không được để trống!");
  if (baseprice <= 0) return alert("Giá cơ bản phải lớn hơn 0!");
  const reqBody = { categoryId, name, description, baseprice, variants, imageUrls };

  try {
    // Sử dụng POST lên PRODUCT_API (/api/products)
    await fetchWithToken(PRODUCT_API, {
      method: "POST",
      body: JSON.stringify(reqBody)
    });
    alert("Tạo sản phẩm thành công!");
    bootstrap.Modal.getInstance(qs("#addProductModal"))?.hide();

    loadProductsByCategory(categoryId);
  } catch (err) {
    console.error(err);
    alert("Tạo sản phẩm thất bại! Vui lòng kiểm tra console hoặc log server.");
  }
});


// ==========================
// Load root categories as accordion
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
      li.className = "list-group-item list-group-item-action d-flex flex-column";
      li.dataset.id = cat.id;

      // Header cha
      const headerDiv = document.createElement("div");
      headerDiv.className = "d-flex justify-content-between align-items-center";
      headerDiv.innerHTML = `
        <span>${escapeHtml(cat.name)}</span>
        <div>
          <i class="ri-delete-bin-line text-danger me-2 btn-delete-category" style="cursor:pointer" data-id="${cat.id}"></i>
          <i class="ri-arrow-down-s-line toggle-icon" style="cursor:pointer;"></i>
        </div>
      `;
      li.appendChild(headerDiv);

      // Container danh mục con
      const childrenContainer = document.createElement("ul");
      childrenContainer.className = "list-group list-group-flush ms-3 mt-1 collapse";
      li.appendChild(childrenContainer);

      // Xử lý click header để load danh mục con
      headerDiv.querySelector(".toggle-icon")?.addEventListener("click", async () => {
        const isShown = childrenContainer.classList.contains("show");
        if (isShown) {
          childrenContainer.classList.remove("show");
        } else {
          childrenContainer.innerHTML = "<li class='list-group-item'>Đang tải...</li>";
          try {
            const childResp = await fetchWithToken(`${API_BASE}/${cat.id}`);
            const children = childResp.data || [];

            if (!children.length) {
              childrenContainer.innerHTML = "<li class='list-group-item text-muted'>Không có danh mục con</li>";
            } else {
              childrenContainer.innerHTML = "";
              children.forEach(child => {
                const childLi = document.createElement("li");
                childLi.className = "list-group-item d-flex justify-content-between align-items-center";
                childLi.innerHTML = `
                  <span>${escapeHtml(child.name)}</span>
                  <div>
                    <i class="ri-delete-bin-line text-danger btn-delete-category" style="cursor:pointer" data-id="${child.id}"></i>
                    <button class="btn btn-sm btn-info btn-view-products" data-id="${child.id}">Xem SP</button>
                    <button class="btn btn-sm btn-success btn-add-product" data-id="${child.id}"><i class="ri-add-circle-line"></i></button>
                  </div>
                `;
                childrenContainer.appendChild(childLi);
              });

              // Gắn sự kiện xem sản phẩm
              qsa(".btn-view-products", childrenContainer).forEach(btn => {
                btn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  loadProductsByCategory(btn.dataset.id);
                });
              });

              // GẮN SỰ KIỆN THÊM SẢN PHẨM
              qsa(".btn-add-product", childrenContainer).forEach(btn => {
                btn.addEventListener("click", (e) => {
                  e.stopPropagation();
                  openAddProductForm(btn.dataset.id);
                });
              });

              // Gắn xóa con
              qsa(".btn-delete-category", childrenContainer).forEach(btn => {
                btn.addEventListener("click", onDeleteCategoryClick);
              });
            }
          } catch (err) {
            console.error(err);
            childrenContainer.innerHTML = "<li class='list-group-item text-danger'>Lỗi tải danh mục con</li>";
          }
          childrenContainer.classList.add("show");
        }
      });

      // Xóa cha
      headerDiv.querySelector(".btn-delete-category")?.addEventListener("click", onDeleteCategoryClick);

      sidebar.appendChild(li);
    });

    // Populate parent selects for add/edit
    await populateParentSelects();

  } catch (error) {
    console.error("Lỗi tải danh mục gốc:", error);
    sidebar.innerHTML = '<li class="list-group-item text-danger">Lỗi tải danh mục</li>';
  }
}

// ==========================
// Delete category
// ==========================
async function onDeleteCategoryClick(e) {
  e.stopPropagation();
  const id = e.currentTarget.dataset.id;
  if (!id || !confirm('Bạn có chắc muốn xóa danh mục này?')) return;

  try {
    await fetchWithToken(`${API_BASE}/${id}`, { method: 'DELETE' });
    alert('Xóa thành công');
    await loadRootCategories();
  } catch (err) {
    console.error(err);
    alert('Xóa thất bại. Kiểm tra console.');
  }
}

// ==========================
// Load products by category
// ==========================
async function loadProductsByCategory(categoryId) {
  const tbody = qs("#productTableBody");
  tbody.innerHTML = "<tr><td colspan='6'>Đang tải...</td></tr>";

  try {
    const res = await fetchWithToken(`${PRODUCT_API}/categories/${categoryId}/products`);
    const products = res.data.content || [];

    if (!products.length) {
      tbody.innerHTML = "<tr><td colspan='6'>Không có sản phẩm</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    products.forEach((p, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <th scope="row">${idx+1}</th>
        <td>${p.productId}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.baseprice}</td>
        <td><button class="btn btn-sm btn-primary btn-view-detail" data-id="${p.productId}">Xem chi tiết</button></td>
        <td>
          <button class="btn btn-sm btn-warning btn-edit-product" data-id="${p.productId}">Edit</button>
          <button class="btn btn-sm btn-danger btn-delete-product" data-id="${p.productId}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Gắn sự kiện xem chi tiết
    qsa(".btn-view-detail").forEach(btn => {
      btn.addEventListener("click", () => loadProductDetail(btn.dataset.id));
    });

    // GẮN SỰ KIỆN EDIT PRODUCT MỚI (CHỈ CHO PHÉP SỬA 3 TRƯỜNG CƠ BẢN)
    qsa(".btn-edit-product").forEach(btn => {
      btn.addEventListener("click", () => {
        const productId = btn.dataset.id;
        openEditProductModal(productId);
      });
    });

    // Gắn sự kiện Delete product
    qsa(".btn-delete-product").forEach(btn => {
      btn.addEventListener("click", async () => {
        const productId = btn.dataset.id;
        if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;

        try {
          await fetchWithToken(`${PRODUCT_API}/${productId}`, { method: "DELETE" });
          alert("Xóa sản phẩm thành công!");
          loadProductsByCategory(categoryId);
        } catch (err) {
          console.error(err);
          alert("Xóa sản phẩm thất bại. Kiểm tra console.");
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='6' class='text-danger'>Lỗi tải sản phẩm</td></tr>";
  }
}


// ==========================
// Load product detail
// ==========================
async function loadProductDetail(productId) {
  const modalEl = qs("#productDetailModal");
  const contentEl = qs("#productDetailContent");
  const modal = new bootstrap.Modal(modalEl);

  contentEl.innerHTML = "Đang tải...";

  try {
    const res = await fetchWithToken(`${PRODUCT_API}/${productId}`);
    const p = res.data;

    // Build danh sách biến thể dưới dạng table
    let variantsHtml = "";
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      variantsHtml = `
        <table class="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Size</th>
              <th>Color</th>
              <th>Price</th>
              <th>Stock</th>
              <th>SKU</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
      `;
      p.variants.forEach(v => {
        variantsHtml += `
          <tr>
            <td>${escapeHtml(v.size)}</td>
            <td>${escapeHtml(v.color)}</td>
            <td>${v.price}</td>
            <td>${v.quantityInStock}</td>
            <td>${escapeHtml(v.sku)}</td>
            <td>
              <button class="btn btn-sm btn-warning btn-edit-variant" data-id="${v.productVariantId}" data-product="${p.productId}">Edit</button>
              <button class="btn btn-sm btn-danger btn-delete-variant" data-id="${v.productVariantId}" data-product="${p.productId}">Delete</button>
            </td>
          </tr>
        `;
      });
      variantsHtml += `</tbody></table>`;
    } else {
      variantsHtml = "<p>Không có biến thể</p>";
    }

    contentEl.innerHTML = `
      <h5>${escapeHtml(p.name)}</h5>
      <p><strong>Mã SP:</strong> ${p.productId}</p>
      <p><strong>Giá cơ bản:</strong> ${p.baseprice}</p>
      <p><strong>Mô tả:</strong> ${escapeHtml(p.description)}</p>
      <p><strong>Danh mục:</strong> ${p.categoryName}</p>
      <p><strong>Biến thể:</strong></p>
      ${variantsHtml}
    `;

    // Hiển thị modal
    modal.show();


    // Sự kiện edit/delete variant
    contentEl.querySelectorAll(".btn-edit-variant").forEach(btn => {
      btn.addEventListener("click", () => {
        alert("Edit variant " + btn.dataset.id + " - Chức năng này cần được phát triển thêm.");
      });
    });
    contentEl.querySelectorAll(".btn-delete-variant").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (confirm("Xóa variant này?")) {
          try {
            await fetchWithToken(`${PRODUCT_API}/${btn.dataset.product}/variants/${btn.dataset.id}`, { method: 'DELETE' });
            alert("Xóa variant thành công");
            loadProductDetail(btn.dataset.product);
          } catch (err) {
            console.error(err);
            alert("Xóa variant thất bại.");
          }
        }
      });
    });

  } catch (err) {
    console.error(err);
    contentEl.innerHTML = "<p class='text-danger'>Lỗi tải chi tiết sản phẩm</p>";
  }
}



// ==========================
// Populate parent selects
// ==========================
async function populateParentSelects() {
  try {
    const rootsResp = await fetchWithToken(`${API_BASE}/root`);
    const roots = rootsResp.data || [];
    const newSel = qs('#newCategoryParent');
    if (newSel) newSel.innerHTML = '<option value="">-- Là danh mục gốc --</option>';

    roots.forEach(c => {
      const opt = `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
      if (newSel) newSel.insertAdjacentHTML('beforeend', opt);
    });
  } catch (err) {
    console.warn(err);
  }
}

// *************** LƯU Ý: Hàm này đã BỊ XÓA (openEditProduct cũ) ***************
// *************** Chức năng Edit sản phẩm được thay thế bằng openEditProductModal ***************


// ==========================
// Add category
// ==========================
async function onAddCategoryClick() {
  const name = qs('#newCategoryName').value.trim();
  const desc = qs('#newCategoryDescription').value.trim();
  const parent = qs('#newCategoryParent').value || null;

  if (!name) return alert('Vui lòng nhập tên danh mục');

  try {
    const body = { name, description: desc };
    if (parent) body.parent = parseInt(parent);

    await fetchWithToken(API_BASE, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    alert('Thêm danh mục thành công');
    qs('#addCategoryForm')?.reset();
    loadRootCategories();

  } catch (err) {
    console.error(err);
    alert('Thêm thất bại. Kiểm tra console.');
  }
}

// ==========================
// Init
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  qs('#btnAddCategory')?.addEventListener('click', onAddCategoryClick);
  loadRootCategories();
});