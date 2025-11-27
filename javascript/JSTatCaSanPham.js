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



// mở menu mobile
const SubMenuMobile = document.getElementById("Humberger-menu-mobile");
const iconHumberger = document.getElementById("Humberger-icon-open");
if(iconHumberger){
iconHumberger.addEventListener('click', () => {
  SubMenuMobile.classList.toggle("active");
    iconHumberger.classList.toggle("ri-menu-line");
    iconHumberger.classList.toggle("ri-close-large-line");
});
}
// mở submenu mobile
const showsubmenu = document.querySelectorAll(".Humberger-Submenu-Mobile");
const menuSubmenu = document.querySelectorAll("#Humberger-menu-mobile > li");
const XoayMuiTen = document.querySelectorAll("#Humberger-menu-mobile > li > a > i");

menuSubmenu.forEach((titleSubmenu, vitri) => {
  titleSubmenu.addEventListener('click', () => {
    showsubmenu[vitri].classList.toggle("active");
    XoayMuiTen[vitri].classList.toggle('xoay');
  });
});


const clickDangKy = document.getElementById("btnRegister");
const formDangKy = document.getElementById("register-container");
const overlay = document.getElementById("overlay");
const clickDangNhap = document.getElementById("btnLogin");
const formDangNhap = document.getElementById("login-container");


// HÀM ĐÓNG VÀ HÀM MỞ FORM start
const HamMoForm = (form) => {
    form.classList.add("active");
    overlay.classList.add("active");
}

const HamDongFrom = (form) => {
    form.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}


// HÀM ĐÓNG VÀ HÀM MỞ FORM end

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký start


clickDangNhap.addEventListener("click", () => {
  HamMoForm(formDangNhap);
  document.body.classList.add("no-scroll");
});

overlay.addEventListener("click", () => {
  HamDongFrom(formDangKy);
  HamDongFrom(formDangNhap);
});

clickDangKy.addEventListener("click", () => {
  HamMoForm(formDangKy);
  document.body.classList.add("no-scroll");
});



// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký end

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký mobile start
const clickDangNhapMobile = document.getElementById("PropMenuUserLogin");
const clickDangKyMobile = document.getElementById("PropMenuUserRegister");




clickDangNhapMobile.addEventListener("click", () => {
  HamMoForm(formDangNhap);
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
});

clickDangKyMobile.addEventListener("click", () => {
  HamMoForm(formDangKy);
  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
});

// Gọi hàm đóng và hàm mở form đăng nhập, đăng ký mobile end


// Icon đóng form Login
document.querySelector(".login-form-title .iconX i").addEventListener("click", () => {
  HamDongFrom(formDangNhap);
});
// Icon đóng form Register
document.querySelector(".register-form-title .iconX i").addEventListener("click", () => {
  HamDongFrom(formDangKy);
});




const OpenEye = document.getElementById("open-eye");
const PassWordInput = document.getElementById("passwordLogin");

// Hàm hiển thi mật khẩu
const ShowPassWord = (PassWordInput, OpenEye) => {
  if (PassWordInput.type === "password") {
    PassWordInput.type = "LC.Store";
    OpenEye.classList.remove("ri-eye-line");
    OpenEye.classList.add("ri-eye-off-line");
  }
  else {
    PassWordInput.type = "password";
    OpenEye.classList.remove("ri-eye-off-line");
    OpenEye.classList.add("ri-eye-line");
  }
}
// gọi hàm hiển thị mật khẩu cho mật khẩu
OpenEye.addEventListener("click", () => {
  ShowPassWord(PassWordInput, OpenEye);
});


const CATEGORY_API_URL = 'http://localhost:8080/api/v1/categorys';
const categoryListContainer = document.getElementById('CategoryListContainer');

// ================================
// Hàm fetch có kèm token
// ================================
async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("accessToken");

    return await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    });
}


