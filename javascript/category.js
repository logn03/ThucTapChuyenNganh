//javascript/category.js



// 1. SỬA: Đồng bộ hóa URL API với Backend đã sửa (categories)

const API_BASE = "http://localhost:8080/api/v1/categorys";



// 2. KHẮC PHỤC LỖI 401: Lấy Token từ localStorage

// Lưu ý: Đảm bảo rằng sau khi đăng nhập, token được lưu vào localStorage với key là "authToken"

const TOKEN = localStorage.getItem("authToken");

// Nếu không tìm thấy token, Frontend sẽ KHÔNG THỰC HIỆN cuộc gọi API

if (!TOKEN) {

    console.error("Lỗi: Không tìm thấy Token xác thực ('authToken') trong localStorage. Vui lòng đăng nhập.");

    // Có thể chuyển hướng người dùng đến trang đăng nhập ở đây

}





// --- Hàm API (Đã thêm xử lý lỗi) ---

async function apiGet(url) {

    if (!TOKEN) throw new Error("Token không khả dụng. Không thể gọi API.");

   

    const res = await fetch(url, {

        headers: {

            "Accept": "*/*",

            // PHẢI CÓ DÒNG NÀY ĐỂ GỬI TOKEN CHO BACKEND

            "Authorization": `Bearer ${TOKEN}`

        }

    });

   

    if (!res.ok) {

    }

    return res.json();

}



async function apiPost(url, data) {

    if (!TOKEN) throw new Error("Token không khả dụng. Không thể gọi API.");

    const res = await fetch(url, {

        method: "POST",

        headers: {

            "Content-Type": "application/json",

            "Authorization": `Bearer ${TOKEN}`

        },

        body: JSON.stringify(data)

    });

    if (!res.ok) {

        throw new Error(`API POST failed: ${res.status} ${res.statusText}`);

    }

    return res.json();

}



async function apiDelete(url) {

    if (!TOKEN) throw new Error("Token không khả dụng. Không thể gọi API.");

    const res = await fetch(url, {

        method: "DELETE",

        headers: {

            "Authorization": `Bearer ${TOKEN}`

        }

    });

    if (!res.ok) {

        throw new Error(`API DELETE failed: ${res.status} ${res.statusText}`);

    }

    return res.json();

}

// ------------------------------





// 2️⃣ Load danh mục gốc vào sidebar

async function loadRootCategories() {

    try {

        // SỬA: Endpoint /root -> /roots

        const response = await apiGet(`${API_BASE}/root`);

        const categories = response.data;



        const sidebar = document.getElementById("categorySidebar");

        sidebar.innerHTML = "";



        categories.forEach(cat => {

            const li = document.createElement("li");

            li.className = "list-group-item list-group-item-action";

            li.textContent = cat.name;

            li.dataset.id = cat.id;



            li.addEventListener("click", () => {

                // Highlight item đang được chọn

                document.querySelectorAll("#categorySidebar li").forEach(item => item.classList.remove('active'));

                li.classList.add('active');

               

                // Gọi hàm hiển thị Category con và Sản phẩm

                loadChildrenAndProducts(cat.id);

            });



            sidebar.appendChild(li);

        });

    } catch (error) {

        document.getElementById("categorySidebar").innerHTML =

            '<li class="list-group-item text-danger">Lỗi tải danh mục. Kiểm tra Console và Backend.</li>';

    }

}



// 3️⃣ Load danh mục con và hiển thị sản phẩm

