//giá
const MuitenGia = document.querySelector(".PiceItem i")
const TitlePrice = document.getElementById("PriceItem");
const ContentPrice = document.getElementById("Price");
//màu
const MuitenMau = document.querySelector(".Color i")
const TitleColor = document.getElementById("TitleColor");
const ContentColor = document.getElementById("ContentColor");
//size
const MuitenSize = document.querySelector(".Size i")
const TitleSize = document.getElementById("TitleSize");
const ContentSize = document.getElementById("ContenSize");

// Hàm Ẩn hiện thanh giá tiền của sidebars start
const AnHien = function(title, contents, muiten){
    title.addEventListener('click', () => {
        contents.classList.toggle('show');
        muiten.classList.toggle('xoay');
    });
}
// Hàm Ẩn hiện thanh giá tiền của sidebars end
AnHien(TitlePrice,ContentPrice,MuitenGia);
AnHien(TitleColor,ContentColor,MuitenMau);
AnHien(TitleSize,ContentSize,MuitenSize);




// ẩn hiện cho sidebars mobile start
const BtnSideBarMobile = document.getElementById("BtnSideBarMobile");
const Sidebar = document.getElementById("Sidebars");
const IconFilter = document.getElementById("IconFilter");
BtnSideBarMobile.addEventListener('click', () => {
    Sidebar.classList.toggle('show');
    IconFilter.classList.toggle("ri-sound-module-line");
    IconFilter.classList.toggle("ri-close-large-line");
});
// Nhấn icon X để đóng sidebar
IconFilter.addEventListener('click', () => {
    if (Sidebar.classList.contains('show')) {
        Sidebar.classList.remove('show');
        IconFilter.classList.remove("ri-close-large-line");
        IconFilter.classList.add("ri-sound-module-line");
    }
});
// ẩn hiện cho sidebars mobile end






// ================================
// Cấu hình API
// ================================
const CATEGORY_API_URL = 'http://localhost:8080/api/v1/categorys';
const PRODUCT_API_URL = 'http://localhost:8080/api/v1/products';
const PAGE_SIZE = 9;

// ================================
// Biến quản lý state phân trang
// ================================
let currentPage = 0;
let totalPages = 0;
let currentCategoryId = null;

