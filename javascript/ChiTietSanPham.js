// ChiTietSanPham.js
// Hãy đảm bảo file này được link vào ChiTietSanPham.html

// ================================
// Cấu hình API & DOM Elements
// ================================
const PRODUCT_API_URL = 'http://localhost:8080/api/v1/products';

// Lấy các phần tử DOM cần thiết
const productNameElement = document.getElementById('product-name');
const basePriceElement = document.getElementById('base-price');
const productDescriptionElement = document.getElementById('product-description');
const mainProductImageElement = document.getElementById('main-product-image');
const thumbnailImagesContainer = document.getElementById('thumbnail-images');
const colorOptionsContainer = document.getElementById('color-options');
const sizeOptionsContainer = document.getElementById('size-options');
const quantityInput = document.getElementById('quantity-input');
const decreaseQtyButton = document.getElementById('decrease-qty');
const increaseQtyButton = document.getElementById('increase-qty');
const addToCartButton = document.getElementById('btn-add-to-cart');

// Biến State
let currentProduct = null;
let selectedColor = null; // Lưu giá trị chuỗi màu, ví dụ: "Đen"
let selectedSize = null;   // Lưu giá trị chuỗi size, ví dụ: "M"

// ================================
// Hàm tiện ích
// ================================

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function formatPrice(price) {
    if (price === undefined || price === null) return 'N/A';
    return `${Number(price).toLocaleString('vi-VN')} VND`;
}

/**
 * Tìm ProductVariant phù hợp với màu và size đã chọn.
 * @returns {Object|null} ProductVariant Object hoặc null
 */
function getSelectedVariant() {
    if (!currentProduct || !selectedColor || !selectedSize) return null;
    
    return currentProduct.variants.find(v => 
        v.color.toLowerCase() === selectedColor.toLowerCase() && 
        v.size.toLowerCase() === selectedSize.toLowerCase()
    );
}

/**
 * Cập nhật giao diện và giá khi lựa chọn thay đổi (color/size).
 */
function updateProductUI() {
    const selectedVariant = getSelectedVariant();
    
    // Reset giá và số lượng tối đa
    basePriceElement.textContent = formatPrice(currentProduct.baseprice); // Mặc định là giá gốc

    if (selectedVariant) {
        // Cập nhật giá theo Variant
        basePriceElement.textContent = formatPrice(selectedVariant.price);
        
        // Cập nhật tồn kho (có thể hiển thị thông báo)
        const stock = selectedVariant.quantityInStock;
        
        addToCartButton.disabled = stock <= 0;
        if (stock <= 0) {
            addToCartButton.textContent = 'Hết hàng';
            console.warn('Sản phẩm hết hàng với lựa chọn này.');
        } else {
            addToCartButton.textContent = 'Add to Cart';
            // Đảm bảo quantityInput không vượt quá stock
            let currentQty = parseInt(quantityInput.value) || 1;
            if (currentQty > stock) {
                quantityInput.value = stock;
            }
        }
    } else {
        // Không tìm thấy biến thể phù hợp
        basePriceElement.textContent = formatPrice(currentProduct.baseprice) + ' (Không khả dụng)';
        addToCartButton.disabled = true;
        addToCartButton.textContent = 'Chọn thuộc tính';
    }
}


// ================================
// Logic hiển thị ảnh
// ================================

function renderImages(images, productName) {
    thumbnailImagesContainer.innerHTML = '';
    
    const defaultImageUrl = (images && images.length > 0) ? images[0].imageURL : '/default-image.jpg';
    mainProductImageElement.src = defaultImageUrl;
    mainProductImageElement.alt = productName || 'Ảnh sản phẩm';

    images.forEach((image, index) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('thumbnail-wrapper', 'mb-3');
        
        const img = document.createElement('img');
        img.src = image.imageURL;
        img.alt = `Thumbnail ${index + 1}`;
        img.classList.add('img-fluid', 'product-thumb');
        
        if (index === 0) {
            img.classList.add('selected-thumb');
        }

        img.addEventListener('click', () => changeMainImage(img));
        
        wrapper.appendChild(img);
        thumbnailImagesContainer.appendChild(wrapper);
    });
}