// ================================
// Tạo HTML danh mục cha
// ================================
function createParentCategoryElement(category) {
    const parentDiv = document.createElement('div');
    parentDiv.classList.add('parent-category', 'py-2');

    // Tạm thời ẩn icon, sẽ kiểm tra con sau
    parentDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center category-header"
             data-category-id="${category.id}">
             
            <h2 class="category-name">${category.name}</h2>

            <div class="category-actions">
                <i style="font-size: 25px;" class="ri-arrow-right-s-line toggle-children" style="display: none;"></i>
            </div>
        </div>

        <div class="child-category-list ps-3 mt-1" style="display: none;"></div>
    `;

    const toggleIcon = parentDiv.querySelector('.toggle-children');
                toggleIcon.style.display = 'inline-block'; // hiện icon
                toggleIcon.addEventListener('click', () => {
                    toggleChildren(parentDiv, category.id);
                });
    return parentDiv;
}

// ================================
// Tạo HTML danh mục con
// ================================
// ================================
// Tạo HTML danh mục con (ĐÃ CẬP NHẬT)
// ================================
function createChildCategoryElement(child) {
    const childDiv = document.createElement('div');
    childDiv.classList.add('child-category-item', 'd-flex', 'justify-content-between', 'align-items-center', 'py-1');
    
    // Thêm Category ID vào thuộc tính data-id để truy cập sau này
    childDiv.setAttribute('data-id', child.id); 

    childDiv.innerHTML = `
        <span class="category-name" style="font-size: 16px;">${child.name}</span>
    `;
    
    // Gán sự kiện click: Khi người dùng click vào danh mục con
    childDiv.addEventListener('click', () => {
        // 1. Tải sản phẩm của danh mục đó (page 0)
        fetchProductsByCategory(child.id, 0); 
        
        // 2. (Tùy chọn) Highlight danh mục đang được chọn
        highlightSelectedCategory(childDiv);
    });

    return childDiv;
}

// ================================
// Load danh mục con
// ================================
async function loadChildren(parentId, childrenContainer) {
    try {
        const response = await fetchWithToken(`${CATEGORY_API_URL}/${parentId}`);

        if (!response.ok) throw new Error("Lỗi khi tải danh mục con");

        const responseData = await response.json();
        const children = responseData.data;

        childrenContainer.innerHTML = ""; // clear

        if (children && children.length > 0) {
            children.forEach(child => {
                childrenContainer.appendChild(createChildCategoryElement(child));
            });
        } else {
            childrenContainer.innerHTML = `
                <div class="text-muted fst-italic" style="font-size: 16px;">Danh mục chưa có thông tin</div>
            `;
        }

        // luôn đánh dấu đã load, dù có hay không có con
        childrenContainer.setAttribute('data-loaded', 'true');

    } catch (error) {
        console.error("Lỗi tải danh mục con:", error);
        childrenContainer.innerHTML = `
            <div class="text-danger fst-italic">Không tải được dữ liệu</div>
        `;
    }
}



// ================================
// Toggle hiển thị/ẩn danh mục con
// ================================
function toggleChildren(parentDiv, categoryId) {
    const childrenContainer = parentDiv.querySelector('.child-category-list');
    const toggleIcon = parentDiv.querySelector('.toggle-children');

    const isVisible = childrenContainer.style.display !== 'none';
    const isLoaded = childrenContainer.getAttribute('data-loaded') === 'true';

    if (isVisible) {
        // ẩn
        childrenContainer.style.display = 'none';
        toggleIcon.classList.remove('xoay');
    } else {
        // hiện
        childrenContainer.style.display = 'block';
        toggleIcon.classList.add('xoay');

        // load con nếu chưa load
        if (!isLoaded) {
            loadChildren(categoryId, childrenContainer);
        }
    }
}



// ================================
// Load danh mục root
// ================================
async function loadRootCategories() {
 const token = localStorage.getItem("accessToken");

    // Nếu không có token, không cố gắng tải (hoặc chuyển hướng)
    if (!token) {
        categoryListContainer.innerHTML = '<p class="text-danger">Vui lòng đăng nhập để xem danh mục.</p>';
        console.warn("Chưa có JWT Token, không thể tải danh mục.");
        return; 
    }
    
 try {
        // Sử dụng fetchWithToken như đã định nghĩa
 const response = await fetchWithToken(`${CATEGORY_API_URL}/root`);

 if (!response.ok) {
            // Xử lý lỗi 401 rõ ràng hơn nếu token hết hạn
            if (response.status === 401) {
                 throw new Error("Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
            }
            throw new Error("Không load được danh mục gốc");
        }

 const responseData = await response.json();
 const rootCategories = responseData.data;

 categoryListContainer.innerHTML = ""; // clear trước

 if (rootCategories && rootCategories.length > 0) {
  rootCategories.forEach(category => {
  categoryListContainer.appendChild(createParentCategoryElement(category));
  });
 } else {
  categoryListContainer.innerHTML = `
   <p class="text-center text-muted">Chưa có danh mục nào.</p>
  `;
 }

 } catch (error) {
  console.error("Lỗi tải danh mục gốc:", error);
  categoryListContainer.innerHTML = `
   <p class="text-danger">Lỗi: ${error.message}</p>
  `;
 }
}
// Cấu hình cơ bản (Page number bắt đầu từ 0 trong Spring Data Pageable)
const API_URL = 'http://localhost:8080/api/products'; // Thay đổi URL nếu cần
const PAGE_SIZE = 9; // 3 dòng x 3 cột = 9 sản phẩm

function formatPrice(price) {
    // Giả sử giá là $ (USD) hoặc thêm đơn vị K (kỳ vọng từ giá cũ)
    return `$${price}`; // Ví dụ: $120
}

function renderProduct(product) {
    // Sử dụng col-lg-4 (12/3 = 4) cho 3 cột trên màn hình lớn
    return `
        <div class="col-12 col-md-6 col-lg-4 mb-4">
            <div class="product-item">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid product-image">
                    <div class="BoxMuaNgay">MUA NGAY</div>
                </div>
                <div class="product-details text-center mt-2">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">
                        <strong>${formatPrice(product.baseprice)}</strong>
                        </p>
                </div>
            </div>
        </div>
    `;
}

async function fetchProducts(page = 0) {
    try {
        // Gọi API với các tham số phân trang
        const response = await fetchWithToken(`${API_URL}?page=${page}&size=${PAGE_SIZE}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        const productData = jsonResponse.data.content; // Lấy mảng sản phẩm từ cấu trúc BaseResponse và Page
        
        const productListElement = document.getElementById('product-list');
        productListElement.innerHTML = productData.map(renderProduct).join('');

        // Cập nhật phân trang (không bắt buộc, có thể làm sau)
        // updatePagination(jsonResponse.data.totalPages, page); 

    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        document.getElementById('product-list').innerHTML = '<p class="col-12 text-center text-danger">Không thể tải sản phẩm. Vui lòng kiểm tra API.</p>';
    }
}

