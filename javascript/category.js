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

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text}`);
    }

    return res.json();
}

// ==========================
// Load danh mục gốc vào sidebar
// ==========================
async function loadRootCategories() {
    const sidebar = document.getElementById("categorySidebar");
    sidebar.innerHTML = "";

    try {
        const response = await fetchWithToken(`${API_BASE}/root`);
        const categories = response.data;

        categories.forEach(cat => {
            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action";
            li.textContent = cat.name;
            li.dataset.id = cat.id;

            li.addEventListener("click", () => {
                // highlight
                document.querySelectorAll("#categorySidebar li").forEach(item => item.classList.remove('active'));
                li.classList.add('active');

                // load con của parent vào bảng
                loadChildrenAndProducts(cat.id);
            });

            sidebar.appendChild(li);
        });

    } catch (error) {
        console.error("Lỗi tải danh mục gốc:", error);
        sidebar.innerHTML = '<li class="list-group-item text-danger">Lỗi tải danh mục</li>';
    }
}

// ==========================
// Load danh mục con & hiển thị bảng
// ==========================
async function loadChildrenAndProducts(parentId) {
    try {
        const response = await fetchWithToken(`${API_BASE}/${parentId}`);
        const childCategories = response.data;

        const tbody = document.getElementById("productTableBody");
        tbody.innerHTML = "";

        if (!childCategories.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Danh mục này không có dữ liệu.</td></tr>';
            return;
        }

        childCategories.forEach((cat, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${cat.id}</td>
                <td>${cat.name}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(`Lỗi khi tải danh mục con của ID ${parentId}:`, error);
        const tbody = document.getElementById("productTableBody");
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>';
    }
}

// ==========================
// Init khi trang load
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    loadRootCategories();
});