// Hàm này phải được định nghĩa toàn cục hoặc bên ngoài DOMContentLoaded
window.changeMainImage = (clickedThumb) => {
    document.querySelectorAll('.product-thumb').forEach(thumb => {
        thumb.classList.remove('selected-thumb');
    });
    clickedThumb.classList.add('selected-thumb');
    mainProductImageElement.src = clickedThumb.src;
};

// ================================
// Logic hiển thị lựa chọn
// ================================

/**
 * Phân tích danh sách biến thể để lấy danh sách màu duy nhất
 * @param {Array<Object>} variants Danh sách ProductVariant
 * @returns {Array<string>} Danh sách màu duy nhất
 */
function extractUniqueColors(variants) {
    const colors = variants.map(v => v.color).filter(c => c && c.trim() !== '');
    return [...new Set(colors)]; // Lấy các giá trị duy nhất
}

/**
 * Phân tích danh sách biến thể để lấy danh sách size duy nhất
 * @param {Array<Object>} variants Danh sách ProductVariant
 * @returns {Array<string>} Danh sách size duy nhất
 */
function extractUniqueSizes(variants) {
    const sizes = variants.map(v => v.size).filter(s => s && s.trim() !== '');
    return [...new Set(sizes)];
}

/**
 * Render tùy chọn màu sắc
 * @param {Array<string>} uniqueColors Mảng chuỗi màu
 */
function renderColors(uniqueColors) {
    colorOptionsContainer.innerHTML = '';
    if (!uniqueColors || uniqueColors.length === 0) {
        colorOptionsContainer.innerHTML = '<span class="text-muted">Không có tùy chọn màu</span>';
        selectedColor = null;
        return;
    }

    uniqueColors.forEach(color => {
        // Giả định màu là tên (ví dụ: Đen, Trắng). Bạn cần CSS để tạo hình tròn màu tương ứng
        const colorDiv = document.createElement('div');
        colorDiv.classList.add('color-option', 'me-2');
        // Thêm một lớp dựa trên tên màu để styling (nếu cần)
        colorDiv.setAttribute('data-color', color);
        colorDiv.setAttribute('title', color);
        colorDiv.textContent = color.substring(0, 1); // Hiển thị chữ cái đầu

        colorDiv.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            colorDiv.classList.add('selected');
            selectedColor = color;
            updateProductUI();
        });
        
        colorOptionsContainer.appendChild(colorDiv);
    });

    // Tự động chọn màu đầu tiên
    if (uniqueColors.length > 0) {
        colorOptionsContainer.querySelector('.color-option').click();
    }
}

/**
 * Render tùy chọn kích thước
 * @param {Array<string>} uniqueSizes Mảng chuỗi size
 */
function renderSizes(uniqueSizes) {
    sizeOptionsContainer.innerHTML = '';
    if (!uniqueSizes || uniqueSizes.length === 0) {
        sizeOptionsContainer.innerHTML = '<span class="text-muted">Không có tùy chọn kích thước</span>';
        selectedSize = null;
        return;
    }

    uniqueSizes.forEach(size => {
        const sizeBtn = document.createElement('button');
        sizeBtn.classList.add('btn', 'btn-outline-secondary', 'me-2', 'mb-2');
        sizeBtn.textContent = size;
        sizeBtn.setAttribute('data-size', size);

        sizeBtn.addEventListener('click', () => {
            document.querySelectorAll('#size-options button').forEach(opt => opt.classList.remove('active'));
            sizeBtn.classList.add('active');
            selectedSize = size;
            updateProductUI();
        });
        
        sizeOptionsContainer.appendChild(sizeBtn);
    });
    
    // Tự động chọn kích thước đầu tiên
    if (uniqueSizes.length > 0) {
        sizeOptionsContainer.querySelector('button').click();
    }
}

// ================================
// Xử lý logic nghiệp vụ
// ================================