// Chạy hàm khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(0); // Tải trang đầu tiên
});

// Thêm hàm này vào phần JavaScript của bạn, bên cạnh fetchProducts
async function fetchProductsByCategory(categoryId, page = 0) {
    const productListElement = document.getElementById('product-list');
    const url = `${API_URL}/categories/${categoryId}/products?page=${page}&size=${PAGE_SIZE}`;

    try {
        // **QUAN TRỌNG:** Phải sử dụng fetchWithToken vì endpoint này có thể được bảo vệ.
        // Tuy nhiên, nếu API sản phẩm công khai, bạn có thể dùng fetch thường. 
        // Dựa trên kinh nghiệm debug lỗi 401 trước đó, ta sẽ dùng fetchWithToken.
        const response = await fetchWithToken(url); 
        
        if (!response.ok) {
            if (response.status === 401) {
                productListElement.innerHTML = '<p class="col-12 text-center text-danger">Lỗi 401: Vui lòng đăng nhập hoặc kiểm tra quyền truy cập.</p>';
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonResponse = await response.json();
        // Kiểm tra xem dữ liệu có hợp lệ không
        if (!jsonResponse.data || !jsonResponse.data.content) {
             throw new Error("Cấu trúc dữ liệu API sản phẩm không hợp lệ.");
        }
        
        const productData = jsonResponse.data.content; 
        
        if (productData.length === 0) {
             productListElement.innerHTML = '<p class="col-12 text-center text-muted">Không tìm thấy sản phẩm nào trong danh mục này.</p>';
        } else {
             productListElement.innerHTML = productData.map(renderProduct).join('');
        }

        // Cập nhật phân trang (chưa làm)
        // updatePagination(jsonResponse.data.totalPages, page, categoryId); 

    } catch (error) {
        console.error(`Lỗi khi tải sản phẩm cho danh mục ${categoryId}:`, error);
        // Ngăn hiển thị lỗi chung nếu đã hiển thị lỗi 401/lỗi đặc biệt khác
        if (!productListElement.innerHTML.includes("401") && !productListElement.innerHTML.includes("Không tìm thấy")) {
             productListElement.innerHTML = '<p class="col-12 text-center text-danger">Lỗi kết nối hoặc dữ liệu API sản phẩm.</p>';
        }
    }
}
function highlightSelectedCategory(selectedElement) {
    // 1. Loại bỏ class 'selected' khỏi tất cả các item trước đó
    document.querySelectorAll('.child-category-item').forEach(item => {
        item.classList.remove('selected');
    });

    // 2. Thêm class 'selected' cho item được click
    selectedElement.classList.add('selected');
}

// ================================
// Bắt đầu load khi DOM sẵn sàng
// ================================
document.addEventListener('DOMContentLoaded', loadRootCategories);
