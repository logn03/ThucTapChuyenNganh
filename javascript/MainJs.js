import { suKien } from './SuKien.js';
import './JSTatCaSanPham.js';
import './ChiTietSanPham.js';

document.addEventListener("DOMContentLoaded", () => {
  suKien();
      // Khởi tạo logic từ cả hai file
    initializeSidebar();
    initializeProductDetails();
});