function setupQuantityControls() {
    // ... (Logic Quantity giữ nguyên)
    let currentQty = parseInt(quantityInput.value) || 1;

    decreaseQtyButton.addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            quantityInput.value = currentQty;
            updateProductUI(); // Cập nhật lại UI sau khi thay đổi (để check stock)
        }
    });

    increaseQtyButton.addEventListener('click', () => {
        const selectedVariant = getSelectedVariant();
        const maxStock = selectedVariant ? selectedVariant.quantityInStock : Infinity;
        
        if (currentQty < maxStock) {
            currentQty++;
            quantityInput.value = currentQty;
            updateProductUI(); // Cập nhật lại UI sau khi thay đổi (để check stock)
        }
    });

    quantityInput.addEventListener('change', () => {
        const selectedVariant = getSelectedVariant();
        const maxStock = selectedVariant ? selectedVariant.quantityInStock : Infinity;

        let val = parseInt(quantityInput.value);
        if (isNaN(val) || val < 1) {
            val = 1;
        } else if (val > maxStock) {
            val = maxStock > 0 ? maxStock : 1; // Giới hạn số lượng
        }
        currentQty = val;
        quantityInput.value = currentQty;
        updateProductUI(); 
    });
}

function setupAddToCartButton() {
    // Nút đã được bắt sự kiện click ở setupProductDetail
}

// ================================
// Fetch & Render Chi tiết sản phẩm
// ================================

async function fetchAndRenderProductDetail() {
    const productId = getUrlParameter('productId');
    
    if (!productId) {
        productNameElement.textContent = 'Lỗi: Không tìm thấy ID sản phẩm';
        basePriceElement.textContent = '';
        return;
    }

    try {
        const url = `${PRODUCT_API_URL}/${productId}`;
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonResponse = await response.json();
        const product = jsonResponse?.data;
        currentProduct = product; // Lưu sản phẩm vào state

        if (!product) {
            productNameElement.textContent = `Sản phẩm có ID ${productId} không tồn tại.`;
            return;
        }

        // 1. Render thông tin cơ bản
        productNameElement.textContent = product.name;
        productDescriptionElement.textContent = product.description || 'Đang cập nhật mô tả.';
        basePriceElement.textContent = formatPrice(product.baseprice); // Giá gốc/mặc định

        // 2. Render ảnh (sử dụng trường 'images')
        renderImages(product.images || [], product.name);

        // 3. Phân tích và Render tùy chọn (sử dụng trường 'variants')
        const uniqueColors = extractUniqueColors(product.variants || []);
        const uniqueSizes = extractUniqueSizes(product.variants || []);
        
        renderColors(uniqueColors);
        renderSizes(uniqueSizes); 
        
        // 4. Thiết lập điều khiển số lượng
        setupQuantityControls();
        
        // 5. Thiết lập nút mua hàng
        addToCartButton.addEventListener('click', () => {
            const variant = getSelectedVariant();
            const quantity = parseInt(quantityInput.value);
            
            if (!variant) {
                alert('Vui lòng chọn Màu sắc và Kích thước hợp lệ!');
                return;
            }
            if (quantity < 1) {
                alert('Số lượng phải lớn hơn 0.');
                return;
            }
            if (quantity > variant.quantityInStock) {
                alert(`Chỉ còn ${variant.quantityInStock} sản phẩm trong kho.`);
                return;
            }

            // --- Logic Thêm vào Giỏ hàng thực tế ---
            console.log({
                message: 'Đã thêm vào giỏ hàng!',
                productId: productId,
                productVariantId: variant.productVariantId,
                color: variant.color,
                size: variant.size,
                price: variant.price,
                quantity: quantity
            });
            alert(`Đã thêm ${quantity} sản phẩm ${product.name} (${variant.color}, ${variant.size}) vào giỏ hàng.`);
            // Thực hiện logic gọi API thêm vào giỏ hàng ở đây
        });


    } catch (err) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', err);
        productNameElement.textContent = 'Không thể tải chi tiết sản phẩm. Vui lòng kiểm tra kết nối API.';
        basePriceElement.textContent = '';
    }
}

// ================================
// Khởi tạo
// ================================
document.addEventListener('DOMContentLoaded', fetchAndRenderProductDetail);