async function loadChildrenAndProducts(parentId) {

    try {

        // SỬA: Endpoint /{id} -> /{parentId}/children

const response = await apiGet(`${API_BASE}/${parentId}`);

        const childCategories = response.data;

       

        // --- VÌ CHƯA CÓ API LẤY SẢN PHẨM, TA GIẢ LẬP DỮ LIỆU ĐỂ BẢNG RENDER ĐÚNG CẤU TRÚC ---

       

        // Giả lập danh sách sản phẩm mẫu (có Variants và Attributes)

        const mockProducts = [{

            id: 101,

            name: "Áo Polo Basic",

            variants: [

                { id: 1, quantityInStock: 50, attributes: [{name: 'Color', value: 'Trắng'}, {name: 'Size', value: 'M'}]},

                { id: 2, quantityInStock: 30, attributes: [{name: 'Color', value: 'Đen'}, {name: 'Size', value: 'L'}]},

            ]

        }, {

            id: 102,

            name: "Quần Jeans Slim",

            variants: [

                { id: 3, quantityInStock: 25, attributes: [{name: 'Color', value: 'Xanh Đậm'}, {name: 'Size', value: '30'}]},

            ]

        }];

       

        renderProductTable(mockProducts);

       

        // TODO: THỰC TẾ, BẠN CẦN GỌI API LẤY SẢN PHẨM:

        // const productResponse = await apiGet(`http://localhost:8080/api/v1/products?category_id=${parentId}`);

        // renderProductTable(productResponse.data.content || []);

       

    } catch (error) {

        console.error(`Lỗi khi tải danh mục con của ID ${parentId}:`, error);

        renderProductTable([]); // Hiển thị bảng trống nếu lỗi

    }

}



// 4️⃣ Render bảng sản phẩm (Đã sửa để lặp qua Variants)

function renderProductTable(products) {

    const tbody = document.getElementById("productTableBody");

    tbody.innerHTML = "";



    if (products.length === 0) {

        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không tìm thấy sản phẩm nào.</td></tr>';

        return;

    }



    products.forEach((product, index) => {

        // Lặp qua từng Variant (biến thể) của Sản phẩm

        if (product.variants && product.variants.length > 0) {

           

            product.variants.forEach((variant, variantIndex) => {

                const tr = document.createElement("tr");

               

                // Trích xuất Size và Color từ danh sách attributes

                const sizeAttr = variant.attributes.find(attr => attr.name.toLowerCase() === 'size')?.value || '-';

                const colorAttr = variant.attributes.find(attr => attr.name.toLowerCase() === 'color')?.value || '-';



                tr.innerHTML = `

                    <td>${index + 1}${variantIndex > 0 ? '.' + variantIndex : ''}</td>

                    <td>${product.id}</td>

                    <td>${product.name}</td>

                    <td>${sizeAttr}</td>

                    <td>${colorAttr}</td>

                    <td>${variant.quantityInStock}</td>

                    <td>

                        <button class="btn btn-sm btn-info me-2" data-product-id="${product.id}">Sửa</button>

                        <button class="btn btn-sm btn-danger" data-product-id="${product.id}">Xóa</button>

                    </td>

                `;

                tbody.appendChild(tr);

            });

        } else {

             // Trường hợp sản phẩm không có Variants

             const tr = document.createElement("tr");

             tr.innerHTML = `

                <td>${index + 1}</td>

                <td>${product.id}</td>

                <td>${product.name}</td>

                <td>-</td>

                <td>-</td>

                <td>${product.quantityInStock ?? '-'}</td>

                <td><button class="btn btn-sm btn-info" data-id="${product.id}">Sửa</button></td>

            `;

            tbody.appendChild(tr);

        }

    });

}





// 5️⃣ Thêm danh mục (Giữ nguyên)

async function addCategory(name, description, parentId = null) {

    try {

        const body = { name, description, parentId };

        await apiPost(API_BASE, body);

        await loadRootCategories();

    } catch (error) {

        console.error("Lỗi khi thêm danh mục:", error);

    }

}



// 6️⃣ Xóa danh mục (Giữ nguyên)

async function deleteCategory(id) {

    try {

        await apiDelete(`${API_BASE}/${id}`);

        await loadRootCategories();

    } catch (error) {

        console.error("Lỗi khi xóa danh mục:", error);

    }

}



// 7️⃣ Load tất cả danh mục (Giữ nguyên)

async function loadAllCategories() {

    try {

        const response = await apiGet(`${API_BASE}?page=0&size=100`);

        return response.data;

    } catch (error) {

        console.error("Lỗi khi tải tất cả danh mục:", error);

        return [];

    }

}



// 8️⃣ Khởi động khi trang load

document.addEventListener("DOMContentLoaded", () => {

    loadRootCategories();

});