const categoryListContainer = document.getElementById('CategoryListContainer');
const productListElement = document.getElementById('product-list');
const phanTrangContainer = document.querySelector('.PhanTrang');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// ================================
// Render danh mục
// ================================
function createParentCategoryElement(category) {
    const parentDiv = document.createElement('div');
    parentDiv.classList.add('parent-category', 'py-2');
    parentDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center category-header" data-category-id="${category.id}">
            <h2 class="category-name clickable-parent-name">${category.name}</h2>
            <div class="category-actions">
                <i style="font-size: 25px;" class="ri-arrow-right-s-line toggle-children"></i>
            </div>
        </div>
        <div class="child-category-list ps-3 mt-1" style="display: none;"></div>
    `;
    
    // 1. Sự kiện cho MŨI TÊN (chỉ mở/đóng danh mục con)
    const toggleIcon = parentDiv.querySelector('.toggle-children');
    // Thay vì gọi toggleChildren, chúng ta sẽ tạo một hàm mới chỉ làm nhiệm vụ toggle UI
    toggleIcon.addEventListener('click', () => toggleChildrenUI(parentDiv, category));
    
    // 2. Sự kiện cho TÊN DANH MỤC CHA (tải sản phẩm)
    const categoryName = parentDiv.querySelector('.clickable-parent-name');
    categoryName.addEventListener('click', () => {
        // Tải sản phẩm của danh mục cha VÀ con
        fetchAndRenderProductsFromParent(category);
        highlightSelectedCategory(categoryName); // Bạn có thể muốn highlight tên danh mục cha
    });

    return parentDiv;
}

function createChildCategoryElement(child) {
    const childDiv = document.createElement('div');
    childDiv.classList.add('child-category-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1');
    childDiv.setAttribute('data-id', child.id);
    childDiv.innerHTML = `<span class="category-name" style="font-size: 16px;">${child.name}</span>`;
    childDiv.addEventListener('click', () => {
        fetchAndRenderProducts(0, child.id);
        highlightSelectedCategory(childDiv);
    });
    return childDiv;
}

async function loadChildren(parentCategory, childrenContainer) {
    try {
        const response = await fetch(`${CATEGORY_API_URL}/${parentCategory.id}`, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('Lỗi khi tải danh mục con');

        const data = (await response.json()).data;
        childrenContainer.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(child => childrenContainer.appendChild(createChildCategoryElement(child)));
        } else {
            childrenContainer.innerHTML = `<div class="text-muted fst-italic" style="font-size:16px;">Danh mục chưa có thông tin</div>`;
        }
        childrenContainer.setAttribute('data-loaded', 'true');
    } catch (err) {
        console.error('Lỗi tải danh mục con:', err);
        childrenContainer.innerHTML = `<div class="text-danger fst-italic">Không tải được dữ liệu</div>`;
    }
}

// ================================
// Toggles danh mục con UI (chỉ cho mũi tên)
// ================================
function toggleChildrenUI(parentDiv, parentCategory) {
    const childrenContainer = parentDiv.querySelector('.child-category-list');
    const toggleIcon = parentDiv.querySelector('.toggle-children');

    const isVisible = childrenContainer.style.display !== 'none';
    const isLoaded = childrenContainer.getAttribute('data-loaded') === 'true';

    if (isVisible) {
        childrenContainer.style.display = 'none';
        toggleIcon.classList.remove('xoay');
    } else {
        childrenContainer.style.display = 'block';
        toggleIcon.classList.add('xoay');
        if (!isLoaded) loadChildren(parentCategory, childrenContainer);
        // KHÔNG CÓ LOGIC TẢI SẢN PHẨM Ở ĐÂY
    }
}

async function loadRootCategories() {
    try {
        const response = await fetch(`${CATEGORY_API_URL}/root`, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('Không load được danh mục gốc');

        const rootCategories = (await response.json()).data;
        categoryListContainer.innerHTML = '';
        if (rootCategories && rootCategories.length > 0) {
            rootCategories.forEach(cat => categoryListContainer.appendChild(createParentCategoryElement(cat)));
        } else {
            categoryListContainer.innerHTML = '<p class="text-center text-muted">Chưa có danh mục nào.</p>';
        }
    } catch (err) {
        console.error('Lỗi tải danh mục gốc:', err);
        categoryListContainer.innerHTML = `<p class="text-danger">Lỗi: ${err.message}</p>`;
    }
}

// ================================
// Render sản phẩm
// ================================
function formatPrice(price) {
    return `${price.toLocaleString('vi-VN')} VND`;
}

function renderProduct(product) {
    const imageUrl = (product.images && product.images.length > 0) ? product.images[0].url : 'default-image.jpg';
    return `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="product-item">
                <div class="product-image-wrapper">
                    <img src="${imageUrl}" alt="${product.name}" class="img-fluid product-image">
                    <div class="BoxMuaNgay">MUA NGAY</div>
                </div>
                <div class="product-details text-center mt-2">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price"><strong>${formatPrice(product.baseprice)}</strong></p>
                </div>
            </div>
        </div>
    `;
}

async function fetchAndRenderProducts(page = 0, categoryId = null) {
    currentPage = page;
    currentCategoryId = categoryId;

    const url = categoryId ? `${PRODUCT_API_URL}/categories/${categoryId}/products?page=${page}&size=${PAGE_SIZE}`
                           : `${PRODUCT_API_URL}?page=${page}&size=${PAGE_SIZE}`;

    try {
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const jsonResponse = await response.json();
        const pageData = jsonResponse?.data;
        const productData = pageData?.content ?? [];
        totalPages = pageData?.totalPages ?? 0;

        productListElement.innerHTML = productData.length > 0
            ? productData.map(renderProduct).join('')
            : '<p class="col-12 text-center text-muted">Không tìm thấy sản phẩm nào.</p>';

        renderPagination();
    } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        productListElement.innerHTML = '<p class="col-12 text-center text-danger">Không thể tải sản phẩm. Kiểm tra API.</p>';
    }
}

// ================================
// Fetch tất cả sản phẩm của category cha (bao gồm con)
// ================================
async function fetchAndRenderProductsFromParent(parentCategory) {
    try {
        // Lấy danh sách con
        const response = await fetch(`${CATEGORY_API_URL}/${parentCategory.id}`, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error('Lỗi tải danh mục con');
        const children = (await response.json()).data;

        // Bao gồm cả parentId
        const allCategoryIds = [parentCategory.id];
        if (children && children.length > 0) {
            children.forEach(c => allCategoryIds.push(c.id));
        }

        // Gọi API riêng cho từng category con + parent (không thể gộp backend)
        const fetches = allCategoryIds.map(id => fetch(`${PRODUCT_API_URL}/categories/${id}/products?page=0&size=100`, { headers: { 'Content-Type': 'application/json' } }));
        const results = await Promise.all(fetches);

        let products = [];
        for (let res of results) {
            if (res.ok) {
                const data = (await res.json()).data;
                products = products.concat(data?.content ?? []);
            }
        }

        productListElement.innerHTML = products.length > 0
            ? products.map(renderProduct).join('')
            : '<p class="col-12 text-center text-muted">Không tìm thấy sản phẩm nào.</p>';

        currentPage = 0;
        totalPages = 1;
        renderPagination();

    } catch (err) {
        console.error('Lỗi khi tải sản phẩm category cha:', err);
        productListElement.innerHTML = '<p class="col-12 text-center text-danger">Không thể tải sản phẩm category cha.</p>';
    }
}

// ================================
// Render phân trang
// ================================
function renderPagination() {
    phanTrangContainer.innerHTML = '';

    const pageLinks = [];
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 2)) {
            pageLinks.push(i);
        } else {
            if (pageLinks[pageLinks.length - 1] !== -1) pageLinks.push(-1);
        }
    }

    pageLinks.forEach(i => {
        if (i === -1) {
            const span = document.createElement('span');
            span.textContent = '...';
            span.classList.add('dots');
            phanTrangContainer.appendChild(span);
        } else {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = i + 1;
            if (i === currentPage) a.classList.add('active');
            a.addEventListener('click', e => {
                e.preventDefault();
                fetchAndRenderProducts(i, currentCategoryId);
            });
            phanTrangContainer.appendChild(a);
        }
    });

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 0) fetchAndRenderProducts(currentPage - 1, currentCategoryId);
});
nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages - 1) fetchAndRenderProducts(currentPage + 1, currentCategoryId);
});

// ================================
// Highlight category đang chọn
// ================================
function highlightSelectedCategory(selectedElement) {
    document.querySelectorAll('.child-category-item').forEach(item => item.classList.remove('selected'));
    selectedElement.classList.add('selected');
}

// ================================
// DOMContentLoaded
// ================================
document.addEventListener('DOMContentLoaded', () => {
    loadRootCategories();
    fetchAndRenderProducts(0, null);
});




//lọc sản phẩm 
//nút giá
const priceRadios = document.querySelectorAll('input[name="price"]');
let selectedPrice = null;

priceRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    selectedPrice = e.target.value;
    console.log("Giá đã chọn:", selectedPrice);
  });
});

// nút màu
const colorCheckboxes = document.querySelectorAll('input[name="chonmau"]');
let selectedColors = [];

colorCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    selectedColors = Array.from(colorCheckboxes)
                          .filter(cb => cb.checked)
                          .map(cb => cb.id);
    console.log("Màu đã chọn:", selectedColors);
  });
});


//nút size
const sizeButtons = document.querySelectorAll('#ContenSize button');
let selectedSize = null; // chỉ lưu 1 giá trị

sizeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Bỏ class 'active' của tất cả nút
    sizeButtons.forEach(b => b.classList.remove('active'));
    
    // Bật nút được click
    btn.classList.add('active');
    
    // Lưu giá trị
    selectedSize = btn.textContent;
    console.log("Size đã chọn:", selectedSize);
  });
});
